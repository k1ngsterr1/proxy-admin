"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { Proxy } from "../../types"

interface ProxyModalProps {
  proxy: Proxy | null
  isOpen: boolean
  onClose: () => void
  onSave: (proxy: Proxy) => void
}

export default function ProxyModal({ proxy, isOpen, onClose, onSave }: ProxyModalProps) {
  const [formData, setFormData] = useState<Partial<Proxy>>({
    userId: "",
    type: "HTTP",
    ip: "",
    port: 8080,
    username: "",
    password: "",
    expiresAt: "",
    isActive: true,
  })

  useEffect(() => {
    if (proxy) {
      setFormData({
        userId: proxy.userId,
        type: proxy.type,
        ip: proxy.ip,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password,
        expiresAt: new Date(proxy.expiresAt).toISOString().split("T")[0],
        isActive: proxy.isActive,
      })
    }
  }, [proxy])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (proxy && formData) {
      onSave({
        ...proxy,
        ...formData,
        expiresAt: new Date(formData.expiresAt as string).toISOString(),
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">{proxy ? "Редактировать прокси" : "Новый прокси"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ID пользователя</label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Тип</label>
              <select name="type" value={formData.type} onChange={handleChange} className="input w-full" required>
                <option value="HTTP">HTTP</option>
                <option value="HTTPS">HTTPS</option>
                <option value="SOCKS5">SOCKS5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">IP адрес</label>
              <input
                type="text"
                name="ip"
                value={formData.ip}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Порт</label>
              <input
                type="number"
                name="port"
                value={formData.port}
                onChange={handleChange}
                className="input w-full"
                min="1"
                max="65535"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Имя пользователя</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Пароль</label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>

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

