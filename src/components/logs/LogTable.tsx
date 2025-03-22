"use client"

import { useState } from "react"
import { Activity, Search, Filter } from "lucide-react"
import type { LogEvent } from "../../types"

interface LogTableProps {
  logs: LogEvent[]
}

export default function LogTable({ logs }: LogTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId.includes(searchTerm) ||
      log.ipAddress.includes(searchTerm)

    const matchesFilter = filter === "all" || log.eventType === filter

    return matchesSearch && matchesFilter
  })

  const eventTypes = Array.from(new Set(logs.map((log) => log.eventType)))

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Поиск логов..."
            className="input w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
          <select
            className="input pl-10 pr-8 appearance-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Все события</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
            <div className="p-2 bg-primary/10 rounded-full">
              <Activity size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <p className="font-medium">{log.eventType}</p>
                <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
              <p className="text-sm mt-1">{log.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-muted px-2 py-1 rounded">User ID: {log.userId}</span>
                <span className="text-xs bg-muted px-2 py-1 rounded">IP: {log.ipAddress}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && <div className="text-center py-8 text-muted-foreground">Логи не найдены</div>}
      </div>
    </div>
  )
}

