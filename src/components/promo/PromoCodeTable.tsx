"use client"

import { useState } from "react"
import { Tag, Edit, Trash, Copy } from "lucide-react"
import type { PromoCode } from "../../types"

interface PromoCodeTableProps {
  promoCodes: PromoCode[]
  onEdit: (promoCode: PromoCode) => void
  onDelete: (promoCodeId: string) => void
}

export default function PromoCodeTable({ promoCodes, onEdit, onDelete }: PromoCodeTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPromoCodes = promoCodes.filter((code) => code.code.toLowerCase().includes(searchTerm.toLowerCase()))

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could add a toast notification here
  }

  return (
    <div className="card">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск промо-кодов..."
          className="input w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header rounded-tl-lg">Код</th>
              <th className="table-header">Скидка</th>
              <th className="table-header">Использований</th>
              <th className="table-header">Срок действия</th>
              <th className="table-header">Статус</th>
              <th className="table-header rounded-tr-lg">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromoCodes.map((code) => (
              <tr key={code.id}>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Tag size={16} className="text-primary" />
                    </div>
                    <span className="font-mono font-medium">{code.code}</span>
                    <button
                      onClick={() => copyToClipboard(code.code)}
                      className="p-1 hover:bg-muted rounded"
                      title="Копировать"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </td>
                <td className="table-cell">{code.discount}%</td>
                <td className="table-cell">
                  {code.currentUses} / {code.maxUses === 0 ? "∞" : code.maxUses}
                </td>
                <td className="table-cell">{new Date(code.expiresAt).toLocaleDateString()}</td>
                <td className="table-cell">
                  {code.isActive ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-500">
                      Активен
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-500">
                      Неактивен
                    </span>
                  )}
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(code)} className="p-1 hover:bg-muted rounded" title="Редактировать">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(code.id)}
                      className="p-1 hover:bg-muted rounded text-red-500"
                      title="Удалить"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

