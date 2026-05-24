import { ChevronRight, LogOut } from 'lucide-react'
import TopBar from '../components/TopBar'
import { useAuthContext } from '../context/useAuthContext'

interface SettingsRowProps {
  label: string
  value?: string
  danger?: boolean
  onClick?: () => void
  avatar?: boolean
  avatarLetter?: string
}

function SettingsRow({ label, value, danger, onClick, avatar, avatarLetter }: SettingsRowProps) {
  const content = (
    <div
      className={`flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100 last:border-0 ${
        onClick ? 'hover:bg-gray-50 cursor-pointer transition-colors' : ''
      } ${danger ? 'text-red-500' : ''}`}
    >
      <span className={`text-sm font-medium ${danger ? 'text-red-500' : 'text-gray-900'}`}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        {avatar && avatarLetter && (
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
            {avatarLetter}
          </div>
        )}
        {value && <span className="text-sm text-gray-500">{value}</span>}
        {onClick && !danger && <ChevronRight size={16} className="text-gray-400" />}
      </div>
    </div>
  )

  if (onClick) {
    return (
      <button className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset" onClick={onClick}>
        {content}
      </button>
    )
  }
  return <div>{content}</div>
}

export default function SettingsPage() {
  const { user, signOut } = useAuthContext()

  const getFirstLetter = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <TopBar title="Settings" showBack />

      <main className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 px-1">
            Account
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <SettingsRow
              label={user.email || ''}
              avatar
              avatarLetter={getFirstLetter(user.email || '?')}
            />
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 px-1">
            Preferences
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <SettingsRow label="Language" value="English (en-US)" onClick={() => {}} />
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 px-1">
            App
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <SettingsRow label="About" value="MeetingMind v1.0" />
          </div>
        </section>

        <div className="pt-2">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 bg-white text-red-500 font-semibold text-sm hover:bg-red-50 hover:border-red-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 active:scale-[0.98]"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </main>
    </div>
  )
}