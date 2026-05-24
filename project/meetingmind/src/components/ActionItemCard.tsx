import { useState } from 'react'
import { CheckSquare, Square } from 'lucide-react'

export interface ActionItem {
  id: string
  text: string
}

interface ActionItemCardProps {
  item: ActionItem
  onGetHelp: (item: ActionItem) => void
}

export default function ActionItemCard({ item, onGetHelp }: ActionItemCardProps) {
  const [done, setDone] = useState(false)

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
        done
          ? 'bg-green-50/50 border-green-200 opacity-60'
          : 'bg-[#F0FDF4] border-green-200 hover:border-green-300'
      }`}
    >
      <button
        onClick={() => setDone(!done)}
        className="mt-0.5 flex-shrink-0 text-green-600 hover:text-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 rounded"
        aria-label={done ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {done ? <CheckSquare size={18} /> : <Square size={18} />}
      </button>
      <p
        className={`flex-1 text-sm text-gray-800 leading-relaxed ${
          done ? 'line-through text-gray-400' : ''
        }`}
      >
        {item.text}
      </p>
      {!done && (
        <button
          onClick={() => onGetHelp(item)}
          className="flex-shrink-0 text-xs font-medium text-primary border border-primary/30 rounded-lg px-2.5 py-1 hover:bg-primary hover:text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 whitespace-nowrap"
        >
          Get Help
        </button>
      )}
    </div>
  )
}