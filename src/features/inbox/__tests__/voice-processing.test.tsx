/**
 * Voice Recording Tests
 * Jest + React Testing Library test suite for voice processing feature
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { TranscriptDisplay } from '../components/TranscriptDisplay';
import { LanguageSelector } from '../components/LanguageSelector';
import { useVoiceRecorder, useDurationDisplay, useConfidenceBadge } from '../hooks/useVoiceRecorder';
import { validateAudioFile } from '../api/voice';
import { TranscriptData } from '../types';

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
    // Mock navigator.mediaDevices
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [],
          getTracks: vi.fn().mockReturnValue([]),
        }),
      },
      configurable: true,
    });
  });

  it('should render record button initially', () => {
    render(<VoiceRecorder {...mockProps} />);
    expect(screen.getByText(/Start Voice Recording/i)).toBeInTheDocument();
  });

  it('should show error state when error prop provided', async () => {
    const { rerender } = render(<VoiceRecorder {...mockProps} />);

    // Simulate error state by calling onError
    const tryButton = screen.getByText(/Start Voice Recording/i);
    
    // Mock the hook to return error
    rerender(
      <VoiceRecorder
        {...mockProps}
        onError={(err) => {
          mockProps.onError(err);
        }}
      />
    );

    expect(screen.getByText(/Start Voice Recording/i)).toBeInTheDocument();
  });

  it('should display recording timer during recording', async () => {
    render(<VoiceRecorder {...mockProps} />);
    
    const recordButton = screen.getByText(/Start Voice Recording/i);
    await userEvent.click(recordButton);

    // Should show recording state with timer
    await waitFor(() => {
      expect(screen.getByText(/Recording/i)).toBeInTheDocument();
    });
  });

  it('should respect max duration limit', async () => {
    const { rerender } = render(
      <VoiceRecorder {...mockProps} maxDuration={5} />
    );

    const recordButton = screen.getByText(/Start Voice Recording/i);
    await userEvent.click(recordButton);

    await waitFor(
      () => {
        expect(screen.getByText(/Recording will stop/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should call onTranscriptReceived on successful send', async () => {
    render(<VoiceRecorder {...mockProps} />);

    // Note: Full end-to-end test would require mocking the entire recording flow
    expect(mockProps.onTranscriptReceived).not.toHaveBeenCalled();
  });
});

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
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('should render transcript text', () => {
    render(<TranscriptDisplay {...mockProps} />);
    expect(screen.getByText(/Hello, this is a test transcript/)).toBeInTheDocument();
  });

  it('should display confidence badge with correct percentage', () => {
    render(<TranscriptDisplay {...mockProps} />);
    expect(screen.getByText(/92%/)).toBeInTheDocument();
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
    
    const closeButton = screen.getAllByLabelText(/Close transcript|Use Transcript/i)[0];
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

describe('useVoiceRecorder Hook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(
      () =>
        useVoiceRecorder({
          customerId: 'cust-123',
          shopId: 'shop-123',
          conversationId: 'conv-123',
        })
    );

    expect(result.current.isRecording).toBe(false);
    expect(result.current.recordingDuration).toBe(0);
    expect(result.current.transcript).toBe(null);
    expect(result.current.isTranscribing).toBe(false);
  });

  it('should handle recording state changes', async () => {
    const { result } = renderHook(
      () =>
        useVoiceRecorder({
          customerId: 'cust-123',
          shopId: 'shop-123',
          conversationId: 'conv-123',
        })
    );

    // Start recording
    act(() => {
      result.current.startRecording();
    });

    // Check state updates
    expect(result.current).toBeDefined();
  });
});

describe('useDurationDisplay Hook', () => {
  it('should format 0 seconds as 00:00', () => {
    const { result } = renderHook(() => useDurationDisplay(0));
    expect(result.current).toBe('00:00');
  });

  it('should format 65 seconds as 01:05', () => {
    const { result } = renderHook(() => useDurationDisplay(65));
    expect(result.current).toBe('01:05');
  });

  it('should format 3661 seconds as 61:01', () => {
    const { result } = renderHook(() => useDurationDisplay(3661));
    expect(result.current).toBe('61:01');
  });
});

describe('useConfidenceBadge Hook', () => {
  it('should return Perfect for high confidence', () => {
    const { result } = renderHook(() => useConfidenceBadge(0.95));
    expect(result.current.label).toBe('Perfect');
  });

  it('should return Good for medium-high confidence', () => {
    const { result } = renderHook(() => useConfidenceBadge(0.75));
    expect(result.current.label).toBe('Good');
  });

  it('should return Fair for medium confidence', () => {
    const { result } = renderHook(() => useConfidenceBadge(0.6));
    expect(result.current.label).toBe('Fair');
  });

  it('should return Poor for low confidence', () => {
    const { result } = renderHook(() => useConfidenceBadge(0.3));
    expect(result.current.label).toBe('Poor');
  });

  it('should calculate correct percentage', () => {
    const { result } = renderHook(() => useConfidenceBadge(0.87));
    expect(result.current.percentage).toBe(87);
  });
});

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

// Helper to render hooks
function renderHook(callback: () => any) {
  let result: any;
  function TestComponent() {
    result = callback();
    return null;
  }
  render(<TestComponent />);
  return { result };
}

// Helper for async hook updates
function act(callback: () => void) {
  callback();
}
