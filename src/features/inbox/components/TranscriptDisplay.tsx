/**
 * TranscriptDisplay Component
 * Shows transcribed text with confidence badge, language, and metadata
 */

import React, { useCallback, useState } from 'react';
import { useConfidenceBadge } from '../hooks/useVoiceRecorder';
import { TranscriptDisplayProps, LANGUAGE_OPTIONS } from '../types';
import { Copy, Check, X, Clock, Globe } from 'lucide-react';

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  onDismiss,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);
  const confidenceBadge = useConfidenceBadge(transcript.confidence);

  const languageLabel = LANGUAGE_OPTIONS.find((l) => l.value === transcript.language)?.label || 
    transcript.language;
  const languageFlag = LANGUAGE_OPTIONS.find((l) => l.value === transcript.language)?.flag || '🌐';

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(transcript.transcript);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [transcript.transcript, onCopy]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
      {/* Header with close button */}
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-green-900">✓ Transcription Complete</h3>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-green-200 rounded transition"
          aria-label="Close transcript"
        >
          <X className="w-4 h-4 text-green-700" />
        </button>
      </div>

      {/* Language and Confidence Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Language Badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 bg-white border border-green-200 rounded-full text-sm">
          <Globe className="w-3.5 h-3.5 text-green-700" />
          <span className="text-green-900 font-medium">{languageFlag} {languageLabel}</span>
        </div>

        {/* Confidence Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-sm font-medium ${confidenceBadge.colorClass}`}
        >
          <div className="w-2 h-2 rounded-full bg-current" />
          <span>{confidenceBadge.label}</span>
          <span className="text-xs opacity-75">({confidenceBadge.percentage}%)</span>
        </div>
      </div>

      {/* Confidence Progress Bar */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <span>Confidence Level</span>
          <span className="font-mono font-semibold">{confidenceBadge.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              transcript.confidence >= 0.85
                ? 'bg-green-500'
                : transcript.confidence >= 0.7
                ? 'bg-blue-500'
                : transcript.confidence >= 0.5
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${transcript.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Transcript Text */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-green-900">Transcript</label>
        <div className="p-3 bg-white border border-green-200 rounded-lg max-h-48 overflow-y-auto">
          <p className="text-gray-800 leading-relaxed">{transcript.transcript}</p>
          <p className="text-xs text-gray-500 mt-2">
            ({transcript.length} characters)
          </p>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 flex-1 px-3 py-2 rounded transition font-medium text-sm ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-white border border-green-300 text-green-700 hover:bg-green-50'
          }`}
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Text
            </>
          )}
        </button>

        <button
          onClick={onDismiss}
          className="flex items-center justify-center gap-2 flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium text-sm"
          aria-label="Use transcript"
        >
          ✓ Use Transcript
        </button>
      </div>

      {/* Metadata Footer */}
      <div className="flex flex-col gap-1 pt-2 border-t border-green-200">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="w-3.5 h-3.5" />
          <span>
            Transcribed at <span className="font-mono font-semibold">{formatTime(transcript.timestamp)}</span>
          </span>
        </div>
        {transcript.duration && (
          <p className="text-xs text-gray-600">
            Recording duration: <span className="font-mono font-semibold">{Math.round(transcript.duration)}s</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default TranscriptDisplay;
