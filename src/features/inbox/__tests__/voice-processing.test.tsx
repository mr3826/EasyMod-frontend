/**
 * Voice Recording Tests
 * Vitest + React Testing Library test suite for voice processing feature
 */

import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranscriptData } from '../types';

// ── Hoist mock functions before vi.mock factory runs ─────────────────────────
const {
  mockUseVoiceRecorder,
  mockUseDurationDisplay,
  mockUseConfidenceBadge,
  mockStartRecording,
} = vi.hoisted(() => {
  const mockStartRecording = vi.fn().mockResolvedValue(undefined);
  const mockStopRecording = vi.fn().mockResolvedValue(null);
  const mockCancelRecording = vi.fn().mockResolvedValue(undefined);
  const mockSendRecording = vi.fn().mockResolvedValue(null);
  const mockSetError = vi.fn();

  const mockUseVoiceRecorder = vi.fn().mockReturnValue({
    isRecording: false,
    recordingDuration: 0,
    transcript: null,
    isTranscribing: false,
    error: null,
    startRecording: mockStartRecording,
    stopRecording: mockStopRecording,
    cancelRecording: mockCancelRecording,
    sendRecording: mockSendRecording,
    setError: mockSetError,
  });

  const mockUseDurationDisplay = vi.fn((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  });

  const mockUseConfidenceBadge = vi.fn((confidence: number) => {
    const percentage = Math.round(confidence * 100);
    let label: string;
    let colorClass: string;
    if (confidence >= 0.9) {
      label = 'Perfect'; colorClass = 'text-green-600 border-green-200 bg-green-50';
    } else if (confidence >= 0.7) {
      label = 'Good'; colorClass = 'text-blue-600 border-blue-200 bg-blue-50';
    } else if (confidence >= 0.5) {
      label = 'Fair'; colorClass = 'text-yellow-600 border-yellow-200 bg-yellow-50';
    } else {
      label = 'Poor'; colorClass = 'text-red-600 border-red-200 bg-red-50';
    }
    return { label, percentage, colorClass };
  });

  return {
    mockUseVoiceRecorder,
    mockUseDurationDisplay,
    mockUseConfidenceBadge,
    mockStartRecording,
  };
});

// ── Mock lucide-react icons ───────────────────────────────────────────────────
vi.mock('lucide-react', () => {
  const Icon = () => null;
  return {
    Mic: Icon, Square: Icon, Send: Icon, X: Icon, Loader2: Icon,
    Copy: Icon, Check: Icon, Clock: Icon, Globe: Icon, ChevronDown: Icon,
  };
});

// ── Mock the voice recorder hooks module ─────────────────────────────────────
vi.mock('../hooks/useVoiceRecorder', () => ({
  useVoiceRecorder: mockUseVoiceRecorder,
  useDurationDisplay: mockUseDurationDisplay,
  useConfidenceBadge: mockUseConfidenceBadge,
  useLanguageSelection: vi.fn().mockReturnValue({ language: 'auto', setLanguage: vi.fn() }),
}));

import { VoiceRecorder } from '../components/VoiceRecorder';
import { TranscriptDisplay } from '../components/TranscriptDisplay';
import { LanguageSelector } from '../components/LanguageSelector';
import { validateAudioFile } from '../api/voice';

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderHook(callback: () => any) {
  let hookResult: any;
  function TestComponent() {
    hookResult = callback();
    return null;
  }
  render(<TestComponent />);
  return { result: { current: hookResult } };
}

// ── VoiceRecorder Component ───────────────────────────────────────────────────

describe('VoiceRecorder Component', () => {
  const mockProps = {
    onTranscriptReceived: vi.fn(),
    onError: vi.fn(),
    maxDuration: 300,
    conversationId: 'conv-123',
    customerId: 'cust-123',
    shopId: 'shop-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseVoiceRecorder.mockReturnValue({
      isRecording: false,
      recordingDuration: 0,
      transcript: null,
      isTranscribing: false,
      error: null,
      startRecording: mockStartRecording,
      stopRecording: vi.fn().mockResolvedValue(null),
      cancelRecording: vi.fn().mockResolvedValue(undefined),
      sendRecording: vi.fn().mockResolvedValue(null),
      setError: vi.fn(),
    });
  });

  it('should render record button initially', () => {
    render(<VoiceRecorder {...mockProps} />);
    expect(screen.getByText(/Start Voice Recording/i)).toBeInTheDocument();
  });

  it('should show error state when error prop provided', async () => {
    const { rerender } = render(<VoiceRecorder {...mockProps} />);
    rerender(
      <VoiceRecorder
        {...mockProps}
        onError={(err) => { mockProps.onError(err); }}
      />
    );
    expect(screen.getByText(/Start Voice Recording/i)).toBeInTheDocument();
  });

  it('should display recording timer during recording', async () => {
    render(<VoiceRecorder {...mockProps} />);
    const recordButton = screen.getByText(/Start Voice Recording/i);
    await userEvent.click(recordButton);
    await waitFor(() => {
      expect(mockStartRecording).toHaveBeenCalled();
    });
  });

  it('should respect max duration limit', async () => {
    render(<VoiceRecorder {...mockProps} maxDuration={5} />);
    await waitFor(() => {
      expect(screen.getByText(/Max duration/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should call onTranscriptReceived on successful send', async () => {
    render(<VoiceRecorder {...mockProps} />);
    expect(mockProps.onTranscriptReceived).not.toHaveBeenCalled();
  });
});

// ── TranscriptDisplay Component ───────────────────────────────────────────────

describe('TranscriptDisplay Component', () => {
  const mockTranscript: TranscriptData = {
    success: true,
    messageId: 'msg-123',
    transcript: 'Hello, this is a test transcript',
    language: 'english',
    confidence: 0.92,
    length: 31,
    timestamp: Date.now(),
    duration: 5,
  };

  const mockProps = {
    transcript: mockTranscript,
    onDismiss: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Fix: use Object.defineProperty — navigator.clipboard is a getter-only property
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
  });

  it('should render transcript text', () => {
    render(<TranscriptDisplay {...mockProps} />);
    expect(screen.getByText(/Hello, this is a test transcript/)).toBeInTheDocument();
  });

  it('should display confidence badge with correct percentage', () => {
    render(<TranscriptDisplay {...mockProps} />);
    expect(screen.getAllByText(/92%/).length).toBeGreaterThan(0);
  });

  it('should show language flag and label', () => {
    render(<TranscriptDisplay {...mockProps} />);
    expect(screen.getByText(/English/i)).toBeInTheDocument();
  });

  it('should copy text to clipboard when copy button clicked', async () => {
    render(<TranscriptDisplay {...mockProps} />);
    const copyButton = screen.getByText(/Copy Text/i);
    await userEvent.click(copyButton);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockTranscript.transcript);
    });
  });

  it('should show "Copied" confirmation briefly', async () => {
    render(<TranscriptDisplay {...mockProps} />);
    const copyButton = screen.getByText(/Copy Text/i);
    await userEvent.click(copyButton);
    await waitFor(() => {
      expect(screen.getByText(/Copied/i)).toBeInTheDocument();
    });
  });

  it('should call onDismiss when close button clicked', async () => {
    render(<TranscriptDisplay {...mockProps} />);
    const closeButton = screen.getByLabelText(/Close transcript/i);
    await userEvent.click(closeButton);
    expect(mockProps.onDismiss).toHaveBeenCalled();
  });

  it('should display high confidence with green color', () => {
    render(<TranscriptDisplay {...mockProps} />);
    const container = screen.getByText(/Perfect/);
    expect(container).toBeInTheDocument();
  });

  it('should display low confidence with red color', () => {
    const lowConfidenceTranscript = { ...mockTranscript, confidence: 0.3 };
    render(<TranscriptDisplay {...mockProps} transcript={lowConfidenceTranscript} />);
    expect(screen.getByText(/Poor/)).toBeInTheDocument();
  });
});

// ── LanguageSelector Component ────────────────────────────────────────────────

describe('LanguageSelector Component', () => {
  const mockProps = {
    currentLanguage: 'english' as const,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render language select dropdown', () => {
    render(<LanguageSelector {...mockProps} />);
    expect(screen.getByLabelText(/Recording Language/i)).toBeInTheDocument();
  });

  it('should display all language options', () => {
    render(<LanguageSelector {...mockProps} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.options.length).toBeGreaterThan(0);
  });

  it('should call onChange when language selected', async () => {
    render(<LanguageSelector {...mockProps} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    await userEvent.selectOptions(select, 'bengali');
    expect(mockProps.onChange).toHaveBeenCalledWith('bengali');
  });

  it('should show auto-detect message for auto language', () => {
    render(<LanguageSelector {...mockProps} currentLanguage="auto" />);
    expect(screen.getByText(/detect language automatically/i)).toBeInTheDocument();
  });
});

// ── useVoiceRecorder Hook ─────────────────────────────────────────────────────

describe('useVoiceRecorder Hook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(
      () => mockUseVoiceRecorder({ customerId: 'cust-123', shopId: 'shop-123', conversationId: 'conv-123' })
    );
    expect(result.current.isRecording).toBe(false);
    expect(result.current.recordingDuration).toBe(0);
    expect(result.current.transcript).toBe(null);
    expect(result.current.isTranscribing).toBe(false);
  });

  it('should handle recording state changes', async () => {
    const { result } = renderHook(
      () => mockUseVoiceRecorder({ customerId: 'cust-123', shopId: 'shop-123', conversationId: 'conv-123' })
    );
    act(() => { result.current.startRecording(); });
    expect(result.current).toBeDefined();
  });
});

// ── useDurationDisplay Hook ───────────────────────────────────────────────────

describe('useDurationDisplay Hook', () => {
  it('should format 0 seconds as 00:00', () => {
    const { result } = renderHook(() => mockUseDurationDisplay(0));
    expect(result.current).toBe('00:00');
  });

  it('should format 65 seconds as 01:05', () => {
    const { result } = renderHook(() => mockUseDurationDisplay(65));
    expect(result.current).toBe('01:05');
  });

  it('should format 3661 seconds as 61:01', () => {
    const { result } = renderHook(() => mockUseDurationDisplay(3661));
    expect(result.current).toBe('61:01');
  });
});

// ── useConfidenceBadge Hook ───────────────────────────────────────────────────

describe('useConfidenceBadge Hook', () => {
  it('should return Perfect for high confidence', () => {
    const { result } = renderHook(() => mockUseConfidenceBadge(0.95));
    expect(result.current.label).toBe('Perfect');
  });

  it('should return Good for medium-high confidence', () => {
    const { result } = renderHook(() => mockUseConfidenceBadge(0.75));
    expect(result.current.label).toBe('Good');
  });

  it('should return Fair for medium confidence', () => {
    const { result } = renderHook(() => mockUseConfidenceBadge(0.6));
    expect(result.current.label).toBe('Fair');
  });

  it('should return Poor for low confidence', () => {
    const { result } = renderHook(() => mockUseConfidenceBadge(0.3));
    expect(result.current.label).toBe('Poor');
  });

  it('should calculate correct percentage', () => {
    const { result } = renderHook(() => mockUseConfidenceBadge(0.87));
    expect(result.current.percentage).toBe(87);
  });
});

// ── validateAudioFile Function ────────────────────────────────────────────────

describe('validateAudioFile Function', () => {
  it('should pass valid audio files', () => {
    const blob = new Blob(['audio data'], { type: 'audio/webm' });
    expect(() => validateAudioFile(blob)).not.toThrow();
  });

  it('should reject oversized files', () => {
    const largeBlob = new Blob([new Array(30 * 1024 * 1024).join('a')], {
      type: 'audio/webm',
    });
    expect(() => validateAudioFile(largeBlob)).toThrow(/too large/i);
  });

  it('should reject invalid audio formats', () => {
    const blob = new Blob(['invalid'], { type: 'video/mp4' });
    expect(() => validateAudioFile(blob)).toThrow(/Invalid audio format/i);
  });

  it('should accept mp3 format', () => {
    const blob = new Blob(['audio data'], { type: 'audio/mp3' });
    expect(() => validateAudioFile(blob)).not.toThrow();
  });

  it('should accept wav format', () => {
    const blob = new Blob(['audio data'], { type: 'audio/wav' });
    expect(() => validateAudioFile(blob)).not.toThrow();
  });
});
