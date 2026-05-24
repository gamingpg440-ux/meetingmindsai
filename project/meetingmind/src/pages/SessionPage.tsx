import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, ArrowLeft } from 'lucide-react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useNotes } from '../hooks/useNotes'
import ErrorBanner from '../components/ErrorBanner'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function SessionPage() {
  const navigate = useNavigate()
  const [elapsed, setElapsed] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { transcript, interimTranscript, isListening, startRecording, stopRecording, error: speechError } = useSpeechRecognition()
  const { saveNote, updateNote, summariseTranscript } = useNotes()

  useEffect(() => {
    if (isListening) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isListening])

  const handleStart = () => {
    setElapsed(0)
    startRecording()
  }

  const handleStop = async () => {
    stopRecording()
    setIsSaving(true)
    setSaveError(null)
    try {
      const note = await saveNote(transcript)
      const { title, summary, action_items } = await summariseTranscript(transcript)
      await updateNote(note.id, { title, summary, action_items })
      navigate(`/notes/${note.id}`)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isListening) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
        {speechError && <ErrorBanner message={speechError} />}
        <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center">
            <Mic size={48} className="text-primary" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Ready to record</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Click the button below to start capturing your meeting
            </p>
          </div>
          <button
            onClick={handleStart}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl active:scale-95 bg-primary text-white hover:bg-primary-hover focus:ring-primary"
          >
            <Mic size={20} />
            Start Recording
          </button>
          <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
            Audio is processed locally in your browser. Nothing is uploaded.
          </p>
        </div>
      </div>
    )
  }

  if (isSaving) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-base text-gray-600 font-medium">Generating your notes…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {speechError && <ErrorBanner message={speechError} />}
      {saveError && <ErrorBanner message={saveError} />}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="font-mono text-base font-semibold text-gray-700 tabular-nums">
            {formatTime(elapsed)}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-5 flex flex-col gap-4">
        <div className="flex items-center justify-center gap-2.5 py-2">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          <span className="text-sm font-semibold text-red-500 tracking-wide">Recording...</span>
        </div>

        <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-xl p-4 font-mono text-sm min-h-0">
          <div className="flex flex-col gap-3">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{transcript}</p>
            {interimTranscript && (
              <p className="text-gray-400 leading-relaxed whitespace-pre-wrap italic">{interimTranscript}</p>
            )}
          </div>
        </div>

        <div className="flex justify-center py-2 flex-shrink-0">
          <button
            onClick={handleStop}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl active:scale-95 bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
          >
            ⏹ Stop & Save Session
          </button>
        </div>
      </main>
    </div>
  )
}