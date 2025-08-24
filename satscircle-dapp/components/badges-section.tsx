"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Badge {
  name: string
  icon: string
  earned: boolean
}

export function BadgesSection() {
  const defaultBadges: Badge[] = [
    { name: "Early Adopter", icon: "🚀", earned: true },
    { name: "Consistent Saver", icon: "💎", earned: true },
    { name: "Circle Creator", icon: "👑", earned: false },
    { name: "Bitcoin Builder", icon: "🏗️", earned: true },
  ]

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Badges</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {defaultBadges.map((badge, index) => (
          <Card
            key={index}
            className={`text-center ${
              badge.earned 
                ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200" 
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <CardContent className="p-4">
              <div className="text-2xl mb-2">{badge.icon}</div>
              <p className={`text-sm font-medium ${
                badge.earned ? "text-gray-900" : "text-gray-400"
              }`}>
                {badge.name}
              </p>
              {badge.earned && (
                <Badge variant="secondary" className="mt-2 bg-orange-100 text-orange-800">
                  Earned
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 