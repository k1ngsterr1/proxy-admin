"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { articlesApi } from "@/lib/api/articles"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articlesApi.getById(id)
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к статьям
        </Button>
        <div className="flex justify-center py-20">
          <p className="text-lg text-muted-foreground">Загрузка статьи...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="container mx-auto py-10">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к статьям
        </Button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p>Статья не найдена или произошла ошибка при загрузке.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад к статьям
      </Button>
      
      <article className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-6">{article.title}</h1>
        
        {article.image && (
          <div className="my-6">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full max-h-96 object-cover rounded-lg"
            />
          </div>
        )}
        
        <div 
          className="mt-8"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  )
}
