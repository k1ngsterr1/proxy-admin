"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ArticleForm from "@/components/articles/ArticleForm"
import AdminLayout from "@/components/layout/AdminLayout"

// Mock data - replace with actual API calls in production
const mockArticles = [
  { 
    id: 1, 
    title: "Как выбрать прокси", 
    slug: "how-to-choose-proxy", 
    content: "<h1>Как выбрать прокси</h1><p>Подробное руководство по выбору прокси для различных задач.</p>", 
    isPublished: true 
  },
  { 
    id: 2, 
    title: "Преимущества использования прокси", 
    slug: "proxy-benefits", 
    content: "<h1>Преимущества использования прокси</h1><p>Узнайте о всех преимуществах использования прокси-серверов.</p>", 
    isPublished: true 
  },
  { 
    id: 3, 
    title: "Безопасность и прокси", 
    slug: "security-and-proxies", 
    content: "<h1>Безопасность и прокси</h1><p>Как прокси-серверы могут повысить вашу безопасность в интернете.</p>", 
    isPublished: false 
  },
]

export default function EditArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Mock API fetch - replace with actual API in production
    const fetchArticle = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const id = Number(params.id)
        const foundArticle = mockArticles.find(a => a.id === id)
        
        if (foundArticle) {
          setArticle(foundArticle)
        } else {
          setError("Статья не найдена")
        }
      } catch (err) {
        setError("Ошибка при загрузке статьи")
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.id])

  if (loading) {
    return (
      <AdminLayout>
        <div>
          <h1 className="text-2xl font-bold mb-6">Редактирование статьи</h1>
          <div className="flex justify-center items-center h-64">
            <p>Загрузка...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div>
          <h1 className="text-2xl font-bold mb-6">Редактирование статьи</h1>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Редактирование статьи</h1>
        <ArticleForm article={article} isEditing={true} />
      </div>
    </AdminLayout>
  )
}
