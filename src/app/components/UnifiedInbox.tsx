import { useState, useEffect } from "react";
import { Send, Bot, User, CheckCircle2, Edit3, Lightbulb, Loader2 } from "lucide-react";
import { apiClient, Conversation, Message } from "../lib/api";
import { mockFAQs } from "../lib/knowledgeTypes";

const channelIcons: Record<string, string> = {
  whatsapp: '💬',
  facebook: '👥',
  telegram: '✈️',
  webchat: '🌐',
};

export default function UnifiedInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestionAccepted, setAiSuggestionAccepted] = useState(false);
  const [editingMessage, setEditingMessage] = useState('');
  const [showKnowledgeMatch, setShowKnowledgeMatch] = useState(true);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

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
      setError('Failed to load conversations');
      console.error('Error loading conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const result = await apiClient.getMessages(conversationId, { limit: 100 });
      setMessages(result.messages);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const aiSuggestion = messages.length > 0 ? messages[messages.length - 1]?.ai_suggestion : '';
  const aiConfidence = messages.length > 0 ? messages[messages.length - 1]?.ai_confidence : 0;

  // Simulate knowledge-based matching
  const matchedFAQ = mockFAQs[0]; // In real system, this would be semantic search

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
        <h1 className="text-xl font-semibold text-gray-900">Unified Inbox</h1>
        <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          {conversations.filter(c => c.status === 'active').length} Active
        </span>
        {error && (
          <span className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </span>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {loadingConversations ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
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
                        <h3 className="font-semibold text-gray-900 truncate">{conversation.customer?.name || 'Unknown'}</h3>
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

        {/* Conversation View */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedConversation.customer?.name || 'Unknown'}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{getChannelIcon(selectedConversation.channel)}</span>
                      <span>via {selectedConversation.channel}</span>
                      <span>•</span>
                      <span>Last active {formatDate(selectedConversation.updated_at)}</span>
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
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No messages in this conversation</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-lg ${
                        message.sender === 'customer' 
                          ? 'bg-white' 
                          : message.sender === 'ai'
                          ? 'bg-purple-100'
                          : 'bg-blue-600 text-white'
                      } rounded-lg p-4 shadow-sm`}>
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
                        <p className={message.sender === 'agent' ? 'text-white' : 'text-gray-800'}>{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Knowledge-Based Match */}
              {showKnowledgeMatch && matchedFAQ && (
                <div className="bg-green-50 border-t border-green-200 p-4">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-6 h-6 text-green-600 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-green-900">Knowledge Base Match Found</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-700 bg-green-200 px-2 py-1 rounded">
                              {Math.round(matchedFAQ.confidence * 100)}% match
                            </span>
                            <span className="text-xs text-green-700">Used {matchedFAQ.usageCount} times</span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-200 mb-2">
                          <p className="text-sm font-semibold text-gray-900 mb-1">Q: {matchedFAQ.question}</p>
                          <p className="text-sm text-gray-700">A: {matchedFAQ.answer}</p>
                          <p className="text-xs text-gray-500 mt-1">Source: {matchedFAQ.source}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingMessage(matchedFAQ.answer);
                              setShowKnowledgeMatch(false);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Use This Answer
                          </button>
                          <button
                            onClick={() => setShowKnowledgeMatch(false)}
                            className="px-3 py-1 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 text-sm"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Suggestion Panel */}
              {aiSuggestion && !aiSuggestionAccepted && !showKnowledgeMatch && (
                <div className="bg-purple-50 border-t border-purple-200 p-4">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-start gap-3">
                      <Bot className="w-6 h-6 text-purple-600 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-purple-900">AI Reply Suggestion</h3>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-purple-700">
                              Confidence: <span className="font-semibold">{Math.round((aiConfidence || 0) * 100)}%</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingMessage(aiSuggestion);
                                  setAiSuggestionAccepted(true);
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                              >
                                <Edit3 className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => setAiSuggestionAccepted(true)}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Use
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-purple-800 bg-white rounded-lg p-3 border border-purple-200">
                          {aiSuggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="max-w-4xl mx-auto flex gap-3">
                  <input
                    type="text"
                    value={editingMessage}
                    onChange={(e) => setEditingMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Select a conversation to view messages</p>
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