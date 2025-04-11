import { Suspense } from "react"
import NewArticlePage from "./newClient"

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Загрузка...</div>}>
      <NewArticlePage />
    </Suspense>
  )
}