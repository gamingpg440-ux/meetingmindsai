import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuthContext } from '../context/useAuthContext'

interface TopBarProps {
  title: string
  showBack?: boolean
  rightElement?: ReactNode
}

export default function TopBar({ title, showBack = false, rightElement }: TopBarProps) {
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const handleAvatarClick = () => {
    navigate('/settings')
  }

  const getFirstLetter = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="w-24 flex items-center">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
        </div>
        <h1 className="flex-1 text-center text-base font-semibold text-gray-900 truncate px-2">
          {title}
        </h1>
        <div className="w-24 flex items-center justify-end">
          {rightElement}
          {user && (
            <button
              onClick={handleAvatarClick}
              className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            >
              {getFirstLetter(user.email || '?')}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}