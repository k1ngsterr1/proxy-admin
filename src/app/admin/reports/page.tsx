"use client"

import { useState } from "react"
import AdminLayout from "../../../components/layout/AdminLayout"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("sales")
  const [dateRange, setDateRange] = useState("week")

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Отчеты</h1>
        <p className="text-muted-foreground">Аналитика и статистика</p>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <select className="input w-full" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="sales">Продажи</option>
              <option value="users">Пользователи</option>
              <option value="proxies">Прокси</option>
              <option value="revenue">Доход</option>
            </select>
          </div>

          <div className="relative">
            <select
              className="input pr-8 appearance-none"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="day">Сегодня</option>
              <option value="week">Неделя</option>
              <option value="month">Месяц</option>
              <option value="quarter">Квартал</option>
              <option value="year">Год</option>
            </select>
          </div>

          <button className="btn-primary">Сформировать отчет</button>
        </div>

        <div className="h-96 flex items-center justify-center bg-secondary rounded-lg">
          {/* Chart would go here */}
          <p className="text-muted-foreground">
            График {reportType} за {dateRange}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-medium mb-4">Топ пользователей</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold">
                    {i}
                  </div>
                  <div>
                    <p className="font-medium">Пользователь {i}</p>
                    <p className="text-xs text-muted-foreground">user{i}@example.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${(Math.random() * 1000).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{Math.floor(Math.random() * 50)} прокси</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-medium mb-4">Популярные типы прокси</h2>
          <div className="space-y-4">
            {[
              { type: "HTTP", percentage: 45 },
              { type: "HTTPS", percentage: 30 },
              { type: "SOCKS5", percentage: 25 },
            ].map((item) => (
              <div key={item.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>{item.type}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

