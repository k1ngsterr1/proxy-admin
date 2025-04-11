"use client"

import ArticleForm from "@/components/articles/ArticleForm"
import AdminLayout from "@/components/layout/AdminLayout"
import { useSearchParams } from "next/navigation"

export default function NewArticlePage() {
    const searchParams = useSearchParams()
    const lang = searchParams.get("lang") === "en" ? "en" : "ru"

    return (
        <AdminLayout>
            <div>
                <h1 className="text-2xl font-bold mb-6">Создать новую статью</h1>
                <ArticleForm lang={lang} />
            </div>
        </AdminLayout>
    )
}