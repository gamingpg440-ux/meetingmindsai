import Groq from 'groq-sdk'
import type { ChatMessage } from '../types'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
})

export default groq

export async function* streamGuidance(
  actionItem: string,
  meetingSummary: string,
  chatHistory: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
  const systemPrompt = `You are a task guidance assistant. The user is working on a specific action item from a meeting. Provide clear, step-by-step guidance on how to complete this task. Be concise and actionable.

Meeting context: ${meetingSummary}`

  const messages: Record<string, unknown>[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
    { role: 'user', content: `Action item: "${actionItem}"\n\nProvide step-by-step guidance.` },
  ]

  const stream = await groq.messages.stream({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2048,
    messages,
  })

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      yield chunk.delta.text
    }
  }
}