import { Suspense } from "react"
import UserLogsPage from "./logsClient"

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Загрузка логов...</div>}>
            <UserLogsPage />
        </Suspense>
    )
}