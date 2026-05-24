import { createContext } from 'react'
import type { User } from '@supabase/supabase-js'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  error: string | null
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)