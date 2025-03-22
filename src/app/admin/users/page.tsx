"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import AdminLayout from "../../../components/layout/AdminLayout"
import UserTable from "../../../components/users/UserTable"
import UserModal from "../../../components/users/UserModal"
import BalanceModal from "../../../components/users/BalanceModal"
import { Button } from "@/components/ui/button"
import type { User } from "../../../types"

// Mock data
const mockUsers: User[] = [
  {
    id: "1",
    email: "user1@example.com",
    name: "Иван Петров",
    balance: 150.5,
    ipAddress: "192.168.1.1",
    proxyUsage: "Веб-скрапинг",
    isBlocked: false,
    createdAt: "2023-01-15T10:30:00Z",
    lastLogin: "2023-05-20T14:45:00Z",
  },
  {
    id: "2",
    email: "user2@example.com",
    name: "Анна Сидорова",
    balance: 75.25,
    ipAddress: "192.168.1.2",
    proxyUsage: "Маркетинговые исследования",
    isBlocked: false,
    createdAt: "2023-02-10T09:15:00Z",
    lastLogin: "2023-05-19T11:30:00Z",
  },
  {
    id: "3",
    email: "user3@example.com",
    name: "Алексей Иванов",
    balance: 0,
    ipAddress: "192.168.1.3",
    proxyUsage: "Мониторинг цен",
    isBlocked: true,
    createdAt: "2023-03-05T16:45:00Z",
    lastLogin: "2023-04-10T08:20:00Z",
  },
  {
    id: "4",
    email: "user4@example.com",
    name: "Мария Козлова",
    balance: 320.75,
    ipAddress: "192.168.1.4",
    proxyUsage: "SEO",
    isBlocked: false,
    createdAt: "2023-01-20T13:10:00Z",
    lastLogin: "2023-05-21T10:05:00Z",
  },
  {
    id: "5",
    email: "user5@example.com",
    name: "Дмитрий Смирнов",
    balance: 50.0,
    ipAddress: "192.168.1.5",
    proxyUsage: "Тестирование сайтов",
    isBlocked: false,
    createdAt: "2023-04-12T11:25:00Z",
    lastLogin: "2023-05-18T15:40:00Z",
  },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")

  // In a real application, you would fetch this data from your API
  useEffect(() => {
    // Fetch users from API
    // Example:
    // const fetchUsers = async () => {
    //   const response = await fetch('/api/users');
    //   const data = await response.json();
    //   setUsers(data);
    // };
    // fetchUsers();
  }, [])

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      // In a real application, you would call your API to delete the user
      setUsers(users.filter((user) => user.id !== userId))
    }
  }

  const handleBlockUser = (userId: string, block: boolean) => {
    // In a real application, you would call your API to block/unblock the user
    setUsers(users.map((user) => (user.id === userId ? { ...user, isBlocked: block } : user)))
  }

  const handleBalanceAdjust = (userId: string) => {
    setSelectedUserId(userId)
    setIsBalanceModalOpen(true)
  }

  const handleSaveUser = (updatedUser: User) => {
    // In a real application, you would call your API to update the user
    setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const handleSaveBalance = (userId: string, amount: number, isAddition: boolean) => {
    // In a real application, you would call your API to adjust the balance
    setUsers(
      users.map((user) => {
        if (user.id === userId) {
          const newBalance = isAddition ? user.balance + amount : Math.max(0, user.balance - amount)
          return { ...user, balance: newBalance }
        }
        return user
      }),
    )
    setIsBalanceModalOpen(false)
  }

  const selectedUserForBalance = users.find((user) => user.id === selectedUserId)

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Пользователи</h1>
          <p className="text-muted-foreground">Управление пользователями системы</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => {
            setSelectedUser(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить пользователя
        </Button>
      </div>

      <UserTable
        users={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onBlock={handleBlockUser}
        onBalanceAdjust={handleBalanceAdjust}
      />

      <UserModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
      />

      {selectedUserForBalance && (
        <BalanceModal
          userId={selectedUserForBalance.id}
          currentBalance={selectedUserForBalance.balance}
          isOpen={isBalanceModalOpen}
          onClose={() => setIsBalanceModalOpen(false)}
          onSave={handleSaveBalance}
        />
      )}
    </AdminLayout>
  )
}

