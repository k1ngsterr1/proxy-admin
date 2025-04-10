"use client"

import { useState } from "react"
import dayjs from 'dayjs'
import { DollarSign, Ban, Package, FileClock } from "lucide-react"
import type { User as UserType } from "../../types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface UserTableProps {
  users: UserType[]
  onBlock: (userId: string, block: boolean) => void
  onUnblock: (userId: string, block: boolean) => void
  onBalanceAdjust: (userId: string) => void
  onOrdersClick: (userId: string) => void
  onLogsClick: (userId: string) => void
  isBlocking?: boolean
  isUnblocking?: boolean
}

export default function UserTable({
  users,
  onBlock,
  onUnblock,
  onBalanceAdjust,
  onOrdersClick,
  onLogsClick,
  isBlocking = false,
  isUnblocking = false
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name ? user.name.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      user.ip.includes(searchTerm),
  )



  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Поиск пользователей..."
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead>IP адрес</TableHead>
                <TableHead>Баланс</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="rounded-tr-lg">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{dayjs(user.createdAt).format('DD.MM.YYYY')}</TableCell>
                  <TableCell>{user.ip}</TableCell>
                  <TableCell>${typeof user.balance === 'number' ? user.balance.toFixed(2) : Number(user.balance).toFixed(2)}</TableCell>
                  <TableCell>
                    {user.isBanned ? (
                      <Badge variant="destructive">Заблокирован</Badge>
                    ) : (
                      <Badge variant="success" className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                        Активен
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isBanned ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onUnblock(user.id, user.isBanned)}
                        title="Заблокировать"
                        disabled={isUnblocking}
                      >
                        <Ban size={16} />
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onBalanceAdjust(user.id)}
                          title="Изменить баланс"
                        >
                          <DollarSign size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onBlock(user.id, !user.isBanned)}
                          title="Заблокировать"
                          disabled={isBlocking}
                        >
                          <Ban size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Заказы"
                          onClick={() => onOrdersClick(user.id)}
                          disabled={isBlocking}
                        >
                          <Package />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Логи"
                          onClick={() => onLogsClick(user.id)}
                          disabled={isBlocking}
                        >
                          <FileClock />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

