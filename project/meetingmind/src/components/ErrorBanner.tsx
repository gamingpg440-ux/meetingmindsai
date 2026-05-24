import { AlertTriangle, X } from 'lucide-react'
import { useEffect } from 'react'

interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  useEffect(() => {
    if (!onDismiss) return
    const timer = setTimeout(() => {
      onDismiss()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">
      <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
      <p className="flex-1 leading-relaxed">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors focus:outline-none"
          aria-label="Dismiss error"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
