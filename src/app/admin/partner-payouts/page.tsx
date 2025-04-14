"use client";

import ArticlesList from "@/components/articles/ArticlesList";
import AdminLayout from "@/components/layout/AdminLayout";
import PartnerPayoutList from "@/components/partner-payments/partner-payouts";

export default function PartnersPayoutPage() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Выплаты</h1>
        <PartnerPayoutList />
      </div>
    </AdminLayout>
  );
}
