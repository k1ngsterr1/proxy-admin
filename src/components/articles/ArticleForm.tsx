"use client"

import { useState, useEffect, useRef } from "react"
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
  lang?: 'ru' | 'en'
}

export default function ArticleForm({ article, isEditing = false, lang = 'ru' }: ArticleFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(article?.title || "")
  const [content, setContent] = useState(article?.content || "")
  const [images, setImages] = useState<string[]>(article?.images || [])
  const [imageFile, setImageFile] = useState<File | null>(null)

  // This function is now just for display purposes
  const extractImagesFromContent = (htmlContent: string): string[] => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent

    const imgElements = tempDiv.querySelectorAll('img')

    // Extract image URLs and filter out data URLs
    const imageUrls = Array.from(imgElements)
      .map(img => img.src)
      .filter(src => !src.startsWith('data:')) // Only keep actual URLs, not data URLs

    console.log('Extracted image URLs:', imageUrls)
    return imageUrls
  }

  // Функция для преобразования URL в File
  const urlToFile = async (url: string, filename: string, mimeType: string): Promise<File> => {
    const response = await fetch(url)
    const blob = await response.blob()
    return new File([blob], filename, { type: mimeType })
  }

  // При инициализации компонента для редактирования, добавляем существующие изображения в контент
  useEffect(() => {
    // Только при первой загрузке для редактирования
    if (isEditing && article?.images && article.images.length > 0) {
      console.log('Article has images:', article.images)

      // Создаем новый HTML с изображениями
      // Добавляем изображения в начало контента, чтобы они были видны
      let imageHtml = '';
      article.images.forEach(imageUrl => {
        if (typeof imageUrl === 'string') {
          console.log('Adding image to content:', imageUrl)
          imageHtml += `<div><img src="${imageUrl}" alt="Article image" /></div>`
        }
      })

      // Создаем новый контент с изображениями в начале
      const newContent = imageHtml + content

      // Обновляем контент в редакторе
      console.log('Setting new content with images at the beginning')
      setContent(newContent)
    }

    // Извлекаем URL изображений из контента для отслеживания
    const extractedImages = extractImagesFromContent(content)
    setImages(extractedImages)
  }, [isEditing, article])

  const createMutation = useMutation({
    mutationFn: (article: CreateArticleDto) =>
      articlesApi.create(article), // без language
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

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Show loading state
      const submitButton = document.querySelector('.submit-button') as HTMLButtonElement
      if (submitButton) {
        submitButton.disabled = true
        submitButton.textContent = 'Сохранение...'
      }

      // Получаем изображения из редактора
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      const imgElements = tempDiv.querySelectorAll('img')

      // Получаем первое изображение с data URL или URL
      let imageFile: File | null = null
      let imageUrl: string | null = null

      // Проверяем все изображения в контенте
      for (const img of Array.from(imgElements)) {
        // Если это data URL, преобразуем его в File
        if (img.src.startsWith('data:image')) {
          try {
            const res = await fetch(img.src)
            const blob = await res.blob()
            const fileName = `image-${Date.now()}.${blob.type.split('/')[1] || 'png'}`
            imageFile = new File([blob], fileName, { type: blob.type })
            // Берем только первое изображение
            break
          } catch (err) {
            console.error('Error converting data URL to file:', err)
          }
        }
        // Если это обычный URL (при редактировании), сохраняем его
        else if (img.src.startsWith('http')) {
          imageUrl = img.src
          // Не прерываем цикл, продолжаем искать data URL
        }
      }

      // Создаем данные статьи
      const articleData: CreateArticleDto | UpdateArticleDto = {
        title,
        content,
        lang
      }

      // Добавляем изображение из редактора (только одно)
      if (imageFile) {
        // Если нашли data URL, преобразованный в File
        articleData.images = imageFile
        console.log('Sending new image file')
      } else if (imageUrl && isEditing) {
        try {
          // При редактировании, если нет нового изображения, но есть существующее URL
          console.log('Converting existing image URL to File:', imageUrl)
          // Преобразуем существующий URL в File для отправки в том же формате, что и при создании
          const imageFileName = imageUrl.split('/').pop() || 'existing-image.jpg'
          const imageFileType = 'image/jpeg' // Предполагаем JPEG, но можно определить по расширению
          const imageFileObj = await urlToFile(imageUrl, imageFileName, imageFileType)

          // Добавляем преобразованный файл в данные статьи
          articleData.images = imageFileObj
          console.log('Successfully converted URL to File for PATCH request')
        } catch (err) {
          console.error('Error converting image URL to File:', err)
          // Если не удалось преобразовать, продолжаем без изображения
          // API должен сохранить существующее изображение
        }
      }

      if (isEditing && article?.id) {
        updateMutation.mutate({
          id: article.id,
          data: articleData
        })
      } else {
        createMutation.mutate(articleData as CreateArticleDto)
      }
    } catch (error) {
      console.error('Error submitting article:', error)
    } finally {
      // Reset button state
      const submitButton = document.querySelector('.submit-button') as HTMLButtonElement
      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = 'Сохранить'
      }
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
            className="submit-button"
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
