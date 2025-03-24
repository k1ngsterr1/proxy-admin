"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"

// Mock data - replace with actual API calls in production
const mockArticles = [
  { id: 1, title: "Как выбрать прокси", slug: "how-to-choose-proxy", publishedAt: "2025-03-20", status: "published" },
  { id: 2, title: "Преимущества использования прокси", slug: "proxy-benefits", publishedAt: "2025-03-15", status: "published" },
  { id: 3, title: "Безопасность и прокси", slug: "security-and-proxies", publishedAt: "", status: "draft" },
]

export default function ArticlesList() {
  const [articles, setArticles] = useState(mockArticles)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleDelete = (id: number) => {
    setArticles(articles.filter(article => article.id !== id))
    setDeleteId(null)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Статьи</CardTitle>
        <Link href="/admin/articles/new">
          <Button size="sm">
            <Plus size={16} className="mr-2" />
            Новая статья
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Заголовок</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата публикации</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>{article.id}</TableCell>
                <TableCell>{article.title}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    article.status === "published" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {article.status === "published" ? "Опубликовано" : "Черновик"}
                  </span>
                </TableCell>
                <TableCell>{article.publishedAt || "—"}</TableCell>
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
                          <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>
                            Удалить
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
