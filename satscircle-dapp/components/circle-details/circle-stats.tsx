"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Coins, TrendingUp, Calendar, Users } from "lucide-react"

interface CircleStatsProps {
  contributionAmountFormatted: string
  groupSize: number
  frequencyText: string
  membersCount: number
}

export function CircleStats({
  contributionAmountFormatted,
  groupSize,
  frequencyText,
  membersCount
}: CircleStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Per Contribution</p>
              <p className="text-lg font-bold">{contributionAmountFormatted}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Total Payout</p>
              <p className="text-lg font-bold">{(Number(contributionAmountFormatted) * groupSize).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Frequency</p>
              <p className="text-lg font-bold">{frequencyText}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Members</p>
              <p className="text-lg font-bold">
                {membersCount}/{groupSize}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 