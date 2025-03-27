"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ArticleEditor from "./Editor"
import { articlesApi, Article, CreateArticleDto, UpdateArticleDto } from "@/lib/api/articles"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface ArticleFormProps {
  article?: Article
  isEditing?: boolean
}

export default function ArticleForm({ article, isEditing = false }: ArticleFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(article?.title || "")
  const [content, setContent] = useState(article?.content || "")
  const [image, setImage] = useState(article?.image || "")

  const createMutation = useMutation({
    mutationFn: articlesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      router.push("/admin/articles")
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArticleDto }) =>
      articlesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      router.push("/admin/articles")
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const articleData = {
      title,
      content,
      image: image || undefined
    }

    if (isEditing && article?.id) {
      updateMutation.mutate({
        id: article.id,
        data: articleData
      })
    } else {
      createMutation.mutate(articleData as CreateArticleDto)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Редактировать статью" : "Новая статья"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите заголовок статьи"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Содержание</Label>
            <ArticleEditor content={content} onChange={setContent} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/articles")}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Сохранение..."
              : isEditing ? "Обновить" : "Создать"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
