'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX } from 'lucide-react'

interface AudioPlayerProps {
  text: string
}

export function AudioPlayer({ text }: AudioPlayerProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.pitch = 1

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    } else {
      alert('Trình duyệt không hỗ trợ phát âm thanh')
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={speak}
      disabled={isSpeaking}
      className="gap-1 text-primary-600 hover:text-primary-700"
    >
      {isSpeaking ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </Button>
  )
}
