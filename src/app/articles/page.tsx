"use client"

import { useQuery } from "@tanstack/react-query"
import { articlesApi } from "@/lib/api/articles"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ArticlesPage() {
  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['public-articles'],
    queryFn: articlesApi.getAll
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

  console.log(articles)

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
                <CardTitle className="line-clamp-2">{article.title}</CardTitle>
              </CardHeader>
              {article.image && (
                <div className="px-6 pb-4">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
              <CardContent className="flex-grow">
                <div
                  className="line-clamp-4 text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: article.content.substring(0, 200) + (article.content.length > 200 ? '...' : '')
                  }}
                />
              </CardContent>
              <CardFooter>
                <Link href={`/articles/${article.id}`} className="w-full">
                  <Button variant="outline" className="w-full">Читать далее</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
