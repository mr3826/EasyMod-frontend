/**
 * Voice Recorder Hooks
 * Custom React hooks for voice recording state management
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  VoiceProcessError,
  TranscriptData,
  Languages,
  STORAGE_KEY_LANGUAGE,
  DEFAULT_MAX_DURATION,
} from '../types';
import { processVoiceMessageWithRetry, validateAudioFile } from '../api/voice';

interface UseVoiceRecorderOptions {
  maxDuration?: number;
  customerId: string;
  shopId: string;
  conversationId: string;
}

export function useVoiceRecorder({
  maxDuration = DEFAULT_MAX_DURATION,
  customerId,
  shopId,
  conversationId,
}: UseVoiceRecorderOptions) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<VoiceProcessError | null>(null);

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (err) {
      const error = new Error('Microphone access denied') as VoiceProcessError;
      error.code = 'MICROPHONE_PERMISSION_DENIED';
      setError(error);
      return null;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await requestMicrophonePermission();
      if (!stream) return;

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onerror = (event) => {
        const error = new Error(`MediaRecorder error: ${event.error}`) as VoiceProcessError;
        error.code = 'MEDIA_RECORDER_ERROR';
        setError(error);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
      setRecordingDuration(0);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      const error = new Error('Failed to start recording') as VoiceProcessError;
      error.code = 'START_RECORDING_ERROR';
      setError(error);
    }
  }, [requestMicrophonePermission, maxDuration]);

  // Stop recording
  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null);
        return;
      }

      const mediaRecorder = mediaRecorderRef.current;

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];

        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());

        // Clear timer
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        setIsRecording(false);
        resolve(audioBlob);
      };

      mediaRecorder.stop();
    });
  }, [isRecording]);

  // Cancel recording
  const cancelRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    audioChunksRef.current = [];

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setIsRecording(false);
    setRecordingDuration(0);
    setTranscript(null);
  }, []);

  // Send recording to backend for transcription
  const sendRecording = useCallback(
    async (audioBlob: Blob) => {
      try {
        setIsTranscribing(true);
        setError(null);

        // Validate audio
        validateAudioFile(audioBlob);

        const response = await processVoiceMessageWithRetry(
          {
            messageId: uuidv4(),
            customerId,
            shopId,
            mediaData: {
              mediaId: uuidv4(),
            },
          },
          audioBlob
        );

        const transcriptData: TranscriptData = {
          ...response,
          timestamp: Date.now(),
          duration: recordingDuration,
        };

        setTranscript(transcriptData);
        setError(null);
        return transcriptData;
      } catch (err) {
        const error = err as VoiceProcessError;
        setError(error);
        throw error;
      } finally {
        setIsTranscribing(false);
      }
    },
    [customerId, shopId, recordingDuration]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isRecording]);

  return {
    isRecording,
    recordingDuration,
    transcript,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    sendRecording,
    setTranscript,
    setError,
  };
}

/**
 * Hook for language selection with localStorage persistence
 */
export function useLanguageSelection(defaultLanguage: Languages = 'auto') {
  const [selectedLanguage, setSelectedLanguage] = useState<Languages>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_LANGUAGE);
    return (stored as Languages) || defaultLanguage;
  });

  const handleLanguageChange = useCallback((lang: Languages) => {
    setSelectedLanguage(lang);
    localStorage.setItem(STORAGE_KEY_LANGUAGE, lang);
  }, []);

  return { selectedLanguage, setLanguage: handleLanguageChange };
}

/**
 * Hook for formatting duration as MM:SS
 */
export function useDurationDisplay(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Hook for confidence badge styling
 */
export function useConfidenceBadge(confidence: number) {
  const getColorClass = useCallback((conf: number) => {
    if (conf >= 0.85) return 'bg-green-100 text-green-800 border-green-300';
    if (conf >= 0.7) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (conf >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  }, []);

  const getLabel = useCallback((conf: number) => {
    if (conf >= 0.85) return 'Perfect';
    if (conf >= 0.7) return 'Good';
    if (conf >= 0.5) return 'Fair';
    return 'Poor';
  }, []);

  return {
    colorClass: getColorClass(confidence),
    label: getLabel(confidence),
    percentage: Math.round(confidence * 100),
  };
}
