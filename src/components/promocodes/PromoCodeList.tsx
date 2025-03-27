"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { promocodesApi, CreatePromoCodeDto } from "@/lib/api/promocodes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function PromoCodeList() {
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPromoCode, setNewPromoCode] = useState<CreatePromoCodeDto>({
    code: "",
    discount: 10,
    limit: 50
  })

  const { data: promoCodes = [], isLoading } = useQuery({
    queryKey: ['promocodes'],
    queryFn: promocodesApi.getAll
  })

  const createMutation = useMutation({
    mutationFn: promocodesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promocodes'] })
      setIsDialogOpen(false)
      setNewPromoCode({ code: "", discount: 10, limit: 50 })
      toast.success("Промокод успешно создан")
    },
    onError: (error) => {
      toast.error("Ошибка при создании промокода")
      console.error(error)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: promocodesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promocodes'] })
      setDeleteId(null)
      toast.success("Промокод успешно удален")
    },
    onError: (error) => {
      toast.error("Ошибка при удалении промокода")
      console.error(error)
    }
  })

  const handleCreatePromoCode = () => {
    if (!newPromoCode.code) {
      toast.error("Введите код промокода")
      return
    }

    if (newPromoCode.discount <= 0 || newPromoCode.discount > 100) {
      toast.error("Скидка должна быть от 1 до 100%")
      return
    }

    if (newPromoCode.limit <= 0) {
      toast.error("Лимит должен быть больше 0")
      return
    }

    createMutation.mutate(newPromoCode)
  }

  const handleDeletePromoCode = (id: string) => {
    deleteMutation.mutate(id)
  }

  console.log(promoCodes)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Промокоды</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus size={16} className="mr-2" />
              Новый промокод
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать промокод</DialogTitle>
              <DialogDescription>
                Заполните форму для создания нового промокода
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Код промокода</Label>
                <Input
                  id="code"
                  value={newPromoCode.code}
                  onChange={(e) => setNewPromoCode({ ...newPromoCode, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER_SALE"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount">Скидка (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={newPromoCode.discount}
                  onChange={(e) => setNewPromoCode({ ...newPromoCode, discount: parseInt(e.target.value) })}
                  min={1}
                  max={100}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="limit">Лимит использований</Label>
                <Input
                  id="limit"
                  type="number"
                  value={newPromoCode.limit}
                  onChange={(e) => setNewPromoCode({ ...newPromoCode, limit: parseInt(e.target.value) })}
                  min={1}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Отмена</Button>
              </DialogClose>
              <Button
                onClick={handleCreatePromoCode}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Создание..." : "Создать"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">Загрузка...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Код</TableHead>
                <TableHead>Скидка</TableHead>
                <TableHead>Лимит</TableHead>
                <TableHead>Использовано</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Промокоды не найдены
                  </TableCell>
                </TableRow>
              ) : (
                promoCodes.map((promoCode, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{promoCode.code}</TableCell>
                    <TableCell>{promoCode.discount}%</TableCell>
                    <TableCell>{promoCode.limit}</TableCell>
                    <TableCell>{promoCode.usageCount || 0}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(promoCode.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Удалить промокод</DialogTitle>
                            <DialogDescription>
                              Вы уверены, что хотите удалить промокод "{promoCodes.find(p => p.id === deleteId)?.code}"?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="mt-4">
                            <DialogClose asChild>
                              <Button variant="outline">Отмена</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() => deleteId && handleDeletePromoCode(deleteId)}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? "Удаление..." : "Удалить"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
