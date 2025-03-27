"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { userApi, User } from "@/lib/api/user"
import { isAuthenticated } from "@/lib/auth"

interface UserContextType {
  user: User | null
  isLoading: boolean
  error: Error | null
  refetchUser: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['user-info'],
    queryFn: userApi.getInfo,
    enabled: isAuthenticated(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return (
    <UserContext.Provider
      value={{
        user: user || null,
        isLoading,
        error: error as Error | null,
        refetchUser: refetch,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
