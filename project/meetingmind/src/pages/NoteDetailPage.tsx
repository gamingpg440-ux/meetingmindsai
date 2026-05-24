import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { Trash2, Calendar, Clock } from 'lucide-react'
import { useNotes } from '../hooks/useNotes'
import TopBar from '../components/TopBar'
import ActionItemCard, { type ActionItem } from '../components/ActionItemCard'
import GuidancePanel from '../components/GuidancePanel'
import ErrorBanner from '../components/ErrorBanner'
import LoadingOverlay from '../components/LoadingOverlay'
import type { Note } from '../types'

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null)
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const { getNoteById, deleteNote } = useNotes()

  useEffect(() => {
    if (!id) return

    let cancelled = false
    getNoteById(id)
      .then((data) => {
        if (!cancelled) {
          if (!data) {
            setError('Note not found')
          } else {
            setNote(data)
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError('Failed to load note')
          console.error(err)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [id, getNoteById])

  if (loading) return <LoadingOverlay />

  if (!id || error || !note) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        {(!id || error) && <ErrorBanner message={error || 'Note ID not found'} />}
        {!error && !id && <p className="text-gray-600">Note not found</p>}
      </div>
    )
  }

  if (!note.title) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-base text-gray-600 font-medium">Generating summary…</p>
        </div>
      </div>
    )
  }

  const date = new Date(note.created_at)
  const dateStr = format(date, 'd MMM yyyy')
  const timeStr = format(date, 'HH:mm')

  const actionItems: ActionItem[] = (note.action_items || []).map((item, idx) => ({
    id: `${idx}`,
    text: item,
  }))

  const handleDelete = async () => {
    try {
      await deleteNote(id)
      navigate('/dashboard')
    } catch {
      setError('Failed to delete. Please try again.')
      setDeleteConfirm(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <TopBar
        title={note.title || 'Untitled Meeting'}
        showBack
        rightElement={
          <button
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            aria-label="Delete note"
          >
            <Trash2 size={16} />
          </button>
        }
      />

      <div className="max-w-4xl mx-auto px-4 py-5">
        <div className="flex items-center gap-4 flex-wrap mb-6">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={13} />
            {dateStr}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={13} />
            {timeStr}
          </span>
        </div>

        <div className="flex flex-col gap-6 pb-8">
          <section>
            <h2 className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Summary
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {note.summary || 'No summary available yet.'}
            </p>
          </section>

          <hr className="border-gray-200" />

          <section>
            <h2 className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Action Items
            </h2>
            {actionItems.length === 0 ? (
              <p className="text-sm text-gray-500">No action items.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {actionItems.map((item) => (
                  <ActionItemCard
                    key={item.id}
                    item={item}
                    onGetHelp={setSelectedItem}
                  />
                ))}
              </div>
            )}
          </section>

          <hr className="border-gray-200" />

          <section>
            <button
              onClick={() => setTranscriptOpen(!transcriptOpen)}
              className="w-full flex items-center justify-between group focus:outline-none"
              aria-expanded={transcriptOpen}
            >
              <h2 className="text-xs font-semibold text-primary uppercase tracking-widest">
                Raw Transcript
              </h2>
            </button>
            {transcriptOpen && (
              <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 overflow-x-auto">
                <pre className="font-mono text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">
                  {note.raw_transcript}
                </pre>
              </div>
            )}
          </section>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete note?</h3>
            <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <GuidancePanel
          actionItem={selectedItem.text}
          summary={note.summary || ''}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  )
}