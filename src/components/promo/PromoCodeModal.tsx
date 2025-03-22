"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, RefreshCw } from "lucide-react"
import type { PromoCode } from "../../types"

interface PromoCodeModalProps {
  promoCode: PromoCode | null
  isOpen: boolean
  onClose: () => void
  onSave: (promoCode: PromoCode) => void
}

export default function PromoCodeModal({ promoCode, isOpen, onClose, onSave }: PromoCodeModalProps) {
  const [formData, setFormData] = useState<Partial<PromoCode>>({
    code: "",
    discount: 10,
    maxUses: 0,
    currentUses: 0,
    expiresAt: "",
    isActive: true,
  })

  useEffect(() => {
    if (promoCode) {
      setFormData({
        code: promoCode.code,
        discount: promoCode.discount,
        maxUses: promoCode.maxUses,
        currentUses: promoCode.currentUses,
        expiresAt: new Date(promoCode.expiresAt).toISOString().split("T")[0],
        isActive: promoCode.isActive,
      })
    } else {
      // Generate random code for new promo codes
      setFormData({
        ...formData,
        code: generateRandomCode(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      })
    }
  }, [promoCode])

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? Number.parseInt(value, 10)
            : value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData) {
      onSave({
        id: promoCode?.id || crypto.randomUUID(),
        code: formData.code || "",
        discount: formData.discount || 0,
        maxUses: formData.maxUses || 0,
        currentUses: formData.currentUses || 0,
        expiresAt: new Date(formData.expiresAt as string).toISOString(),
        isActive: formData.isActive || false,
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">{promoCode ? "Редактировать промо-код" : "Новый промо-код"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Код</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="input w-full font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, code: generateRandomCode() })}
                  className="p-2 bg-secondary hover:bg-muted rounded-md"
                  title="Сгенерировать новый код"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Скидка (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="input w-full"
                min="1"
                max="100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Максимальное количество использований (0 = без ограничений)
              </label>
              <input
                type="number"
                name="maxUses"
                value={formData.maxUses}
                onChange={handleChange}
                className="input w-full"
                min="0"
                required
              />
            </div>

            {promoCode && (
              <div>
                <label className="block text-sm font-medium mb-1">Текущее количество использований</label>
                <input
                  type="number"
                  name="currentUses"
                  value={formData.currentUses}
                  onChange={handleChange}
                  className="input w-full"
                  min="0"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Срок действия</label>
              <input
                type="date"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm">
                Активен
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">
              Отмена
            </button>
            <button type="submit" className="btn-primary">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

