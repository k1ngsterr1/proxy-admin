"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface ExtendProxyModalProps {
  proxyId: string
  currentExpiry: string
  isOpen: boolean
  onClose: () => void
  onSave: (proxyId: string, days: number) => void
}

export default function ExtendProxyModal({ proxyId, currentExpiry, isOpen, onClose, onSave }: ExtendProxyModalProps) {
  const [days, setDays] = useState(30)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(proxyId, days)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Продлить прокси</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={18} />
          </button>
        </div>

        <p className="mb-4">
          Текущий срок действия: <span className="font-medium">{new Date(currentExpiry).toLocaleDateString()}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Продлить на (дней)</label>
              <div className="flex gap-2">
                {[30, 60, 90, 180, 365].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`py-2 px-3 rounded-md ${days === option ? "bg-primary text-black" : "bg-secondary"}`}
                    onClick={() => setDays(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Другой период (дней)</label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(Number.parseInt(e.target.value, 10))}
                className="input w-full"
                min="1"
                required
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Новый срок действия:{" "}
              <span className="font-medium">
                {new Date(new Date(currentExpiry).getTime() + days * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">
              Отмена
            </button>
            <button type="submit" className="btn-primary">
              Продлить
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

