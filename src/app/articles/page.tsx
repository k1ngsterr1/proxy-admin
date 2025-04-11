"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { articlesApi } from "@/lib/api/articles"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function InnerArticlesPage() {
  const searchParams = useSearchParams()
  const lang = searchParams.get("lang") === "en" ? "en" : "ru"

  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['public-articles', lang],
    queryFn: () => articlesApi.getAll(lang),
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Статьи</h1>
        <div className="flex justify-center py-20">
          <p className="text-lg text-muted-foreground">Загрузка статей...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Статьи</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p>Ошибка при загрузке статей. Пожалуйста, попробуйте позже.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Статьи</h1>
      {articles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">Статьи не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <Card key={index} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle>{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">{article.content}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/articles/${article.id}`}>
                  <Button variant="outline">Читать далее</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Статьи</h1>
        <div className="flex justify-center py-20">
          <p className="text-lg text-muted-foreground">Загрузка статей...</p>
        </div>
      </div>
    }>
      <InnerArticlesPage />
    </Suspense>
  )
}