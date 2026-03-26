/**
 * Voice Processing API Client
 * Handles communication with backend voice processing endpoints
 */

import axios, { AxiosError } from 'axios';
import { VoiceProcessRequest, VoiceProcessResponse, VoiceProcessError } from '../types';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const VOICE_ENDPOINT = `${API_BASE}/ai/voice/process`;

/**
 * Convert audio blob to base64 or send as FormData
 */
async function prepareAudioData(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (!base64) reject(new Error('Failed to convert audio'));
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Process voice message on backend
 * @param request Voice processing request
 * @param audioBlob Raw audio blob from recorder
 * @returns Transcription response
 */
export async function processVoiceMessage(
  request: VoiceProcessRequest,
  audioBlob: Blob
): Promise<VoiceProcessResponse> {
  try {
    const audioData = await prepareAudioData(audioBlob);

    const response = await axios.post<VoiceProcessResponse>(VOICE_ENDPOINT, {
      ...request,
      audioData, // Add encoded audio
      audioFormat: audioBlob.type || 'audio/webm',
      audioDuration: Math.round(audioBlob.size / 16000), // Rough estimate
    });

    if (!response.data.success) {
      throw new Error('Backend returned success: false');
    }

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    const voiceError: VoiceProcessError = new Error(
      axiosError.response?.data?.message || 'Voice processing failed'
    ) as VoiceProcessError;

    voiceError.status = axiosError.response?.status || 500;
    voiceError.code = axiosError.response?.data?.code || 'VOICE_PROCESS_ERROR';
    voiceError.details = axiosError.response?.data?.details || {};

    throw voiceError;
  }
}

/**
 * Validate audio file
 */
export function validateAudioFile(blob: Blob, maxSizeBytes: number = 25 * 1024 * 1024): void {
  if (blob.size > maxSizeBytes) {
    const error = new Error(`Audio file too large: ${blob.size} bytes`) as VoiceProcessError;
    error.code = 'AUDIO_FILE_TOO_LARGE';
    throw error;
  }

  const validTypes = ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'];
  if (!validTypes.includes(blob.type)) {
    const error = new Error(`Invalid audio format: ${blob.type}`) as VoiceProcessError;
    error.code = 'INVALID_AUDIO_FORMAT';
    throw error;
  }
}

/**
 * Retry logic with exponential backoff
 */
export async function processVoiceMessageWithRetry(
  request: VoiceProcessRequest,
  audioBlob: Blob,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<VoiceProcessResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await processVoiceMessage(request, audioBlob);
    } catch (error) {
      lastError = error as Error;
      const voiceError = error as VoiceProcessError;

      // Don't retry on client errors (4xx)
      if (voiceError.status && voiceError.status < 500) {
        throw error;
      }

      // Exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Voice processing failed after retries');
}
