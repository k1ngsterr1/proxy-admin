"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import AdminLayout from "../../../components/layout/AdminLayout"
import ProxyTable from "../../../components/proxies/ProxyTable"
import ProxyModal from "../../../components/proxies/ProxyModal"
import ExtendProxyModal from "../../../components/proxies/ExtendProxyModal"
import TestAccessModal from "../../../components/proxies/TestAccessModal"
import { Button } from "@/components/ui/button"
import type { Proxy } from "../../../types"

// Mock data
const mockProxies: Proxy[] = [
  {
    id: "1",
    userId: "user123",
    type: "HTTP",
    ip: "192.168.1.100",
    port: 8080,
    username: "proxy_user1",
    password: "pass123",
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: "2",
    userId: "user456",
    type: "HTTPS",
    ip: "192.168.1.101",
    port: 8443,
    username: "proxy_user2",
    password: "pass456",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: "3",
    userId: "user789",
    type: "SOCKS5",
    ip: "192.168.1.102",
    port: 1080,
    username: "proxy_user3",
    password: "pass789",
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: "4",
    userId: "user123",
    type: "HTTP",
    ip: "192.168.1.103",
    port: 8080,
    username: "proxy_user4",
    password: "pass321",
    expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false,
  },
  {
    id: "5",
    userId: "user456",
    type: "HTTPS",
    ip: "192.168.1.104",
    port: 8443,
    username: "proxy_user5",
    password: "pass654",
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
]

export default function ProxiesPage() {
  const [proxies, setProxies] = useState<Proxy[]>(mockProxies)
  const [selectedProxy, setSelectedProxy] = useState<Proxy | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false)
  const [isTestAccessModalOpen, setIsTestAccessModalOpen] = useState(false)
  const [selectedProxyId, setSelectedProxyId] = useState<string>("")

  // In a real application, you would fetch this data from your API
  useEffect(() => {
    // Fetch proxies from API
    // Example:
    // const fetchProxies = async () => {
    //   const response = await fetch('/api/proxies');
    //   const data = await response.json();
    //   setProxies(data);
    // };
    // fetchProxies();
  }, [])

  const handleEditProxy = (proxy: Proxy) => {
    setSelectedProxy(proxy)
    setIsModalOpen(true)
  }

  const handleDeleteProxy = (proxyId: string) => {
    if (confirm("Вы уверены, что хотите удалить этот прокси?")) {
      // In a real application, you would call your API to delete the proxy
      setProxies(proxies.filter((proxy) => proxy.id !== proxyId))
    }
  }

  const handleExtendProxy = (proxyId: string) => {
    setSelectedProxyId(proxyId)
    setIsExtendModalOpen(true)
  }

  const handleTestAccess = (proxyId: string) => {
    setSelectedProxyId(proxyId)
    setIsTestAccessModalOpen(true)
  }

  const handleSaveProxy = (updatedProxy: Proxy) => {
    // In a real application, you would call your API to update the proxy
    setProxies(proxies.map((proxy) => (proxy.id === updatedProxy.id ? updatedProxy : proxy)))
    setIsModalOpen(false)
    setSelectedProxy(null)
  }

  const handleSaveExtend = (proxyId: string, days: number) => {
    // In a real application, you would call your API to extend the proxy
    setProxies(
      proxies.map((proxy) => {
        if (proxy.id === proxyId) {
          const currentExpiry = new Date(proxy.expiresAt)
          const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000)
          return { ...proxy, expiresAt: newExpiry.toISOString(), isActive: true }
        }
        return proxy
      }),
    )
    setIsExtendModalOpen(false)
  }

  const handleSaveTestAccess = (proxyId: string, email: string, hours: number) => {
    // In a real application, you would call your API to provide test access
    alert(`Тестовый доступ к прокси ${proxyId} отправлен на ${email} на ${hours} часов`)
    setIsTestAccessModalOpen(false)
  }

  const selectedProxyForExtend = proxies.find((proxy) => proxy.id === selectedProxyId)

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Прокси</h1>
          <p className="text-muted-foreground">Управление прокси-серверами</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => {
            setSelectedProxy(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить прокси
        </Button>
      </div>

      <ProxyTable
        proxies={proxies}
        onEdit={handleEditProxy}
        onDelete={handleDeleteProxy}
        onExtend={handleExtendProxy}
        onTestAccess={handleTestAccess}
      />

      <ProxyModal
        proxy={selectedProxy}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProxy}
      />

      {selectedProxyForExtend && (
        <ExtendProxyModal
          proxyId={selectedProxyForExtend.id}
          currentExpiry={selectedProxyForExtend.expiresAt}
          isOpen={isExtendModalOpen}
          onClose={() => setIsExtendModalOpen(false)}
          onSave={handleSaveExtend}
        />
      )}

      <TestAccessModal
        proxyId={selectedProxyId}
        isOpen={isTestAccessModalOpen}
        onClose={() => setIsTestAccessModalOpen(false)}
        onSave={handleSaveTestAccess}
      />
    </AdminLayout>
  )
}

