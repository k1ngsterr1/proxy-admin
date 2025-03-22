"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface TestAccessModalProps {
  proxyId: string
  isOpen: boolean
  onClose: () => void
  onSave: (proxyId: string, email: string, hours: number) => void
}

export default function TestAccessModal({ proxyId, isOpen, onClose, onSave }: TestAccessModalProps) {
  const [email, setEmail] = useState("")
  const [hours, setHours] = useState(24)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(proxyId, email, hours)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Выдать прокси на тест</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email получателя</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Срок тестирования (часов)</label>
              <div className="flex gap-2">
                {[12, 24, 48, 72].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`py-2 px-3 rounded-md ${hours === option ? "bg-primary text-black" : "bg-secondary"}`}
                    onClick={() => setHours(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Другой период (часов)</label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(Number.parseInt(e.target.value, 10))}
                className="input w-full"
                min="1"
                max="168"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">
              Отмена
            </button>
            <button type="submit" className="btn-primary">
              Выдать
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

