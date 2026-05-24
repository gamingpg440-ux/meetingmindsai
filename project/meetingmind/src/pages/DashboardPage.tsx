import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, Plus } from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { useNotes } from '../hooks/useNotes'
import SearchBar from '../components/SearchBar'
import NoteCard, { type NoteCardData } from '../components/NoteCard'
import DateGroupHeader from '../components/DateGroupHeader'
import ErrorBanner from '../components/ErrorBanner'
import type { Note } from '../types'

function getDateLabel(date: Date): string {
  if (isToday(date)) return `Today, ${format(date, 'd MMM yyyy')}`
  if (isYesterday(date)) return `Yesterday, ${format(date, 'd MMM yyyy')}`
  return format(date, 'd MMM yyyy')
}

function durationFromMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getAllNotes } = useNotes()

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getAllNotes()
        setNotes(data)
      } catch (err) {
        setError('Failed to load notes. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchNotes()
  }, [getAllNotes])

    const filteredGroups = useMemo(() => {
      const q = search.toLowerCase().trim()
      const filteredNotes = !q
        ? notes
        : notes.filter(
            (n) =>
              ((n.title ?? '').toLowerCase().includes(q) ||
               (n.summary ?? '').toLowerCase().includes(q))
          )

      const groupsMap = new Map<string, NoteCardData[]>()
      filteredNotes.forEach((note) => {
        const date = new Date(note.created_at)
        const label = getDateLabel(date)
        const timeStr = format(date, 'HH:mm')
        const cardData: NoteCardData = {
          id: note.id,
          title: note.title || 'Untitled Meeting',
          time: timeStr,
          actionItems: note.action_items?.length || 0,
          duration: durationFromMinutes(12),
        }
        if (!groupsMap.has(label)) groupsMap.set(label, [])
        groupsMap.get(label)!.push(cardData)
      })
      return Array.from(groupsMap.entries()).map(([label, notes]) => ({ label, notes }))
    }, [notes, search])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {error && <ErrorBanner message={error} />}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic size={22} className="text-primary" />
            <span className="font-semibold text-lg text-gray-900 tracking-tight">MeetingMind</span>
          </div>
          <button
            onClick={() => navigate('/session')}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 whitespace-nowrap"
          >
            <Plus size={16} />
            New Session
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full px-4 py-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search notes..." />
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 gap-3">
            <Mic size={56} className="text-primary/30" />
            <p className="text-gray-700 font-medium text-base">
              {search ? 'No notes match your search. Try a different keyword.' : 'No meetings recorded yet.'}
            </p>
            {!search && (
              <p className="text-sm text-gray-400">Click '+ New Session' to get started.</p>
            )}
          </div>
        ) : (
          <div className="pb-8">
            {filteredGroups.map((group) => (
              <div key={group.label}>
                <DateGroupHeader label={group.label} />
                <div className="px-4 py-3 flex flex-col gap-2.5">
                  {group.notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}