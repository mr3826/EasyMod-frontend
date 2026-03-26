/**
 * Voice Processing Types
 * Comprehensive type definitions for voice message recording and transcription
 */

export type Languages = 'bengali' | 'english' | 'banglish' | 'auto';

export interface VoiceProcessRequest {
  messageId: string; // Generated client-side UUID
  customerId: string; // From auth context
  shopId: string; // From auth context
  mediaData: {
    mediaId: string; // Media ID or file reference
    accessToken?: string; // For Meta Graph API (optional for local uploads)
  };
}

export interface VoiceProcessResponse {
  success: true;
  messageId: string;
  transcript: string;
  language: 'bengali' | 'english' | 'banglish';
  confidence: number; // 0-1 range
  length: number; // character count
}

export interface VoiceProcessError extends Error {
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

export interface TranscriptData extends VoiceProcessResponse {
  timestamp: number; // Unix timestamp
  duration: number; // Recording duration in seconds
}

export interface VoiceRecorderProps {
  onTranscriptReceived: (transcript: TranscriptData) => void;
  onError: (error: VoiceProcessError) => void;
  maxDuration?: number; // seconds, default 300 (5 minutes)
  conversationId: string;
  customerId: string;
  shopId: string;
}

export interface TranscriptDisplayProps {
  transcript: TranscriptData;
  onDismiss: () => void;
  onCopy?: () => void;
}

export interface LanguageSelectorProps {
  currentLanguage: Languages;
  onChange: (lang: Languages) => void;
}

export interface VoiceState {
  isRecording: boolean;
  recordingDuration: number;
  transcript: TranscriptData | null;
  isTranscribing: boolean;
  error: VoiceProcessError | null;
  selectedLanguage: Languages;
}

export interface VoiceContextType extends VoiceState {
  startRecording: () => void;
  stopRecording: () => void;
  cancelRecording: () => void;
  setTranscript: (transcript: TranscriptData) => void;
  setError: (error: VoiceProcessError | null) => void;
  setLanguage: (lang: Languages) => void;
  clearError: () => void;
}

export const LANGUAGE_OPTIONS: Array<{ value: Languages; label: string; flag: string }> = [
  { value: 'auto', label: 'Auto Detect', flag: '🌍' },
  { value: 'bengali', label: 'Bengali', flag: '🇧🇩' },
  { value: 'english', label: 'English', flag: '🇬🇧' },
  { value: 'banglish', label: 'Banglish', flag: '🔤' },
];

export const DEFAULT_MAX_DURATION = 300; // 5 minutes
export const STORAGE_KEY_LANGUAGE = 'voice_recorder_language';
export const STORAGE_KEY_PREFERENCES = 'voice_recorder_preferences';
