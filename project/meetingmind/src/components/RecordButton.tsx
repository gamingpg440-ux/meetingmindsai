import { Mic, Square } from 'lucide-react'

interface RecordButtonProps {
  recording: boolean
  onClick: () => void
}

export default function RecordButton({ recording, onClick }: RecordButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl active:scale-95 ${
        recording
          ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
          : 'bg-primary text-white hover:bg-primary-hover focus:ring-primary'
      }`}
    >
      {recording ? (
        <>
          <Square size={20} />
          Stop & Save Session
        </>
      ) : (
        <>
          <Mic size={20} />
          Start Recording
        </>
      )}
    </button>
  )
}
