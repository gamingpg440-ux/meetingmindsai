import { useState, useEffect, useRef } from 'react'
import { X, Send, Copy } from 'lucide-react'
import type { ChatMessage } from '../types'
import { streamGuidance } from '../lib/groq'

interface GuidancePanelProps {
  actionItem: string
  summary: string
  onClose: () => void
}

export default function GuidancePanel({ actionItem, summary, onClose }: GuidancePanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStreaming, setCurrentStreaming] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const guidanceTextRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isMounted = true
    const startStreaming = async () => {
      setIsLoading(true)
      setCurrentStreaming('')
      try {
        for await (const chunk of streamGuidance(actionItem, summary, [])) {
          if (isMounted) {
            setCurrentStreaming((prev) => prev + chunk)
          }
        }
        if (isMounted) {
          setMessages((prev) => [...prev, { role: 'assistant', content: currentStreaming }])
          setCurrentStreaming('')
        }
      } catch {
        if (isMounted) {
          setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error generating guidance.' }])
          setCurrentStreaming('')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    startStreaming()
    return () => { isMounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionItem, summary])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentStreaming])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage: ChatMessage = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setCurrentStreaming('')
    setIsLoading(true)

    try {
      for await (const chunk of streamGuidance(actionItem, summary, newMessages)) {
        setCurrentStreaming((prev) => prev + chunk)
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: currentStreaming }])
      setCurrentStreaming('')
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }])
      setCurrentStreaming('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    const text = guidanceTextRef.current?.innerText || ''
    navigator.clipboard.writeText(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <aside
        className="fixed z-50 bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col
          bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl border-t border-gray-200
          lg:top-0 lg:right-0 lg:left-auto lg:bottom-auto lg:h-full lg:w-[40%] lg:rounded-none lg:border-l lg:border-t-0
          translate-y-0 lg:translate-x-0"
        aria-label="AI Guidance Panel"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-base">AI Guidance</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              title="Copy all guidance"
            >
              <Copy size={14} />
              Copy
            </button>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4" ref={guidanceTextRef}>
          <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 leading-relaxed self-start">
            {actionItem}
          </span>

          <div className="flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {currentStreaming && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm">
                  {currentStreaming}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-shadow">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up question..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </aside>
  )
}