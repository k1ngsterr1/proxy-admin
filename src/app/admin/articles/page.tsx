"use client"

import ArticlesList from "@/components/articles/ArticlesList"
import AdminLayout from "@/components/layout/AdminLayout"

export default function ArticlesPage() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Управление статьями</h1>
        <ArticlesList />
      </div>
    </AdminLayout>
  )
}
