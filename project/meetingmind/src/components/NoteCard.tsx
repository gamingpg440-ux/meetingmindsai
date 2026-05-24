import { useNavigate } from 'react-router-dom'
import { Clock, Tag, Timer } from 'lucide-react'

export interface NoteCardData {
  id: string
  title: string
  time: string
  actionItems: number
  duration: string
}

interface NoteCardProps {
  note: NoteCardData
}

export default function NoteCard({ note }: NoteCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/notes/${note.id}`)}
      className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
    >
      <p className="font-semibold text-gray-900 text-base group-hover:text-primary transition-colors mb-2 leading-snug">
        {note.title}
      </p>
      <div className="flex items-center gap-4 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={13} />
          {note.time}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <Tag size={13} />
          {note.actionItems} action {note.actionItems === 1 ? 'item' : 'items'}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <Timer size={13} />
          {note.duration}
        </span>
      </div>
    </button>
  )
}
