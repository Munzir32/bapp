"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, Clock, Coins, Calendar, Eye, EyeOff } from 'lucide-react'
import { useReadCircle } from '@/hooks/useReadCircle'

interface CircleDetailsProps {
  id: string
}

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

export const CircleDetails: React.FC<CircleDetailsProps> = ({ id }) => {
  const [circle, setCircle] = useState<CircleData | null>(null)
  const [formattedCircle, setFormattedCircle] = useState<any>(null)

  const { circleData } = useReadCircle("1")

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
    const visibilityText = formattedData.visibility === 0 ? 'Public' : 'Private'
    
    setFormattedCircle({
      ...formattedData,
      progress: Math.min(progress, 100),
      frequencyText,
      visibilityText,
      contributionAmountFormatted: Number(formattedData.contributionAmount).toLocaleString(),
      totalBTCSavedFormatted: Number(formattedData.totalBTCSaved).toLocaleString(),
      createdAtFormatted: new Date(Number(formattedData.createdAt) * 1000).toLocaleDateString()
    })
  }, [circleData])

  useEffect(() => {
    formatCircleData()
  }, [formatCircleData])

  if (!formattedCircle) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading circle details...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{formattedCircle.name}</span>
          <Badge variant={formattedCircle.visibility === 0 ? "outline" : "secondary"}>
            {formattedCircle.visibility === 0 ? (
              <>
                <Eye className="w-3 h-3 mr-1" />
                Public
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3 mr-1" />
                Private
              </>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Coins className="w-4 h-4 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Contribution</p>
              <p className="font-medium">{formattedCircle.contributionAmountFormatted} cBTC</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Frequency</p>
              <p className="font-medium">{formattedCircle.frequencyText}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Member Limit</p>
              <p className="font-medium">{Number(formattedCircle.memberLimit)} people</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Current Round</p>
              <p className="font-medium">{Number(formattedCircle.currentRound)}</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Circle Progress</span>
            <span className="font-medium">{formattedCircle.progress.toFixed(1)}%</span>
          </div>
          <Progress value={formattedCircle.progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Coins className="w-4 h-4 text-orange-500" />
            <span className="font-medium text-gray-900">
              {formattedCircle.totalBTCSavedFormatted} cBTC saved
            </span>
          </div>
          <span className="text-gray-500">Created {formattedCircle.createdAtFormatted}</span>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            Owner: {formattedCircle.owner.slice(0, 6)}...{formattedCircle.owner.slice(-4)}
          </p>
          <p className="text-xs text-gray-500">
            Status: {formattedCircle.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 