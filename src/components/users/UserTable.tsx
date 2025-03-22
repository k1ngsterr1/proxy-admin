"use client"

import { useState } from "react"
import { Edit, Trash, DollarSign, Ban, CheckCircle } from "lucide-react"
import type { User as UserType } from "../../types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface UserTableProps {
  users: UserType[]
  onEdit: (user: UserType) => void
  onDelete: (userId: string) => void
  onBlock: (userId: string, block: boolean) => void
  onBalanceAdjust: (userId: string) => void
}

export default function UserTable({ users, onEdit, onDelete, onBlock, onBalanceAdjust }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.ipAddress.includes(searchTerm),
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
                <TableHead className="rounded-tl-lg">Пользователь</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>IP адрес</TableHead>
                <TableHead>Баланс</TableHead>
                <TableHead>Цель использования</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="rounded-tr-lg">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 bg-primary">
                        <AvatarFallback className="text-primary-foreground">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Регистрация: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.ipAddress}</TableCell>
                  <TableCell>${user.balance.toFixed(2)}</TableCell>
                  <TableCell>{user.proxyUsage}</TableCell>
                  <TableCell>
                    {user.isBlocked ? (
                      <Badge variant="destructive">Заблокирован</Badge>
                    ) : (
                      <Badge variant="success" className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                        Активен
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(user)} title="Редактировать">
                        <Edit size={16} />
                      </Button>
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
                        onClick={() => onBlock(user.id, !user.isBlocked)}
                        title={user.isBlocked ? "Разблокировать" : "Заблокировать"}
                      >
                        {user.isBlocked ? <CheckCircle size={16} /> : <Ban size={16} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(user.id)}
                        className="text-destructive hover:text-destructive/90"
                        title="Удалить"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
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

