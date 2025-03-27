"use client"

import { ReactNode } from 'react'
import QueryProvider from './QueryProvider'
import { UserProvider } from '@/contexts/UserContext'

interface AppProvidersProps {
  children: ReactNode
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </QueryProvider>
  )
}
