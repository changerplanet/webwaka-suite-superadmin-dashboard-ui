'use client'

import { createContext, useContext, ReactNode } from 'react'

interface TempAuthContextType {
  getToken: () => Promise<string | null>
  isAuthenticated: boolean
}

const TempAuthContext = createContext<TempAuthContextType>({
  getToken: async () => null,
  isAuthenticated: false,
})

export function TempAuthProvider({ children }: { children: ReactNode }) {
  // Temporary mock implementation - returns a placeholder token
  // In production, this will be replaced with proper Clerk authentication
  const getToken = async () => {
    // For now, return null to indicate no authentication
    // The API client will need to handle unauthenticated requests
    return null
  }

  return (
    <TempAuthContext.Provider value={{ getToken, isAuthenticated: false }}>
      {children}
    </TempAuthContext.Provider>
  )
}

export function useTempAuth() {
  return useContext(TempAuthContext)
}
