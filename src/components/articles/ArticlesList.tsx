"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { articlesApi } from "@/lib/api/articles"
import { useRouter } from "next/navigation"

export default function ArticlesList() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [lang, setLang] = useState<'ru' | 'en'>('ru')

  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['articles', lang],
    queryFn: () => articlesApi.getAll(lang)
  })

  const deleteMutation = useMutation({
    mutationFn: articlesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      setDeleteId(null)
    }
  })

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <CardTitle>Статьи</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={lang === 'ru' ? 'default' : 'outline'}
              onClick={() => setLang('ru')}
            >
              🇷🇺 Рус
            </Button>
            <Button
              size="sm"
              variant={lang === 'en' ? 'default' : 'outline'}
              onClick={() => setLang('en')}
            >
              🇺🇸 Eng
            </Button>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus size={16} className="mr-2" />
              Новая статья
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать статью</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              <Link href="/admin/articles/new?lang=ru">
                <Button variant="outline" className="w-full">
                  🇷🇺 На русском
                </Button>
              </Link>
              <Link href="/admin/articles/new?lang=en">
                <Button variant="outline" className="w-full">
                  🇺🇸 На английском
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">Загрузка...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Ошибка при загрузке статей
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Заголовок</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Статьи не найдены
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                    <TableCell>{article.title}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/articles/edit/${article.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setDeleteId(article.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Удалить статью</DialogTitle>
                            </DialogHeader>
                            <p>Вы уверены, что хотите удалить статью "{articles.find(a => a.id === deleteId)?.title}"?</p>
                            <DialogFooter className="mt-4">
                              <DialogClose asChild>
                                <Button variant="outline">Отмена</Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={() => deleteId && handleDelete(deleteId)}
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending ? "Удаление..." : "Удалить"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
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