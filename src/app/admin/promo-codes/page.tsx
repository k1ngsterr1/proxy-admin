"use client"

import AdminLayout from "@/components/layout/AdminLayout"
import PromoCodeList from "@/components/promocodes/PromoCodeList"

export default function PromoCodesPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Управление промокодами</h1>
        <PromoCodeList />
      </div>
    </AdminLayout>
  )
}
