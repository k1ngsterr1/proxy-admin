"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../../components/layout/AdminLayout"
import type { Transaction } from "../../../types"

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: "1",
    userId: "user123",
    amount: 100,
    type: "deposit",
    description: "Пополнение баланса",
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "user456",
    amount: 50,
    type: "purchase",
    description: "Покупка прокси",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    userId: "user789",
    amount: 25,
    type: "withdrawal",
    description: "Вывод средств",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    userId: "user123",
    amount: 75,
    type: "purchase",
    description: "Продление прокси",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    userId: "user456",
    amount: 10,
    type: "refund",
    description: "Возврат средств",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")

  // In a real application, you would fetch this data from your API
  useEffect(() => {
    // Fetch transactions from API
    // Example:
    // const fetchTransactions = async () => {
    //   const response = await fetch('/api/transactions');
    //   const data = await response.json();
    //   setTransactions(data);
    // };
    // fetchTransactions();
  }, [])

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userId.includes(searchTerm)

    const matchesFilter = filter === "all" || transaction.type === filter

    return matchesSearch && matchesFilter
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "text-green-500 bg-green-500/10"
      case "withdrawal":
        return "text-red-500 bg-red-500/10"
      case "purchase":
        return "text-blue-500 bg-blue-500/10"
      case "refund":
        return "text-yellow-500 bg-yellow-500/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Пополнение"
      case "withdrawal":
        return "Вывод"
      case "purchase":
        return "Покупка"
      case "refund":
        return "Возврат"
      default:
        return type
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Транзакции</h1>
        <p className="text-muted-foreground">История финансовых операций</p>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Поиск транзакций..."
              className="input w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <select className="input pr-8 appearance-none" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Все типы</option>
              <option value="deposit">Пополнение</option>
              <option value="withdrawal">Вывод</option>
              <option value="purchase">Покупка</option>
              <option value="refund">Возврат</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header rounded-tl-lg">ID</th>
                <th className="table-header">Пользователь</th>
                <th className="table-header">Сумма</th>
                <th className="table-header">Тип</th>
                <th className="table-header">Описание</th>
                <th className="table-header rounded-tr-lg">Дата</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="table-cell font-mono">{transaction.id}</td>
                  <td className="table-cell font-mono">{transaction.userId}</td>
                  <td className="table-cell">
                    <span
                      className={
                        transaction.type === "deposit" || transaction.type === "refund"
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {transaction.type === "deposit" || transaction.type === "refund" ? "+" : "-"}$
                      {transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(transaction.type)}`}>
                      {getTypeLabel(transaction.type)}
                    </span>
                  </td>
                  <td className="table-cell">{transaction.description}</td>
                  <td className="table-cell">{new Date(transaction.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Транзакции не найдены</div>
        )}
      </div>
    </AdminLayout>
  )
}

