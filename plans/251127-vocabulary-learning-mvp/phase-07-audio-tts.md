# Phase 7: Audio TTS Integration

**Date**: 2025-11-27
**Priority**: Medium
**Status**: Pending
**Estimated Time**: 1-2 hours

---

## Overview

Implement text-to-speech (TTS) audio playback for vocabulary words using Web Speech API (MVP). Document upgrade path to Google Cloud TTS for production.

---

## Requirements

1. Audio playback button on vocabulary cards
2. Web Speech API integration (free, browser-based)
3. Voice selection (English US/UK)
4. Play/pause controls
5. Error handling for unsupported browsers
6. Optional: Supabase Storage for pre-generated audio (Phase 2)

---

## Architecture

**MVP Approach**: Web Speech API
- Browser-based TTS (no server cost)
- Client-side component
- Works on most modern browsers
- Limitations: voice quality, offline support

**Production Upgrade Path**: Google Cloud TTS
- Higher quality voices
- Pre-generate and cache audio files
- Store in Supabase Storage
- Fallback to Web Speech API if cached audio unavailable

---

## Implementation Steps

### 1. Create Audio Player Component

Create `components/audio-player.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";

interface AudioPlayerProps {
  text: string;
  lang?: string;
}

export function AudioPlayer({ text, lang = "en-US" }: AudioPlayerProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if Web Speech API is supported
    if (typeof window !== "undefined" && !("speechSynthesis" in window)) {
      setSupported(false);
    }
  }, []);

  const speak = () => {
    if (!supported) {
      alert("Trình duyệt của bạn không hỗ trợ phát âm thanh");
      return;
    }

    if (speaking) {
      // Stop current speech
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    setLoading(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for clarity

    // Try to select a preferred voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.lang === lang && voice.name.includes("Google")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setLoading(false);
      setSpeaking(true);
    };

    utterance.onend = () => {
      setSpeaking(false);
    };

    utterance.onerror = (error) => {
      console.error("Speech synthesis error:", error);
      setSpeaking(false);
      setLoading(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  if (!supported) {
    return null;
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={speak}
      disabled={loading}
      title="Phát âm"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : speaking ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );
}
```

### 2. Add Audio Player to Vocabulary Table

Update `components/vocabulary-table.tsx`:

```typescript
import { AudioPlayer } from "./audio-player";

// In TableRow, add audio player column:
<TableCell>
  <AudioPlayer text={word.word} />
</TableCell>
```

Update table header:
```typescript
<TableHead>Âm thanh</TableHead>
```

### 3. Add Audio Player to Flashcard

Update `components/flashcard.tsx`:

```typescript
import { AudioPlayer } from "./audio-player";

// In flashcard content, add audio button:
<div className="text-center">
  <div className="flex items-center justify-center gap-2">
    <h2 className="text-5xl font-bold">{word.word}</h2>
    <AudioPlayer text={word.word} />
  </div>
  {word.phonetic && (
    <p className="text-xl text-muted-foreground">{word.phonetic}</p>
  )}
</div>
```

### 4. Create Voice Settings (Optional)

Create `components/voice-settings.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function VoiceSettings() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter((voice) =>
        voice.lang.startsWith("en")
      );
      setVoices(englishVoices);

      // Set default voice
      const defaultVoice = englishVoices.find((v) => v.default);
      if (defaultVoice) {
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();

    // Chrome loads voices async
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  if (voices.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label>Giọng đọc</Label>
      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
        <SelectTrigger>
          <SelectValue placeholder="Chọn giọng đọc" />
        </SelectTrigger>
        <SelectContent>
          {voices.map((voice) => (
            <SelectItem key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

### 5. Add Auto-Play Option to Flashcard

Update `components/flashcard.tsx`:

```typescript
"use client";

import { useEffect } from "react";
import { AudioPlayer } from "./audio-player";
import type { Word } from "@/types/database";

interface FlashcardProps {
  word: Word;
  isFlipped: boolean;
  autoPlay?: boolean;
}

export function Flashcard({ word, isFlipped, autoPlay = false }: FlashcardProps) {
  useEffect(() => {
    if (autoPlay && !isFlipped && typeof window !== "undefined") {
      // Auto-play word pronunciation when card appears
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  }, [word, isFlipped, autoPlay]);

  // ... rest of component
}
```

### 6. Create Audio Utility Functions

Create `lib/audio.ts`:

```typescript
export function speak(text: string, lang = "en-US"): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("Speech synthesis not supported"));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;

    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function getAvailableVoices(lang = "en"): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];

  const voices = window.speechSynthesis.getVoices();
  return voices.filter((voice) => voice.lang.startsWith(lang));
}
```

### 7. Handle Browser Compatibility

Create `components/browser-check.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function BrowserCheck() {
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !("speechSynthesis" in window)) {
      setUnsupported(true);
    }
  }, []);

  if (!unsupported) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Trình duyệt không hỗ trợ</AlertTitle>
      <AlertDescription>
        Trình duyệt của bạn không hỗ trợ phát âm thanh. Vui lòng sử dụng Chrome,
        Edge, hoặc Safari để có trải nghiệm tốt nhất.
      </AlertDescription>
    </Alert>
  );
}
```

Add to vocabulary and practice pages:
```typescript
import { BrowserCheck } from "@/components/browser-check";

// In page component:
<BrowserCheck />
```

### 8. Add Alert Component (shadcn)

```bash
npx shadcn@latest add alert
```

### 9. Test Audio Playback

1. Visit vocabulary list
2. Click audio button on word
3. Verify pronunciation plays
4. Test on flashcard practice
5. Try different browsers (Chrome, Firefox, Safari)
6. Test on mobile devices
7. Verify error handling for unsupported browsers

---

## Production Upgrade Path: Google Cloud TTS

### Future Implementation (Phase 2)

**Step 1: Set up Google Cloud TTS**

```typescript
// lib/tts.ts
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

const client = new TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function generateAudio(text: string): Promise<Buffer> {
  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode: "en-US", name: "en-US-Neural2-J" },
    audioConfig: { audioEncoding: "MP3" },
  });

  return Buffer.from(response.audioContent as Uint8Array);
}
```

**Step 2: Create Server Action to Generate & Store Audio**

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { generateAudio } from "@/lib/tts";

export async function generateWordAudio(wordId: string) {
  const supabase = await createClient();
  const { data: word } = await supabase
    .from("words")
    .select("word")
    .eq("id", wordId)
    .single();

  if (!word) return { error: "Word not found" };

  // Generate audio
  const audioBuffer = await generateAudio(word.word);

  // Upload to Supabase Storage
  const fileName = `${wordId}.mp3`;
  const { data, error } = await supabase.storage
    .from("vocab-audio")
    .upload(fileName, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (error) return { error: error.message };

  // Update word with audio URL
  const { data: { publicUrl } } = supabase.storage
    .from("vocab-audio")
    .getPublicUrl(fileName);

  await supabase
    .from("words")
    .update({ audio_url: publicUrl })
    .eq("id", wordId);

  return { success: true, url: publicUrl };
}
```

**Step 3: Update Audio Player to Use Cached Audio**

```typescript
// Fallback logic: try audio_url first, then Web Speech API
if (word.audio_url) {
  // Use <audio> element with cached file
  const audio = new Audio(word.audio_url);
  audio.play();
} else {
  // Fall back to Web Speech API
  window.speechSynthesis.speak(utterance);
}
```

**Costs**: ~$4 per 1 million characters (~250k words)

---

## Success Criteria

- [ ] Audio player button displays on vocabulary table
- [ ] Audio player button displays on flashcard
- [ ] Clicking audio button speaks the word
- [ ] Speech synthesis works on Chrome, Edge, Safari
- [ ] Stop button cancels ongoing speech
- [ ] Loading state displayed while preparing audio
- [ ] Unsupported browser warning shown
- [ ] Voice quality acceptable for MVP
- [ ] No crashes or errors in console

---

## Related Files

**Created**:
- `components/audio-player.tsx` - Audio playback component
- `components/voice-settings.tsx` - Voice selection (optional)
- `components/browser-check.tsx` - Browser compatibility check
- `lib/audio.ts` - Audio utility functions

**Modified**:
- `components/vocabulary-table.tsx` - Add audio column
- `components/flashcard.tsx` - Add audio button

---

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 33+ | ✅ | Full support, best voice quality |
| Edge 14+ | ✅ | Full support |
| Safari 7+ | ✅ | Full support |
| Firefox 49+ | ⚠️ | Limited voices, may require user interaction |
| Mobile Safari | ✅ | Works on iOS 7+ |
| Chrome Android | ✅ | Works on Android 4.4+ |

---

## Limitations (Web Speech API)

- Voice quality varies by browser/OS
- No offline support
- Limited voice customization
- Requires user interaction (no auto-play on page load in some browsers)
- Network-dependent on some platforms

**Solutions**:
- Upgrade to Google Cloud TTS for production (Phase 2)
- Pre-generate and cache audio files
- Provide download option for offline use

---

## Enhancement Ideas (Phase 2)

- Google Cloud TTS integration
- Audio caching in Supabase Storage
- Playback speed control
- Voice accent selection (US/UK/AU)
- Pronunciation drills (record and compare)
- Offline audio download

---

## Notes

- Web Speech API is free and sufficient for MVP
- Voice quality acceptable for learning purposes
- Upgrade to Google Cloud TTS when budget allows
- Audio player is client component (requires browser APIs)
- Keep UI simple - single button for play/pause

---

## Deployment Checklist

- [ ] Test audio on production domain (HTTPS required)
- [ ] Verify browser compatibility across devices
- [ ] Document known limitations in user guide
- [ ] Add Google Cloud TTS to roadmap (Phase 2)

---

## Conclusion

This completes Phase 7 and the MVP implementation plan. All core features (auth, CRUD, practice, stats, audio) are now documented with detailed implementation steps.
