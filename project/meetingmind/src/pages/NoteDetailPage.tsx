import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil, ChevronDown, ChevronUp, Calendar, Clock, Timer, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
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
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedSummary, setEditedSummary] = useState('')
  const [editedActionItems, setEditedActionItems] = useState<string[]>([])
  const [editError, setEditError] = useState<string | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const { getNoteById, updateNote, deleteNote } = useNotes()

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessToast])

  useEffect(() => {
    if (!id) {
      queueMicrotask(() => {
        setError('Note ID not found')
        setLoading(false)
      })
      return
    }

    const controller = new AbortController()
    const fetchNote = async () => {
      try {
        const data = await getNoteById(id)
        if (!controller.signal.aborted) {
          if (!data) {
            setError('Note not found')
          } else {
            setNote(data)
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError('Failed to load note')
          console.error(err)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }
    fetchNote()
    return () => controller.abort()
  }, [id, getNoteById])

  const startEdit = () => {
    if (note) {
      setEditedTitle(note.title || '')
      setEditedSummary(note.summary || '')
      setEditedActionItems([...(note.action_items || [])])
    }
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditedTitle('')
    setEditedSummary('')
    setEditedActionItems([])
    setEditError(null)
  }

  const saveEdit = async () => {
    if (!note || !id) return
    setEditError(null)
    try {
      const updated = await updateNote(id, {
        title: editedTitle,
        summary: editedSummary,
        action_items: editedActionItems,
      })
      setNote(updated)
      setIsEditing(false)
      setShowSuccessToast(true)
    } catch (err) {
      setEditError('Failed to save note')
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!note || !id) return
    setDeleteError(null)
    try {
      await deleteNote(id)
      navigate('/dashboard')
    } catch (err) {
      setDeleteError('Failed to delete note')
      console.error(err)
    }
  }

  if (loading) {
    return <LoadingOverlay />
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        {error && <ErrorBanner message={error} />}
        {!error && <p className="text-gray-600">Note not found</p>}
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

  const actionItems: ActionItem[] = (note.action_items || []).map((item, idx) => ({
    id: `${idx}`,
    text: item,
  }))

  const date = new Date(note.created_at)
  const dateStr = format(date, 'd MMM yyyy')
  const timeStr = format(date, 'HH:mm')

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <TopBar
        title={note.title}
        showBack
        rightElement={
          isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={cancelEdit}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={startEdit}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                aria-label="Edit note"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                aria-label="Delete note"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )
        }
      />

      {showSuccessToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
          Note saved successfully
        </div>
      )}

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete Note</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure? This cannot be undone.</p>
            {deleteError && <ErrorBanner message={deleteError} />}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-5">
        {editError && <ErrorBanner message={editError} />}

        {isEditing && (
          <div className="mb-6">
            <input
              ref={titleInputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full text-2xl font-semibold text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        <div className="flex items-center gap-4 flex-wrap mb-6">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={13} />
            {dateStr}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={13} />
            {timeStr}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Timer size={13} />
            12 min
          </span>
        </div>

        <div className="flex flex-col gap-6 pb-8">
          <section>
            <h2 className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Summary
            </h2>
            {isEditing ? (
              <textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="w-full text-sm text-gray-700 leading-relaxed border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={4}
              />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed">
                {note.summary || 'No summary available yet.'}
              </p>
            )}
          </section>

          <hr className="border-gray-200" />

          <section>
            <h2 className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Action Items
            </h2>
            {isEditing ? (
              <div className="flex flex-col gap-2.5">
                {editedActionItems.map((item, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newItems = [...editedActionItems]
                      newItems[idx] = e.target.value
                      setEditedActionItems(newItems)
                    }}
                    className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ))}
              </div>
            ) : actionItems.length === 0 ? (
              <p className="text-sm text-gray-500">No action items.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {actionItems.map((item) => (
                  <ActionItemCard
                    key={item.id}
                    item={item}
                    onGetHelp={(it) => setSelectedItem(it)}
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
              <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                {transcriptOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
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