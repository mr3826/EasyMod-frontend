/**
 * Voice Processing Feature - Public API
 * Export all components, hooks, and utilities
 */

// Components
export { VoiceRecorder } from './components/VoiceRecorder';
export { TranscriptDisplay } from './components/TranscriptDisplay';
export { LanguageSelector, LanguageSelectorWithPersistence } from './components/LanguageSelector';

// Hooks
export {
  useVoiceRecorder,
  useLanguageSelection,
  useDurationDisplay,
  useConfidenceBadge,
} from './hooks/useVoiceRecorder';

// API
export { processVoiceMessage, processVoiceMessageWithRetry, validateAudioFile } from './api/voice';

// Types
export type {
  VoiceProcessRequest,
  VoiceProcessResponse,
  VoiceProcessError,
  TranscriptData,
  VoiceRecorderProps,
  TranscriptDisplayProps,
  LanguageSelectorProps,
  VoiceState,
  VoiceContextType,
  Languages,
} from './types';

export { LANGUAGE_OPTIONS, DEFAULT_MAX_DURATION, STORAGE_KEY_LANGUAGE } from './types';
