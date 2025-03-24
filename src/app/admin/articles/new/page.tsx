"use client"

import ArticleForm from "@/components/articles/ArticleForm"
import AdminLayout from "@/components/layout/AdminLayout"

export default function NewArticlePage() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Создать новую статью</h1>
        <ArticleForm />
      </div>
    </AdminLayout>
  )
}
