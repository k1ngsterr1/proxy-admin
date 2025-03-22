"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../../components/layout/AdminLayout"
import LogTable from "../../../components/logs/LogTable"
import type { LogEvent } from "../../../types"

// Mock data
const mockLogs: LogEvent[] = [
  {
    id: "1",
    userId: "user123",
    eventType: "Вход в систему",
    description: "Успешный вход в систему",
    ipAddress: "192.168.1.1",
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "user456",
    eventType: "Покупка прокси",
    description: "Приобретено 5 прокси HTTPS на 30 дней",
    ipAddress: "192.168.1.2",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    userId: "user789",
    eventType: "Пополнение баланса",
    description: "Пополнение баланса на $100",
    ipAddress: "192.168.1.3",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    userId: "user123",
    eventType: "Продление прокси",
    description: "Продление 3 прокси на 60 дней",
    ipAddress: "192.168.1.1",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    userId: "admin",
    eventType: "Блокировка пользователя",
    description: "Заблокирован пользователь user999",
    ipAddress: "192.168.1.10",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "6",
    userId: "user456",
    eventType: "Использование промо-кода",
    description: "Использован промо-код WELCOME10",
    ipAddress: "192.168.1.2",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "7",
    userId: "user789",
    eventType: "Выход из системы",
    description: "Выход из системы",
    ipAddress: "192.168.1.3",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "8",
    userId: "user123",
    eventType: "Изменение пароля",
    description: "Пароль успешно изменен",
    ipAddress: "192.168.1.1",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "9",
    userId: "admin",
    eventType: "Создание промо-кода",
    description: "Создан новый промо-код SUMMER25",
    ipAddress: "192.168.1.10",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "10",
    userId: "user456",
    eventType: "Тестовый доступ",
    description: "Выдан тестовый доступ к прокси на 24 часа",
    ipAddress: "192.168.1.2",
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEvent[]>(mockLogs)

  // In a real application, you would fetch this data from your API
  useEffect(() => {
    // Fetch logs from API
    // Example:
    // const fetchLogs = async () => {
    //   const response = await fetch('/api/logs');
    //   const data = await response.json();
    //   setLogs(data);
    // };
    // fetchLogs();
  }, [])

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Логи системы</h1>
        <p className="text-muted-foreground">Журнал событий и действий пользователей</p>
      </div>

      <LogTable logs={logs} />
    </AdminLayout>
  )
}

