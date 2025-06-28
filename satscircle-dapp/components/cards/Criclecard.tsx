import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import {
    Users,
    Coins,
    Calendar,
    Clock,
    Eye,
    CheckCircle
  } from "lucide-react"
import { useReadCircle } from '@/hooks/useReadCircle'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import Link from 'next/link'

interface ActiveCardProps {
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
  

const Criclecard = ({ id }: ActiveCardProps) => {
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
        const visibilityText = formattedData.visibility === 0 ? 'Public' : 'Private'
        
        setFormattedCircle({
          ...formattedData,
          progress: Math.min(progress, 100),
          frequencyText,
          visibilityText,
          contributionAmountFormatted: Number(formattedData.contributionAmount).toLocaleString(),
          totalBTCSavedFormatted: Number(formattedData.totalBTCSaved).toLocaleString(),
          createdAtFormatted: new Date(Number(formattedData.createdAt) * 1000).toLocaleDateString(),
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
    <Link href={`/circle/${id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{formattedCircle.name}</h3>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Eye className="w-3 h-3 mr-1" />
                  {formattedCircle.visibilityText}
                </Badge>
              </div>
              <p className="text-gray-600 mb-3">Round {formattedCircle.currentRound} of {formattedCircle.totalMembers}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Contribution</p>
                <p className="text-sm font-medium">{formattedCircle.contributionAmountFormatted} sats</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Frequency</p>
                <p className="text-sm font-medium">{formattedCircle.frequencyText}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Members</p>
                <p className="text-sm font-medium">
                  {formattedCircle.members}/{formattedCircle.totalMembers}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-500">Progress</p>
                <p className="text-sm font-medium">{Math.round(formattedCircle.progress)}%</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src="/placeholder.svg?height=24&width=24" />
                <AvatarFallback className="text-xs">
                  {formattedCircle.owner
                    .slice(0, 6)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">Created by {formattedCircle.owner.slice(0, 6)}...{formattedCircle.owner.slice(-4)}</span>
            </div>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default Criclecard