import { Suspense } from "react"
import ArticlesPage from "./articlesClient"

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Загрузка...</div>}>
      <ArticlesPage />
    </Suspense>
  )
}