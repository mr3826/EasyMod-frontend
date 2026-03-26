/**
 * VoiceRecorder Component
 * Records audio from user device, displays timer, and manages upload to backend
 */

import React, { useState, useCallback } from 'react';
import { useVoiceRecorder, useDurationDisplay } from '../hooks/useVoiceRecorder';
import { VoiceRecorderProps, VoiceProcessError } from '../types';
import { Loader2, Mic, Square, Send, X } from 'lucide-react';

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptReceived,
  onError,
  maxDuration = 300,
  conversationId,
  customerId,
  shopId,
}) => {
  const {
    isRecording,
    recordingDuration,
    transcript,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    sendRecording,
    setError,
  } = useVoiceRecorder({
    maxDuration,
    customerId,
    shopId,
    conversationId,
  });

  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const durationDisplay = useDurationDisplay(recordingDuration);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

  const handleStartRecording = useCallback(async () => {
    try {
      await startRecording();
      showToast('Recording started');
    } catch (err) {
      const error = err as VoiceProcessError;
      onError(error);
      showToast('Failed to start recording', 'error');
    }
  }, [startRecording, onError, showToast]);

  const handleStopAndSend = useCallback(async () => {
    try {
      const audioBlob = await stopRecording();
      if (!audioBlob) return;

      showToast('Transcribing...');
      const transcriptData = await sendRecording(audioBlob);
      onTranscriptReceived(transcriptData);
      showToast('Transcription complete');
    } catch (err) {
      const error = err as VoiceProcessError;
      onError(error);
      showToast(error.message || 'Transcription failed', 'error');
    }
  }, [stopRecording, sendRecording, onTranscriptReceived, onError, showToast]);

  const handleCancel = useCallback(async () => {
    await cancelRecording();
    showToast('Recording cancelled');
  }, [cancelRecording, showToast]);

  const handleRetry = useCallback(() => {
    setError(null);
    showToast('Ready to record');
  }, [setError, showToast]);

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="text-red-600 mt-1">⚠️</div>
          <div className="flex-1">
            <p className="font-medium text-red-900">{error.message}</p>
            {error.code && (
              <p className="text-sm text-red-700 mt-1">Error code: {error.code}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleRetry}
          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show transcribing state
  if (isTranscribing) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <p className="text-blue-900 font-medium">Transcribing audio...</p>
        </div>
        <p className="text-sm text-blue-700">This typically takes 2-5 seconds</p>
      </div>
    );
  }

  // Show recording interface
  if (isRecording) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="font-medium text-purple-900">Recording</span>
          </div>
          <span className="text-lg font-mono font-bold text-purple-900">
            {durationDisplay}
          </span>
        </div>

        {/* Waveform visualization placeholder */}
        <div className="flex items-center gap-1 h-12 bg-white rounded px-2">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-purple-400 rounded-full"
              style={{
                height: `${20 + Math.sin(Date.now() / 100 + i) * 15}px`,
                animation: `pulse 0.5s ease-in-out infinite`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition font-medium"
            aria-label="Cancel recording"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleStopAndSend}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium"
            aria-label="Stop recording and send"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>

        {/* Duration warning */}
        {recordingDuration > maxDuration * 0.8 && (
          <p className="text-sm text-orange-700 bg-orange-100 px-2 py-1 rounded">
            ⏱️ Recording will stop at {Math.ceil(maxDuration / 60)} minutes
          </p>
        )}
      </div>
    );
  }

  // Show initial state - idle
  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <button
        onClick={handleStartRecording}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium w-full"
        aria-label="Start voice recording"
      >
        <Mic className="w-5 h-5" />
        Start Voice Recording
      </button>
      <p className="text-xs text-gray-600 text-center">
        Max duration: {Math.ceil(maxDuration / 60)} minutes
      </p>

      {/* Toast notification */}
      {toastMessage && (
        <div
          className={`px-3 py-2 rounded text-sm font-medium animate-fade-in ${
            toastType === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          ✓ {toastMessage}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
