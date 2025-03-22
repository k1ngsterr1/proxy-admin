"use client"

import type React from "react"

import { useState } from "react"
import AdminLayout from "../../../components/layout/AdminLayout"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    apiKey: "sk_test_proxy_seller_api_key",
    notifyLowBalance: true,
    lowBalanceThreshold: 10,
    autoRenewProxies: false,
    defaultProxyDuration: 30,
    testProxyDuration: 24,
    emailNotifications: true,
    darkMode: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : type === "number" ? Number.parseInt(value, 10) : value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, you would call your API to save the settings
    alert("Настройки сохранены")
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">Настройки системы</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-4">API настройки</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">API ключ Proxy-Seller</label>
                  <input
                    type="text"
                    name="apiKey"
                    value={settings.apiKey}
                    onChange={handleChange}
                    className="input w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Используется для интеграции с API proxy-seller.com
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">Настройки прокси</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoRenewProxies"
                    name="autoRenewProxies"
                    checked={settings.autoRenewProxies}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="autoRenewProxies" className="text-sm">
                    Автоматически продлевать прокси при достаточном балансе
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Срок действия прокси по умолчанию (дней)</label>
                  <input
                    type="number"
                    name="defaultProxyDuration"
                    value={settings.defaultProxyDuration}
                    onChange={handleChange}
                    className="input w-full"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Срок тестового доступа (часов)</label>
                  <input
                    type="number"
                    name="testProxyDuration"
                    value={settings.testProxyDuration}
                    onChange={handleChange}
                    className="input w-full"
                    min="1"
                    max="168"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">Уведомления</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifyLowBalance"
                    name="notifyLowBalance"
                    checked={settings.notifyLowBalance}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="notifyLowBalance" className="text-sm">
                    Уведомлять пользователей о низком балансе
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Порог низкого баланса ($)</label>
                  <input
                    type="number"
                    name="lowBalanceThreshold"
                    value={settings.lowBalanceThreshold}
                    onChange={handleChange}
                    className="input w-full"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="emailNotifications" className="text-sm">
                    Отправлять уведомления по email
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">Интерфейс</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="darkMode"
                    name="darkMode"
                    checked={settings.darkMode}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="darkMode" className="text-sm">
                    Темная тема
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                Сохранить настройки
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

