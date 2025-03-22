"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import AdminLayout from "../../../components/layout/AdminLayout"
import PromoCodeTable from "../../../components/promo/PromoCodeTable"
import PromoCodeModal from "../../../components/promo/PromoCodeModal"
import type { PromoCode } from "../../../types"

// Mock data
const mockPromoCodes: PromoCode[] = [
  {
    id: "1",
    code: "WELCOME10",
    discount: 10,
    maxUses: 100,
    currentUses: 45,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: "2",
    code: "SUMMER25",
    discount: 25,
    maxUses: 50,
    currentUses: 20,
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: "3",
    code: "SPECIAL50",
    discount: 50,
    maxUses: 10,
    currentUses: 10,
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false,
  },
  {
    id: "4",
    code: "NEWUSER15",
    discount: 15,
    maxUses: 0,
    currentUses: 67,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: "5",
    code: "HOLIDAY20",
    discount: 20,
    maxUses: 200,
    currentUses: 0,
    expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false,
  },
]

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(mockPromoCodes)
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // In a real application, you would fetch this data from your API
  useEffect(() => {
    // Fetch promo codes from API
    // Example:
    // const fetchPromoCodes = async () => {
    //   const response = await fetch('/api/promo-codes');
    //   const data = await response.json();
    //   setPromoCodes(data);
    // };
    // fetchPromoCodes();
  }, [])

  const handleEditPromoCode = (promoCode: PromoCode) => {
    setSelectedPromoCode(promoCode)
    setIsModalOpen(true)
  }

  const handleDeletePromoCode = (promoCodeId: string) => {
    if (confirm("Вы уверены, что хотите удалить этот промо-код?")) {
      // In a real application, you would call your API to delete the promo code
      setPromoCodes(promoCodes.filter((code) => code.id !== promoCodeId))
    }
  }

  const handleSavePromoCode = (updatedPromoCode: PromoCode) => {
    // In a real application, you would call your API to update the promo code
    if (selectedPromoCode) {
      setPromoCodes(promoCodes.map((code) => (code.id === updatedPromoCode.id ? updatedPromoCode : code)))
    } else {
      setPromoCodes([...promoCodes, updatedPromoCode])
    }
    setIsModalOpen(false)
    setSelectedPromoCode(null)
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Промо-коды</h1>
          <p className="text-muted-foreground">Управление промо-кодами и скидками</p>
        </div>
        <button
          className="btn-primary flex items-center gap-1"
          onClick={() => {
            setSelectedPromoCode(null)
            setIsModalOpen(true)
          }}
        >
          <Plus size={18} />
          Создать промо-код
        </button>
      </div>

      <PromoCodeTable promoCodes={promoCodes} onEdit={handleEditPromoCode} onDelete={handleDeletePromoCode} />

      <PromoCodeModal
        promoCode={selectedPromoCode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePromoCode}
      />
    </AdminLayout>
  )
}

