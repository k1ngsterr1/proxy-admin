"use client"

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, logout } from '@/lib/auth'
import { refreshSession } from '@/lib/axios'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    refreshSession().catch(() => {
      logout()
      router.replace('/login')
    })
  }, [router])

  // Если пользователь аутентифицирован, отображаем содержимое
  // В противном случае можно показать загрузку или пустой фрагмент
  return <>{children}</>
}
