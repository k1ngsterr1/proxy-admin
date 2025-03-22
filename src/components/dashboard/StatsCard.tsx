import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  value: string | number
  label: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

export default function StatsCard({ value, label, icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-primary/10 rounded-md">{icon}</div>
          {trend && (
            <div className={`text-sm flex items-center ${trend.isPositive ? "text-green-500" : "text-red-500"}`}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}%
            </div>
          )}
        </div>
        <div className="stats-value">{value}</div>
        <div className="stats-label">{label}</div>
      </CardContent>
    </Card>
  )
}

