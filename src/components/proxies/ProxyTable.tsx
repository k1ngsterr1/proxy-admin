"use client"

import { useState } from "react"
import { Server, Edit, Trash, Clock, RefreshCw } from "lucide-react"
import type { Proxy } from "../../types"

interface ProxyTableProps {
  proxies: Proxy[]
  onEdit: (proxy: Proxy) => void
  onDelete: (proxyId: string) => void
  onExtend: (proxyId: string) => void
  onTestAccess: (proxyId: string) => void
}

export default function ProxyTable({ proxies, onEdit, onDelete, onExtend, onTestAccess }: ProxyTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProxies = proxies.filter(
    (proxy) =>
      proxy.ip.includes(searchTerm) ||
      proxy.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proxy.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="card">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск прокси..."
          className="input w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header rounded-tl-lg">Прокси</th>
              <th className="table-header">Тип</th>
              <th className="table-header">IP:Порт</th>
              <th className="table-header">Пользователь</th>
              <th className="table-header">Срок действия</th>
              <th className="table-header">Статус</th>
              <th className="table-header rounded-tr-lg">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredProxies.map((proxy) => (
              <tr key={proxy.id}>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Server size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Прокси #{proxy.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">Пользователь: {proxy.userId.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell">{proxy.type}</td>
                <td className="table-cell">
                  {proxy.ip}:{proxy.port}
                </td>
                <td className="table-cell">{proxy.username}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{getDaysRemaining(proxy.expiresAt)} дней</span>
                  </div>
                </td>
                <td className="table-cell">
                  {proxy.isActive ? (
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
                    <button onClick={() => onEdit(proxy)} className="p-1 hover:bg-muted rounded" title="Редактировать">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => onExtend(proxy.id)} className="p-1 hover:bg-muted rounded" title="Продлить">
                      <RefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => onTestAccess(proxy.id)}
                      className="p-1 hover:bg-muted rounded text-primary"
                      title="Выдать на тест"
                    >
                      <Clock size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(proxy.id)}
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

