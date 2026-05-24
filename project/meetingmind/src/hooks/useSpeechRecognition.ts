import { useState, useRef, useEffect, useCallback } from 'react'

export interface UseSpeechRecognitionResult {
  transcript: string
  interimTranscript: string
  isListening: boolean
  startRecording: () => void
  stopRecording: () => void
  error: string | null
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition
    SpeechRecognition: new () => SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  abort: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent {
  error: string
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionConstructor) {
      setError('Speech recognition not supported in this browser')
      return null
    }
    const recognition = new SpeechRecognitionConstructor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    return recognition
  }, [])

  const startRecording = useCallback(() => {
    setError(null)
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition()
    }
    if (recognitionRef.current) {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [initRecognition])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort()
      setIsListening(false)
    }
  }, [])

  useEffect(() => {
    if (!recognitionRef.current) return

    const recognition = recognitionRef.current

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let currentInterim = ''

      for (let i = event.results.length - 1; i >= 0; i--) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          currentInterim += result[0].transcript
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript)
      }
      setInterimTranscript(currentInterim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = event.error === 'not-allowed' 
        ? 'Microphone blocked. Allow microphone access in Chrome settings.'
        : event.error === 'network' 
        ? 'Network error. Please check your connection.'
        : `Error: ${event.error}`
      setError(errorMessage)
      setIsListening(false)
    }

    recognition.onend = () => {
      if (isListening) {
        recognition.start()
      }
    }

    return () => {
      if (recognition) {
        recognition.onresult = null
        recognition.onerror = null
        recognition.onend = null
      }
    }
  }, [isListening])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
    }
  }, [])

  return {
    transcript,
    interimTranscript,
    isListening,
    startRecording,
    stopRecording,
    error,
  }
}