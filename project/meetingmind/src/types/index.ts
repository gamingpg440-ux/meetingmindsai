export interface Note {
  id: string
  user_id: string
  created_at: string
  updated_at: string | null
  title: string | null
  raw_transcript: string
  summary: string | null
  action_items: string[] | null
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}