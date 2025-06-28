"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, Award, Target, TrendingUp, Star } from "lucide-react"

interface Activity {
  id: string
  type: 'contribution' | 'badge' | 'payout'
  title: string
  description: string
  amount?: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  timestamp: string
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => {
            const IconComponent = activity.icon
            return (
              <div key={activity.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center`}>
                    <IconComponent className={`w-4 h-4 ${activity.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
                {activity.amount && (
                  <span className={`text-sm font-medium ${activity.type === 'contribution' ? 'text-green-600' : 'text-orange-600'}`}>
                    {activity.amount}
                  </span>
                )}
                {activity.type === 'badge' && (
                  <Star className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 