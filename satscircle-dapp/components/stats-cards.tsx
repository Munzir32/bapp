"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Coins, Users, Zap, Award } from "lucide-react"

interface Stats {
  totalSaved: number
  activeCircles: number
  currentStreak: number
  completedCircles: number
}

interface StatsCardsProps {
  stats: Stats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      icon: Coins,
      label: "Total Saved",
      value: `${stats.totalSaved.toLocaleString()} sats`,
      color: "text-orange-500"
    },
    {
      icon: Users,
      label: "Active Circles",
      value: stats.activeCircles.toString(),
      color: "text-blue-500"
    },
    {
      icon: Zap,
      label: "Streak",
      value: `${stats.currentStreak} weeks`,
      color: "text-yellow-500"
    },
    {
      icon: Award,
      label: "Completed",
      value: `${stats.completedCircles} circles`,
      color: "text-green-500"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => {
        const IconComponent = item.icon
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <IconComponent className={`w-5 h-5 ${item.color}`} />
                <div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-lg font-bold">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 