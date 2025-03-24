"use client"

import type React from "react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
}
