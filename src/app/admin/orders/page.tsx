import { Suspense } from "react"
import Orders from "./ordersClient"

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Загрузка заказов...</div>}>
            <Orders />
        </Suspense>
    )
}