"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Coins, Users, Clock } from "lucide-react"

interface StatusBannerProps {
  daysUntilContribution: number
  progress: number
  totalBTCSavedFormatted: string
  membersCount: number
  contributionAmountFormatted: string
  onPayNow: () => void
  isDistributing?: boolean
  isOwner?: boolean
}

export function StatusBanner({
  daysUntilContribution,
  progress,
  totalBTCSavedFormatted,
  membersCount,
  contributionAmountFormatted,
  onPayNow,
  isDistributing = false,
  isOwner = false
}: StatusBannerProps) {
  return (
    <Card className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Next Contribution Due</h2>
            <p className="text-gray-600">{daysUntilContribution} days remaining • Sarah's turn to receive payout</p>
          </div>
          <Badge className="bg-orange-500 hover:bg-orange-600">
            <Clock className="w-3 h-3 mr-1" />
            {daysUntilContribution} days
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Circle Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Coins className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">{totalBTCSavedFormatted} sats saved</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{membersCount} members</span>
              </div>
            </div>
            <Button 
              onClick={onPayNow} 
              disabled={!isOwner || isDistributing}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400"
            >
              {isDistributing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Distributing...
                </>
              ) : isOwner ? (
                `Distribute Payout (${contributionAmountFormatted} sats)`
              ) : (
                "Only Owner Can Distribute"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 