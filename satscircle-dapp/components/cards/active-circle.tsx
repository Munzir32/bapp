import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from "@/components/ui/progress"
import { Users, Clock, Coins } from "lucide-react"
import Link from 'next/link'
import { useReadCircle } from '@/hooks/useReadCircle'

interface CircleData {
  id: bigint
    name: string
  owner: string
  contributionAmount: bigint
  frequency: number // 0 = WEEKLY, 1 = MONTHLY
  memberLimit: bigint
  currentRound: bigint
  payoutIndex: bigint
  visibility: number // 0 = PUBLIC, 1 = PRIVATE
  totalBTCSaved: bigint
  createdAt: bigint
  isActive: boolean
}

interface ActiveCardProps {
  id: string
}

const ActiveCard = ({ id }: ActiveCardProps) => {
  const [circle, setCircle] = useState<CircleData | null>(null)
  const [formattedCircle, setFormattedCircle] = useState<any>(null)

  const { circleData } = useReadCircle(id)

  const formatCircleData = useCallback(async () => {
    if (!circleData || !Array.isArray(circleData)) {
      return
    }

    const formattedData: CircleData = {
      id: circleData[0],
      name: circleData[1],
      owner: circleData[2],
      contributionAmount: circleData[3],
      frequency: Number(circleData[4]),
      memberLimit: circleData[5],
      currentRound: circleData[6],
      payoutIndex: circleData[7],
      visibility: Number(circleData[8]),
      totalBTCSaved: circleData[9],
      createdAt: circleData[10],
      isActive: Boolean(circleData[11])
    }

    setCircle(formattedData)

    // Calculate additional derived data
    const progress = Number(formattedData.currentRound) / Number(formattedData.memberLimit) * 100
    const frequencyText = formattedData.frequency === 0 ? 'Weekly' : 'Monthly'
    
    setFormattedCircle({
      ...formattedData,
      progress: Math.min(progress, 100),
      frequencyText,
      contributionAmountFormatted: Number(formattedData.contributionAmount).toLocaleString(),
      totalBTCSavedFormatted: Number(formattedData.totalBTCSaved).toLocaleString(),
      daysUntilContribution: 3, // This would need to be calculated based on frequency and last contribution
      nextPayout: "You", // This would need to be calculated based on payout order
      members: Number(formattedData.memberLimit), // This would need to be fetched from circleMembers mapping
      totalMembers: Number(formattedData.memberLimit)
    })
  }, [circleData])

  useEffect(() => {
    formatCircleData()
  }, [formatCircleData])

  if (!formattedCircle) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading circle...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <Link href={`/circle/${id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
              <h3 className="font-semibold text-lg text-gray-900">{formattedCircle.name}</h3>
                    <p className="text-sm text-gray-600">
                {formattedCircle.contributionAmountFormatted} sats • {formattedCircle.frequencyText}
                    </p>
                  </div>
            <Badge variant={formattedCircle.nextPayout === "You" ? "default" : "secondary"}>
              {formattedCircle.nextPayout === "You" ? "Your Turn Next!" : `${formattedCircle.nextPayout}'s Turn`}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Circle Progress</span>
                <span className="font-medium">{formattedCircle.progress.toFixed(1)}%</span>
                    </div>
              <Progress value={formattedCircle.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                    {formattedCircle.members}/{formattedCircle.totalMembers} members
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{formattedCircle.daysUntilContribution} days left</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Coins className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-gray-900">
                  {formattedCircle.totalBTCSavedFormatted} sats saved
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
  )
}

export default ActiveCard