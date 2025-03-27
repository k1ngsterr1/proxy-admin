"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BalanceModalProps {
  userId: string
  currentBalance: number | string
  isOpen: boolean
  onClose: () => void
  onSave: (userId: string, amount: number, isAddition: boolean) => void
  isSaving?: boolean
}

export default function BalanceModal({ userId, currentBalance, isOpen, onClose, onSave, isSaving = false }: BalanceModalProps) {
  const [amount, setAmount] = useState(0)
  const [isAddition, setIsAddition] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(userId, amount, isAddition)
    setAmount(0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Изменить баланс</DialogTitle>
          <DialogDescription>
            Текущий баланс: <span className="font-bold text-primary">${typeof currentBalance === 'number' ? currentBalance.toFixed(2) : Number(currentBalance).toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Операция</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={isAddition ? "default" : "outline"}
                  className={isAddition ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => setIsAddition(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Пополнить
                </Button>
                <Button
                  type="button"
                  variant={!isAddition ? "default" : "outline"}
                  className={!isAddition ? "bg-red-600 hover:bg-red-700" : ""}
                  onClick={() => setIsAddition(false)}
                >
                  <Minus className="mr-2 h-4 w-4" />
                  Списать
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Сумма</Label>
              <Input
                id="amount"
                type="number"
                value={amount || ""}
                onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Обработка..." : "Подтвердить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

