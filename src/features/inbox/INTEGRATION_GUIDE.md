/**
 * Voice Processing Integration Guide
 * How to integrate voice recording components into your inbox/chat interface
 */

# Voice Processing Integration Guide

## Quick Start

### 1. Basic Usage in Inbox Chat

```tsx
import React, { useState } from 'react';
import { VoiceRecorder, TranscriptDisplay } from '@/features/inbox';
import { TranscriptData } from '@/features/inbox';

export function InboxChatInterface() {
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {/* Transcript display if available */}
      {transcript && (
        <TranscriptDisplay
          transcript={transcript}
          onDismiss={() => setTranscript(null)}
          onCopy={() => console.log('Copied to clipboard')}
        />
      )}

      {/* Voice recorder */}
      <VoiceRecorder
        conversationId="conv-123"
        customerId="user-456"
        shopId="shop-789"
        onTranscriptReceived={(result) => {
          setTranscript(result);
          // You can also automatically send the transcript as a message
          // submitMessage(result.transcript);
        }}
        onError={(err) => {
          setError(err);
          console.error('Voice processing error:', err.message);
        }}
        maxDuration={300}
      />

      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error.message}
        </div>
      )}
    </div>
  );
}
```

### 2. With Toolbar Integration

```tsx
import { VoiceRecorder, LanguageSelectorWithPersistence } from '@/features/inbox';
import { Mic } from 'lucide-react';

export function ChatToolbar() {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  return (
    <div className="flex items-center gap-2 p-3 border-t">
      {/* Language selector */}
      <LanguageSelectorWithPersistence
        onLanguageChange={(lang) => console.log('Language changed to:', lang)}
      />

      {/* Voice button */}
      <button
        onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
        className="p-2 hover:bg-gray-200 rounded"
      >
        <Mic className="w-5 h-5" />
      </button>

      {/* Voice recorder panel */}
      {showVoiceRecorder && (
        <div className="absolute bottom-16 left-0 right-0 p-4 bg-white shadow-lg rounded-t">
          <VoiceRecorder
            conversationId="conv-123"
            customerId="user-456"
            shopId="shop-789"
            onTranscriptReceived={(result) => {
              // Insert transcript into message input
              setMessageInput(result.transcript);
              setShowVoiceRecorder(false);
            }}
            onError={(err) => alert(err.message)}
          />
        </div>
      )}
    </div>
  );
}
```

### 3. Using Hooks Directly

```tsx
import {
  useVoiceRecorder,
  useLanguageSelection,
  useDurationDisplay,
} from '@/features/inbox';

export function CustomVoiceInterface() {
  const {
    isRecording,
    recordingDuration,
    transcript,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
  } = useVoiceRecorder({
    customerId: 'user-456',
    shopId: 'shop-789',
    conversationId: 'conv-123',
    maxDuration: 300,
  });

  const { selectedLanguage } = useLanguageSelection();
  const durationDisplay = useDurationDisplay(recordingDuration);

  return (
    <div>
      <p>Language: {selectedLanguage}</p>
      <p>Duration: {durationDisplay}</p>
      {isRecording && <p>Recording...</p>}
      {isTranscribing && <p>Transcribing...</p>}
      {transcript && <p>Result: {transcript.transcript}</p>}
    </div>
  );
}
```

## Integration Points

### Redux/Zustand State Management

```tsx
// Store slice
export const voiceSlice = createSlice({
  name: 'voice',
  initialState: {
    activeTranscript: null as TranscriptData | null,
    recordingLanguage: 'auto' as Languages,
  },
  reducers: {
    setActiveTranscript: (state, action) => {
      state.activeTranscript = action.payload;
    },
    setRecordingLanguage: (state, action) => {
      state.recordingLanguage = action.payload;
    },
  },
});

// In component
import { useDispatch, useSelector } from 'react-redux';

export function VoiceIntegration() {
  const dispatch = useDispatch();
  const { activeTranscript } = useSelector((state) => state.voice);

  return (
    <VoiceRecorder
      onTranscriptReceived={(result) => {
        dispatch(setActiveTranscript(result));
      }}
      // ...
    />
  );
}
```

### API Error Handling

```tsx
import { processVoiceMessageWithRetry } from '@/features/inbox';

export async function handleVoiceUpload(audioBlob: Blob) {
  try {
    const transcript = await processVoiceMessageWithRetry(
      {
        messageId: generateUUID(),
        customerId: auth.userId,
        shopId: auth.shopId,
        mediaData: { mediaId: generateUUID() },
      },
      audioBlob,
      3, // max retries
      1000 // base delay
    );

    // Success
    addMessageToChat(transcript.transcript);
  } catch (error) {
    if (error.status === 400) {
      showError('Invalid audio format');
    } else if (error.status === 500) {
      showError('Transcription service error. Try again.');
    } else {
      showError('Network error. Check your connection.');
    }

    // Log to error tracking
    Sentry.captureException(error, {
      tags: { feature: 'voice-recording' },
    });
  }
}
```

### Mobile Responsiveness

```tsx
export function ResponsiveVoiceInterface() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className={isMobile ? 'p-2' : 'p-4'}>
      <VoiceRecorder
        maxDuration={isMobile ? 120 : 300}
        // Mobile gets shorter max duration
      />
    </div>
  );
}
```

## Browser Compatibility

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 49+ | ✅ Full | Recommended |
| Firefox | 25+ | ✅ Full | Minor UX differences |
| Safari | 14.1+ | ✅ Full | iOS 14.5+ required |
| Edge | 79+ | ✅ Full | Full support |
| Samsung Browser | 5+ | ✅ Full | Full support |
| IE | All | ❌ No | Not supported |

## Testing

### Unit Test Example

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VoiceRecorder } from '@/features/inbox';

describe('VoiceRecorder Integration', () => {
  it('should record and upload voice', async () => {
    const onTranscript = vi.fn();

    render(
      <VoiceRecorder
        conversationId="test-conv"
        customerId="test-user"
        shopId="test-shop"
        onTranscriptReceived={onTranscript}
        onError={vi.fn()}
      />
    );

    // Click record
    const recordBtn = screen.getByText(/Start Voice Recording/i);
    await userEvent.click(recordBtn);

    // Wait for recording state
    expect(screen.getByText(/Recording/i)).toBeInTheDocument();

    // Simulate recording completion (in real test, mock MediaRecorder)
    // ...

    // Verify transcript received
    // expect(onTranscript).toHaveBeenCalled();
  });
});
```

### E2E Test Example

```tsx
// Playwright test
import { test, expect } from '@playwright/test';

test('voice recording end-to-end', async ({ page }) => {
  await page.goto('/inbox');

  // Click record button
  await page.click('button:has-text("Start Voice Recording")');

  // Wait for recording UI
  await expect(page.locator('text=Recording')).toBeVisible();

  // Simulate recording (in real test, would record actual audio)
  // Stop recording
  await page.click('button:has-text("Send")');

  // Wait for transcription
  await expect(page.locator('text=Transcription Complete')).toBeVisible();

  // Verify transcript displayed
  const transcript = page.locator('text=Transcription Complete').next();
  await expect(transcript).toContainText('test');
});
```

## Accessibility

### ARIA Labels

All buttons have `aria-label` attributes:
- Record: `aria-label="Start voice recording"`
- Stop: `aria-label="Stop recording and send"`
- Copy: `aria-label="Copy to clipboard"`

### Keyboard Support

- **Enter**: Send recording
- **Escape**: Cancel recording
- **Tab**: Navigate buttons

### Screen Reader Announcements

```tsx
// Component logs screen reader announcements
<div role="status" aria-live="polite" aria-atomic="true">
  {isRecording && 'Recording started'}
  {isTranscribing && 'Transcribing audio'}
  {transcript && 'Transcription complete'}
</div>
```

## Performance Considerations

### Bundle Size

- VoiceRecorder component: ~12 KB (gzipped)
- All hooks: ~8 KB (gzipped)
- Total feature: ~20 KB (gzipped)

### Optimization Tips

1. **Lazy load**: Use React.lazy for voice feature
2. **Code splitting**: Load on-demand in inbox view
3. **Defer non-critical**: Don't load language selector until needed

```tsx
const VoiceFeature = React.lazy(() => import('@/features/inbox'));

export function Inbox() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VoiceFeature />
    </Suspense>
  );
}
```

## Monitoring & Analytics

```tsx
import { track } from '@/lib/analytics';

export function VoiceWithTracking() {
  return (
    <VoiceRecorder
      onTranscriptReceived={(result) => {
        track('voice_recording_complete', {
          duration: result.duration,
          language: result.language,
          confidence: result.confidence,
          length: result.length,
        });
      }}
      onError={(error) => {
        track('voice_recording_error', {
          code: error.code,
          message: error.message,
        });
      }}
    />
  );
}
```

## Environment Variables

```bash
# .env.local
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SENTRY_DSN=https://example@sentry.io/123456
```

## Troubleshooting

### Microphone not working

1. Check browser permissions (chrome://settings/content/microphone)
2. Ensure HTTPS (required for getUserMedia)
3. Check device has functional microphone

### Transcription fails

1. Verify backend service is running
2. Check internet connectivity
3. Try shorter audio clip
4. Review backend logs for API errors

### UI not rendering

1. Verify lucide-react icons installed
2. Check Tailwind CSS configured
3. Ensure React 18+ installed
4. Check browser console for errors

## Performance Checklist

- [ ] Audio chunks streamed (not entire file at once)
- [ ] Debounce file upload (prevent rapid clicks)
- [ ] Cache language selection in localStorage
- [ ] Lazy load Web Audio API
- [ ] Gzip compress component bundle
- [ ] Test on 3G network for latency
- [ ] Mobile permission prompt tested
- [ ] Recording works offline (queueing) [optional]

## Deployment Checklist

- [ ] Backend endpoint /api/ai/voice/process configured
- [ ] Gemini API key configured in backend
- [ ] Error tracking (Sentry) configured
- [ ] Analytics events configured
- [ ] Voice recording permission prompt tested on mobile
- [ ] Transcription tested with 5+ audio samples
- [ ] Language detection accuracy verified
- [ ] Error toasts display correctly
- [ ] Accessibility audit passed
- [ ] Performance: cold load <2s, transcription <10s
- [ ] User documentation updated
- [ ] Training materials for support team prepared

## Next Steps

1. Integrate into inbox chat interface
2. Add message composition with voice
3. Implement voice message playback
4. Build voice analytics dashboard
5. Add voice-to-sentiment integration
6. Implement voice message editing
