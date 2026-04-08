import { useState, useEffect, useCallback, useRef, ChangeEvent } from "react";
import { Send, Bot, User, CheckCircle2, Edit3, Loader2, Search, UserCheck, Tag, AlertTriangle, Clock, Lock, ChevronUp, ArrowLeft, Zap, Paperclip, Mic, StopCircle, X, FileText } from "lucide-react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { apiClient, Conversation, Message, ResponseTemplate } from "../lib/api";
import { useSubscriptionFeatures } from "../lib/useSubscriptionFeatures";
import { useTranslation } from 'react-i18next';
import { useInboxSSE } from "../lib/useInboxSSE";

const channelIcons: Record<string, string> = {
  whatsapp: '💬',
  facebook: '👥',
  telegram: '✈️',
  webchat: '🌐',
};

export default function UnifiedInbox() {
  const { t } = useTranslation();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'needs_review'>('all');
  const [selectedMessageTag, setSelectedMessageTag] = useState('');
  const [togglingHITL, setTogglingHITL] = useState(false);
  const [dismissedSuggestionId, setDismissedSuggestionId] = useState<string | null>(null);
  const [messagesPage, setMessagesPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  // Bug #3: on mobile, track whether conversation panel or sidebar is visible
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const quickReplyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isTranscribingVoice, setIsTranscribingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const FALLBACK_TEMPLATES: ResponseTemplate[] = [
    { id: 'fallback-1', name: 'Order Confirmed', content: 'আপনার অর্ডার confirm হয়েছে ✅ Delivery: 2-3 দিন' },
    { id: 'fallback-2', name: 'Need Address', content: 'Stock আছে। Address & mobile নম্বর দিন please 🙏' },
    { id: 'fallback-3', name: 'Advance Payment', content: 'Advance ৳[Amount] bKash/Nagad করুন: 01XXXXXXXXX' },
    { id: 'fallback-4', name: 'Courier Update', content: 'আপনার পার্সেল courier এ দেওয়া হয়েছে ✈️' },
    { id: 'fallback-5', name: 'Thank You', content: 'ধন্যবাদ আপনার order এর জন্য! 😊' },
    { id: 'fallback-6', name: 'Out of Stock', content: 'এই product টা এখন stock এ নেই। 2-3 দিনের মধ্যে available হবে।' },
    { id: 'fallback-7', name: 'Delivery Charge', content: 'Dhaka তে delivery charge ৳60, Dhaka এর বাইরে ৳120।' },
    { id: 'fallback-8', name: 'Return Window', content: 'Return/exchange এর জন্য 3 দিনের মধ্যে জানাবেন please।' },
    { id: 'fallback-9', name: 'Cash on Delivery', content: 'COD available আছে। Delivery তে টাকা দিতে পারবেন।' },
    { id: 'fallback-10', name: 'Dispatch Today', content: 'আপনার product টি ready। আজকেই dispatch করব। 🚚' },
  ];
  const quickReplyTemplates = templates.length > 0 ? templates : FALLBACK_TEMPLATES;
  const { features: planFeatures } = useSubscriptionFeatures();

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    loadTemplates();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'needs_review') {
      setFilterTab('needs_review');
    }
  }, [location.search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickReplyRef.current && !quickReplyRef.current.contains(event.target as Node)) {
        setShowQuickReplies(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
    };
  }, []);

  const PAGE_SIZE = 30;

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setMessagesPage(1);
      setHasMoreMessages(false);
      loadMessages(selectedConversation.id, 1);
      setDismissedSuggestionId(null);
    }
  }, [selectedConversation?.id]);

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      setError(null);
      const result = await apiClient.getConversations({ limit: 50 });
      setConversations(result.conversations);
      if (result.conversations.length > 0 && !selectedConversation) {
        setSelectedConversation(result.conversations[0]);
      }
    } catch (err) {
      setError(t('inbox.errors.loadConversations'));
      toast.error(t('inbox.errors.loadConversations'));
      console.error('Error loading conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const rows = await apiClient.getResponseTemplates();
      setTemplates(rows.filter((tpl) => tpl.is_active !== false));
    } catch {
      // Silent fallback to local template list.
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadMessages = async (conversationId: string, page: number) => {
    try {
      if (page === 1) setLoadingMessages(true);
      const result = await apiClient.getMessages(conversationId, { page, limit: PAGE_SIZE });
      if (page === 1) {
        setMessages(result.messages);
      } else {
        // Prepend older messages
        setMessages((prev) => [...result.messages, ...prev]);
      }
      setHasMoreMessages(result.pagination.page < result.pagination.totalPages);
    } catch (err) {
      toast.error(t('inbox.errors.loadMessages'));
    } finally {
      setLoadingMessages(false);
      setLoadingMoreMessages(false);
    }
  };

  const loadOlderMessages = async () => {
    if (!selectedConversation || loadingMoreMessages || !hasMoreMessages) return;
    setLoadingMoreMessages(true);
    const nextPage = messagesPage + 1;
    setMessagesPage(nextPage);
    await loadMessages(selectedConversation.id, nextPage);
  };

  // SSE — real-time updates pushed from backend
  useInboxSSE({
    onNewMessage: useCallback(({ conversation_id, message }) => {
      // Append to message thread if this conversation is open
      setMessages((prev) => {
        if (!prev.length && !selectedConversation) return prev;
        // Only append if we're viewing this conversation
        if (selectedConversation?.id === conversation_id) {
          const alreadyExists = prev.some((m) => m.id === message.id);
          return alreadyExists ? prev : [...prev, message];
        }
        return prev;
      });
      // Always bump the conversation list (latest message preview + timestamp)
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversation_id
            ? { ...conv, updated_at: message.created_at, lastMessage: message.content }
            : conv
        )
      );
    }, [selectedConversation?.id]),

    onHitlChanged: useCallback(({ conversation_id, hitl }) => {
      setConversations((prev) =>
        prev.map((conv) => conv.id === conversation_id ? { ...conv, hitl } : conv)
      );
      setSelectedConversation((prev) =>
        prev?.id === conversation_id ? { ...prev, hitl } : prev
      );
    }, []),
  });

  // Find the most recent AI message — survives page refresh and agent replies
  // Uses explicit ai_suggestion if stored, falls back to the AI message content
  const lastAiMsg = [...messages].reverse().find((m) => m.sender === 'ai') ?? null;
  const aiSuggestion = lastAiMsg?.ai_suggestion || lastAiMsg?.content || '';
  const aiConfidence = lastAiMsg?.ai_confidence ?? 0;
  // Only show suggestion if: there's content, it hasn't been dismissed,
  // and the customer's last message is more recent than the agent's last reply
  const lastCustomerMsg = [...messages].reverse().find((m) => m.sender === 'customer') ?? null;
  const lastAgentMsg = [...messages].reverse().find((m) => m.sender === 'agent') ?? null;
  const customerSentAfterAgent = lastCustomerMsg && (!lastAgentMsg ||
    new Date(lastCustomerMsg.created_at) > new Date(lastAgentMsg.created_at));
  const hasAiSuggestion =
    !!aiSuggestion &&
    lastAiMsg?.id !== dismissedSuggestionId &&
    !!customerSentAfterAgent;
  const isLowConfidence = hasAiSuggestion && aiConfidence < 0.65;

  // Confidence tier labels for BD sellers — replaces raw % with meaningful label
  const confidenceTier = (() => {
    const pct = Math.round((aiConfidence ?? 0) * 100);
    if (pct >= 85) return { label: "High Confidence ✅", color: "bg-green-100 text-green-800 border border-green-200" };
    if (pct >= 60) return { label: "Review Carefully ⚠️", color: "bg-amber-100 text-amber-800 border border-amber-200" };
    return { label: "Low — AI Unsure ❌", color: "bg-red-100 text-red-800 border border-red-200" };
  })();

  const META_CHANNELS = ['facebook', 'messenger', 'instagram'];
  const is24hChannel = selectedConversation ? META_CHANNELS.includes(selectedConversation.channel) : false;
  const hoursElapsed = selectedConversation
    ? (Date.now() - new Date(selectedConversation.updated_at).getTime()) / 3600000
    : 0;
  const is24hExpired = is24hChannel && hoursElapsed >= 24;
  const is24hWarning = is24hChannel && hoursElapsed >= 23 && !is24hExpired;

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      !searchQuery ||
      conv.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.title?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'needs_review') return conv.hitl === true;
    return true;
  });
  const needsReviewCount = conversations.filter((c) => c.hitl).length;

  const handleToggleHITL = async () => {
    if (!selectedConversation) return;
    try {
      setTogglingHITL(true);
      const newHITL = !selectedConversation.hitl;
      await apiClient.updateConversation(selectedConversation.id, { hitl: newHITL });
      const updated = { ...selectedConversation, hitl: newHITL };
      setSelectedConversation(updated);
      setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      // Fire audit log — fire-and-forget, do not block UI on failure
      apiClient.createAuditLog({
        action: newHITL ? 'HUMAN_TAKEOVER' : 'UPDATE',
        resource_type: 'CONVERSATION',
        resource_id: selectedConversation.id,
        old_values: { hitl: !newHITL },
        new_values: { hitl: newHITL },
        metadata: { channel: selectedConversation.channel },
      }).catch(() => {/* audit failure is non-fatal */});
      toast.success(newHITL ? t('inbox.aiPaused') : t('inbox.aiReEnabled'));
    } catch {
      toast.error(t('inbox.errors.updateMode'));
    } finally {
      setTogglingHITL(false);
    }
  };

  const handleUseAiSuggestion = (edit: boolean) => {
    if (!aiSuggestion) return;
    if (edit) {
      setEditingMessage(aiSuggestion);
    } else {
      handleSendMessage(aiSuggestion);
    }
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Attachment read failed'));
      reader.readAsDataURL(file);
    });

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const encoded = result.includes(',') ? result.split(',')[1] : result;
        if (!encoded) {
          reject(new Error('Audio conversion failed'));
          return;
        }
        resolve(encoded);
      };
      reader.onerror = () => reject(new Error('Audio conversion failed'));
      reader.readAsDataURL(blob);
    });

  const resolveTemplateContent = (template: ResponseTemplate): string => {
    const customerName = selectedConversation?.customer?.name || 'Customer';
    return template.content
      .replaceAll('{{customer_name}}', customerName)
      .replaceAll('{{name}}', customerName);
  };

  const handleQuickTemplateSend = async (template: ResponseTemplate) => {
    const rendered = resolveTemplateContent(template).trim();
    if (!rendered) return;
    setShowQuickReplies(false);
    await handleSendMessage(rendered);
  };

  const handleAttachmentPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    setSelectedAttachment(file);
  };

  const handleAttachmentClear = () => {
    setSelectedAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartVoiceRecording = async () => {
    try {
      setVoiceError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());

        if (audioChunksRef.current.length === 0) {
          setIsRecordingVoice(false);
          return;
        }

        try {
          setIsTranscribingVoice(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          const audioBase64 = await blobToBase64(audioBlob);
          const data = await apiClient.transcribeVoice({
            messageId: `draft-${Date.now()}`,
            audioBase64,
            language: 'auto',
          });

          if (data.transcript?.trim()) {
            setEditingMessage((prev) => (prev.trim() ? `${prev.trim()} ${data.transcript.trim()}` : data.transcript.trim()));
            toast.success('Voice converted to text');
          }
        } catch {
          const msg = 'Voice transcription failed';
          setVoiceError(msg);
          toast.error(msg);
        } finally {
          setIsTranscribingVoice(false);
          setIsRecordingVoice(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingVoice(true);
    } catch {
      const msg = 'Microphone access denied';
      setVoiceError(msg);
      toast.error(msg);
    }
  };

  const handleStopVoiceRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  };

  const handleSendMessage = async (overrideContent?: string) => {
    const trimmed = (overrideContent ?? editingMessage).trim();
    const hasAttachment = !!selectedAttachment;
    if (!selectedConversation || (!trimmed && !hasAttachment) || isSending) return;
    if (is24hExpired && !selectedMessageTag) {
      toast.error(t('inbox.errors.selectTag'));
      return;
    }
    try {
      setIsSending(true);
      setSendError(null);
      let messageType: 'text' | 'image' | 'file' | 'location' = 'text';
      let metadata: Record<string, unknown> | undefined;
      let content = trimmed;

      if (selectedAttachment) {
        const dataUrl = await fileToDataUrl(selectedAttachment);
        const isImage = selectedAttachment.type.startsWith('image/');
        messageType = isImage ? 'image' : 'file';
        metadata = {
          message_type: messageType,
          file_name: selectedAttachment.name,
          mime_type: selectedAttachment.type || 'application/octet-stream',
          file_size: selectedAttachment.size,
          file_url: dataUrl,
          ...(isImage ? { image_url: dataUrl } : {}),
        };
        if (!content) {
          content = selectedAttachment.name;
        }
      }

      const payload: Parameters<typeof apiClient.createMessage>[1] = {
        content,
        sender: 'agent',
        message_type: messageType,
        ...(metadata ? { metadata } : {}),
        ...(selectedMessageTag ? { message_tag: selectedMessageTag as any } : {}),
      };
      const message = await apiClient.createMessage(selectedConversation.id, payload);
      setMessages((prev) => [...prev, message]);
      setEditingMessage('');
      setSelectedMessageTag('');
      handleAttachmentClear();
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? { ...conv, updated_at: message.created_at || conv.updated_at, lastMessage: message.content }
            : conv
        )
      );
    } catch (err: any) {
      const errMsg = (err as any).isRateLimited
        ? t('inbox.errors.rateLimited')
        : err.response?.data?.error?.message || t('inbox.errors.sendMessage');
      setSendError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSending(false);
    }
  };


  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
        <h1 className="text-xl font-semibold text-gray-900">{t('inbox.title')}</h1>
        <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          {t('inbox.active', { count: conversations.filter(c => c.status === 'active').length })}
        </span>
        {error && (
          <span className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </span>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List
            Bug #3: on mobile (<md) the sidebar takes full width and hides when
            a conversation is open; on desktop it's always visible at w-80. */}
        <div className={`
          bg-white border-r border-gray-200 overflow-y-auto flex flex-col
          w-full md:w-80
          ${mobilePanelOpen ? 'hidden' : 'flex'} md:flex
        `}>
          <div className="p-4 border-b border-gray-200 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('inbox.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setFilterTab('all')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterTab === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t('inbox.tabAll')}
              </button>
              <button
                onClick={() => setFilterTab('needs_review')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${
                  filterTab === 'needs_review' ? 'bg-amber-100 text-amber-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t('inbox.tabNeedsReview')}
                {needsReviewCount > 0 && (
                  <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {needsReviewCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {loadingConversations ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>{searchQuery ? t('inbox.noResults') : t('inbox.noConversations')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    // Bug #3: on mobile, switch to the conversation panel
                    setMobilePanelOpen(true);
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        {conversation.customer?.name?.charAt(0) || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold text-gray-900 truncate">{conversation.customer?.name || 'Unknown'}</h3>
                          {conversation.hitl && (
                            <span title={t('inbox.humanTooltip')}>
                              <UserCheck className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>{getChannelIcon(conversation.channel)}</span>
                          <span>{conversation.channel}</span>
                        </div>
                      </div>
                    </div>
                    {conversation.status === 'active' && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex-shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.title || 'No title'}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(conversation.updated_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversation View
            Bug #3: full-width on mobile when mobilePanelOpen, hidden otherwise */}
        <div className={`
          flex-1 flex flex-col bg-gray-50
          ${mobilePanelOpen ? 'flex' : 'hidden'} md:flex
        `}>
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Bug #3: back button only visible on mobile */}
                    <button
                      className="md:hidden p-1 -ml-1 text-gray-500 hover:text-gray-700"
                      onClick={() => setMobilePanelOpen(false)}
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 truncate">{selectedConversation.customer?.name || 'Unknown'}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                        <span>{getChannelIcon(selectedConversation.channel)}</span>
                        <span>via {selectedConversation.channel}</span>
                        <span>•</span>
                        <span>Last active {formatDate(selectedConversation.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedConversation.status === 'active'
                        ? 'bg-blue-100 text-blue-700'
                        : selectedConversation.status === 'closed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedConversation.status}
                    </span>
                    {planFeatures.advanced_ai ? (
                      <button
                        onClick={handleToggleHITL}
                        disabled={togglingHITL}
                        title={selectedConversation.hitl ? t('inbox.humanTooltip') : t('inbox.aiTooltip')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedConversation.hitl
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      >
                        {togglingHITL ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : selectedConversation.hitl ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                        {selectedConversation.hitl ? t('inbox.agentHandling') : t('inbox.aiActive')}
                      </button>
                    ) : (
                      <a
                        href="/subscription"
                        title="Upgrade to Growth or Scale plan to unlock AI features"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                      >
                        <Lock className="w-4 h-4" />
                        {t('inbox.upgradeForAI')}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* HITL active banner */}
              {selectedConversation.hitl && (
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center gap-2 text-sm text-amber-800">
                  <UserCheck className="w-4 h-4 flex-shrink-0" />
                  <span>{t('inbox.agentBanner')}</span>
                </div>
              )}
              {/* 24-hour messaging window banners */}
              {is24hWarning && (
                <div className="bg-orange-50 border-b border-orange-200 px-6 py-2 flex items-center gap-2 text-sm text-orange-800">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>{t('inbox.windowClosingSoon')}</span>
                </div>
              )}
              {is24hExpired && (
                <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center gap-2 text-sm text-red-800">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{t('inbox.windowExpired')}</span>
                </div>
              )}
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>{t('inbox.noMessages')}</p>
                  </div>
                ) : (
                  <>
                  {hasMoreMessages && (
                    <div className="flex justify-center">
                      <button
                        onClick={loadOlderMessages}
                        disabled={loadingMoreMessages}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-60"
                      >
                        {loadingMoreMessages
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <ChevronUp className="w-3 h-3" />}
                        {t('inbox.loadOlder')}
                      </button>
                    </div>
                  )}
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-lg ${
                        message.sender === 'customer'
                          ? 'bg-white border border-gray-100'
                          : message.sender === 'ai'
                          ? 'bg-purple-100 border border-purple-200'
                          : 'bg-blue-600 text-white'
                      } rounded-2xl p-4 shadow-sm`}>
                        <div className="flex items-center gap-2 mb-2">
                          {message.sender === 'customer' ? (
                            <User className="w-4 h-4 text-gray-600" />
                          ) : message.sender === 'ai' ? (
                            <Bot className="w-4 h-4 text-purple-600" />
                          ) : null}
                          <span className="text-sm font-semibold">
                            {message.sender === 'customer' ? selectedConversation.customer?.name : message.sender === 'ai' ? 'AI Assistant' : 'You'}
                          </span>
                        </div>
                        {message.message_type === 'image' ? (
                          <div>
                            {message.metadata?.image_url ? (
                              <img src={message.metadata.image_url} alt="Attachment" className="max-w-xs rounded-xl border border-black/5" />
                            ) : (
                              <span className="text-sm italic text-gray-500">[Image]</span>
                            )}
                            {message.metadata?.vision_processed === true && (
                              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> {t('inbox.imageProcessed')}
                              </p>
                            )}
                            {message.metadata?.vision_processed === false && (
                              <p className="mt-1 text-xs text-gray-400">{t('inbox.imageSkipped')}</p>
                            )}
                          </div>
                        ) : (
                          message.message_type === 'file' ? (
                            <div className="space-y-2">
                              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${message.sender === 'agent' ? 'bg-blue-500/60' : 'bg-gray-100'}`}>
                                <FileText className={`w-4 h-4 ${message.sender === 'agent' ? 'text-white' : 'text-gray-600'}`} />
                                <span className={`text-sm ${message.sender === 'agent' ? 'text-white' : 'text-gray-700'}`}>
                                  {message.metadata?.file_name || message.content || 'Attachment'}
                                </span>
                              </div>
                              {message.metadata?.file_url && (
                                <a
                                  href={message.metadata.file_url}
                                  download={message.metadata?.file_name || 'attachment'}
                                  className={`inline-block text-xs underline ${message.sender === 'agent' ? 'text-blue-100' : 'text-blue-700'}`}
                                >
                                  Download file
                                </a>
                              )}
                            </div>
                          ) : (
                            <p className={message.sender === 'agent' ? 'text-white' : 'text-gray-800'}>{message.content}</p>
                          )
                        )}
                        <p className={`mt-2 text-[11px] ${message.sender === 'agent' ? 'text-blue-100' : 'text-gray-400'}`}>
                          {formatDate(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  </>
                )}
              </div>

              {/* AI Suggestion Panel */}
              {planFeatures.advanced_ai && hasAiSuggestion && (
                <div className={`mx-4 rounded-t-lg border px-4 py-3 ${
                  (() => {
                    const pct = Math.round((aiConfidence ?? 0) * 100);
                    if (pct >= 85) return 'bg-green-50 border-green-200';
                    if (pct >= 60) return 'bg-amber-50 border-amber-300';
                    return 'bg-red-50 border-red-300';
                  })()
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-900">{t('inbox.aiSuggestion')}</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${confidenceTier.color}`}>
                      {confidenceTier.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mb-2 italic">"{aiSuggestion}"</p>
                  {isLowConfidence && (
                    <p className="text-xs text-amber-700 mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {t('inbox.lowConfidence')}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleUseAiSuggestion(false)}
                      disabled={isSending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 bg-purple-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-60 min-h-10"
                    >
                      <CheckCircle2 className="w-4 sm:w-3 h-4 sm:h-3 flex-shrink-0" /> 
                      <span className="hidden xs:inline">{t('inbox.useThis')}</span>
                      <span className="inline xs:hidden">Use</span>
                    </button>
                    <button
                      onClick={() => handleUseAiSuggestion(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 bg-white border border-purple-300 text-purple-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-purple-50 min-h-10"
                    >
                      <Edit3 className="w-4 sm:w-3 h-4 sm:h-3 flex-shrink-0" /> 
                      <span className="hidden xs:inline">{t('inbox.editAndUse')}</span>
                      <span className="inline xs:hidden">Edit</span>
                    </button>
                    <button
                      onClick={() => lastAiMsg && setDismissedSuggestionId(lastAiMsg.id)}
                      className="flex-1 py-2 sm:py-1.5 px-2 sm:px-3 bg-white border border-gray-300 text-gray-600 text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-50 min-h-10"
                    >
                      {t('inbox.ignore')}
                    </button>
                  </div>
                </div>
              )}
              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                {sendError && (
                  <div className="mb-3 text-sm text-red-600">{sendError}</div>
                )}
                {(is24hWarning || is24hExpired) && (
                  <div className="mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <select
                      value={selectedMessageTag}
                      onChange={(e) => setSelectedMessageTag(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{is24hExpired ? t('inbox.messageTagRequired') : t('inbox.messageTagOptional')}</option>
                      <option value="CONFIRMED_EVENT_UPDATE">Confirmed Event Update</option>
                      <option value="POST_PURCHASE_UPDATE">Post-Purchase Update</option>
                      <option value="ACCOUNT_UPDATE">Account Update</option>
                      <option value="HUMAN_AGENT">Human Agent</option>
                    </select>
                  </div>
                )}
                {selectedAttachment && (
                  <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                    {selectedAttachment.type.startsWith('image/') ? '🖼️' : '📎'}
                    <span className="max-w-56 truncate">{selectedAttachment.name}</span>
                    <button onClick={handleAttachmentClear} className="text-blue-700 hover:text-blue-900" aria-label="Remove attachment">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {voiceError && (
                  <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{voiceError}</div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                  onChange={handleAttachmentPick}
                />
                <div className="flex items-center gap-2 md:gap-3 relative">
                  {/* Quick Reply popup */}
                  {showQuickReplies && (
                    <div
                      ref={quickReplyRef}
                      className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">⚡ Templates</span>
                        <button onClick={() => setShowQuickReplies(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                        {loadingTemplates && (
                          <div className="px-3 py-2 text-xs text-gray-500">Loading templates...</div>
                        )}
                        {quickReplyTemplates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => handleQuickTemplateSend(template)}
                            className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors leading-snug"
                          >
                            <div className="font-medium text-gray-900">{template.name}</div>
                            <div className="line-clamp-2 text-xs text-gray-500 mt-1">{template.content}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setShowQuickReplies(v => !v)}
                    title="Quick Reply"
                    className="p-2.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 border border-gray-300 rounded-xl transition-colors flex-shrink-0"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach file"
                    className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-300 rounded-xl transition-colors flex-shrink-0"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    onClick={isRecordingVoice ? handleStopVoiceRecording : handleStartVoiceRecording}
                    title={isRecordingVoice ? 'Stop recording' : 'Start voice recording'}
                    disabled={isTranscribingVoice}
                    className={`p-2.5 border rounded-xl transition-colors flex-shrink-0 ${isRecordingVoice ? 'text-red-600 border-red-300 bg-red-50 hover:bg-red-100' : 'text-gray-500 border-gray-300 hover:text-blue-600 hover:bg-blue-50'} ${isTranscribingVoice ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isRecordingVoice ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <input
                    type="text"
                    value={editingMessage}
                    onChange={(e) => setEditingMessage(e.target.value)}
                    placeholder={
                      isTranscribingVoice
                        ? 'Transcribing voice...'
                        : is24hExpired && !selectedMessageTag
                        ? t('inbox.messageTagPlaceholder')
                        : t('inbox.messagePlaceholder')
                    }
                    disabled={is24hExpired && !selectedMessageTag}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className={`flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      is24hExpired && !selectedMessageTag ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isSending || (!editingMessage.trim() && !selectedAttachment) || (is24hExpired && !selectedMessageTag)}
                    className={`px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 ${
                      isSending || (!editingMessage.trim() && !selectedAttachment) || (is24hExpired && !selectedMessageTag)
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:bg-blue-700'
                    }`}
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {isSending ? t('inbox.sending') : t('inbox.send')}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>{t('inbox.selectConversation')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
const getChannelIcon = (channel: string): string => {
  const icons: Record<string, string> = {
    whatsapp: '💬',
    facebook: '👥',
    telegram: '✈️',
    messenger: '📱',
    instagram: '📷',
    web: '🌐',
  };
  return icons[channel] || '💬';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};
