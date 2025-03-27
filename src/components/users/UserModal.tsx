"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { UserType } from "../../types"
import type { User } from "../../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (user: User) => void
  isSaving?: boolean
}

export default function UserModal({ user, isOpen, onClose, onSave, isSaving = false }: UserModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    balance: 0,
    proxyUsage: "",
    isBanned: false,
    type: UserType.USER,
    isVerified: false,
    ip: "0.0.0.0"
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        balance: user.balance,
        proxyUsage: user.proxyUsage,
        isBanned: user.isBanned,
        type: user.type,
        isVerified: user.isVerified,
        ip: user.ip
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    setFormData({
      ...formData,
      [name]: type === "number" ? Number.parseFloat(value) : value,
    })
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isBanned: checked,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (user && formData) {
      onSave({
        ...user,
        ...formData,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Редактировать пользователя" : "Новый пользователь"}</DialogTitle>
          <DialogDescription>Заполните информацию о пользователе и нажмите Сохранить.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Имя
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">
                Баланс
              </Label>
              <Input
                id="balance"
                name="balance"
                type="number"
                value={formData.balance}
                onChange={handleChange}
                className="col-span-3"
                step="0.01"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="proxyUsage" className="text-right">
                Цель использования
              </Label>
              <Textarea
                id="proxyUsage"
                name="proxyUsage"
                value={formData.proxyUsage}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isBlocked" className="text-right">
                Заблокирован
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox id="isBlocked" checked={formData.isBanned} onCheckedChange={handleCheckboxChange} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

