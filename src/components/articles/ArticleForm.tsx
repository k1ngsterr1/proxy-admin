"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ArticleEditor from "./Editor"
import { Checkbox } from "@/components/ui/checkbox"

interface ArticleFormProps {
  article?: {
    id?: number
    title: string
    slug: string
    content: string
    isPublished: boolean
  }
  isEditing?: boolean
}

export default function ArticleForm({ article, isEditing = false }: ArticleFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(article?.title || "")
  const [slug, setSlug] = useState(article?.slug || "")
  const [content, setContent] = useState(article?.content || "")
  const [isPublished, setIsPublished] = useState(article?.isPublished || false)
  const [isSaving, setIsSaving] = useState(false)

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-')
      setSlug(generatedSlug)
    }
  }, [title, isEditing, slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Mock API call - replace with actual API in production
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log({
        title,
        slug,
        content,
        isPublished
      })
      
      // Redirect back to articles list
      router.push("/admin/articles")
    } catch (error) {
      console.error("Error saving article:", error)
    } finally {
      setIsSaving(false)
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
            <Label htmlFor="slug">URL-адрес</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-адрес-статьи"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Содержание</Label>
            <ArticleEditor content={content} onChange={setContent} />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="published" 
              checked={isPublished} 
              onCheckedChange={(checked) => setIsPublished(checked as boolean)} 
            />
            <Label htmlFor="published">Опубликовать</Label>
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
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Сохранение..." : isEditing ? "Обновить" : "Создать"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
