"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import AdminLayout from "../../../components/layout/AdminLayout"
import UserTable from "../../../components/users/UserTable"
import BalanceModal from "../../../components/users/BalanceModal"
import { usersApi } from "@/lib/api/users"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>("")
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false)
  const [userToBan, setUserToBan] = useState<{ email: string, block: boolean } | null>(null)

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll
  })





  const blockMutation = useMutation({
    mutationFn: ({ id, block }: { id: string; block: boolean }) =>
      usersApi.blockUser(id, block),
    onSuccess: (data) => {
      const updatedUsers = users.map(user => {
        if (user.email === data.email) {
          return { ...user, isBanned: data.isBanned }
        }
        return user
      })

      queryClient.setQueryData(['users'], updatedUsers)
    }
  })

  const handleBlockUser = (userId: string, block: boolean) => {
    const userEmail = users.find(user => user.id === userId)?.email || ""
    if (userEmail) {
      if (block) {
        setUserToBan({ email: userEmail, block })
        setIsBanDialogOpen(true)
      } else {
        blockMutation.mutate({ id: userEmail, block })
      }
    }
  }

  const confirmBanUser = () => {
    if (userToBan) {
      blockMutation.mutate({ id: userToBan.email, block: userToBan.block })
      setIsBanDialogOpen(false)
      setUserToBan(null)
    }
  }

  const handleBalanceAdjust = (userId: string) => {
    const userEmail = users.find(user => user.id === userId)?.email || ""
    if (userEmail) {
      setSelectedUserEmail(userEmail)
      setIsBalanceModalOpen(true)
    }
  }





  const balanceMutation = useMutation({
    mutationFn: usersApi.adjustBalance,
    onSuccess: (data) => {
      const updatedUsers = users.map(user => {
        if (user.email === data.email) {
          return { ...user, balance: data.balance }
        }
        return user
      })

      queryClient.setQueryData(['users'], updatedUsers)
      setIsBalanceModalOpen(false)
    }
  })

  const handleSaveBalance = (userId: string, amount: number, isAddition: boolean) => {
    balanceMutation.mutate({ email: selectedUserEmail, amount, isAddition })
  }

  const selectedUserForBalance = users.find((user) => user.email === selectedUserEmail)

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Пользователи</h1>
          <p className="text-muted-foreground">Управление пользователями системы</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Загрузка пользователей...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-12">
          <div className="mb-6">
            <span className="text-lg">Ошибка при загрузке пользователей. Пожалуйста, попробуйте позже.</span>
          </div>
        </div>
      ) : (
        <UserTable
          users={users}
          onBlock={handleBlockUser}
          onBalanceAdjust={handleBalanceAdjust}
          isBlocking={blockMutation.isPending}
        />
      )}



      {selectedUserForBalance && (
        <BalanceModal
          userId={selectedUserForBalance.id}
          currentBalance={selectedUserForBalance.balance}
          isOpen={isBalanceModalOpen}
          onClose={() => setIsBalanceModalOpen(false)}
          onSave={handleSaveBalance}
          isSaving={balanceMutation.isPending}
        />
      )}

      <AlertDialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение блокировки</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите заблокировать пользователя {userToBan?.email}?
              Пользователь не сможет авторизоваться в системе после блокировки.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToBan(null)}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBanUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Заблокировать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}

