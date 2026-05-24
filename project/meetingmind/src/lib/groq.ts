import Groq from 'groq-sdk'
import type { ChatMessage } from '../types'
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions'

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

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: `Action item: "${actionItem}"\n\nProvide step-by-step guidance.` },
  ]

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2048,
    messages,
    stream: true,
  })

  for await (const chunk of stream) {
    if (chunk.choices[0]?.delta?.content) {
      yield chunk.choices[0].delta.content
    }
  }
}