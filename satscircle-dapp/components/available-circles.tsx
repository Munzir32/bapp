"use client"

import { Card, CardContent } from "@/components/ui/card"
import JoinCircleCard from "./cards/join-circle-card"
import { Users, Search } from "lucide-react"
import { useReadCircleTotal } from "@/hooks/useReadCircle"
import { useCallback, useState, useEffect } from 'react'

interface AvailableCirclesProps {
  onJoinSuccess?: () => void
  searchQuery?: string
}

export function AvailableCircles({ onJoinSuccess, searchQuery = "" }: AvailableCirclesProps) {
  const { circleCount } = useReadCircleTotal()
  const [circleIds, setCircleIds] = useState<string[]>([])

  const generateCircleIds = useCallback(() => {
    if (!circleCount) return
    
    const count = Number(circleCount)
    const ids = []
    for (let i = 1; i <= count; i++) {
      ids.push(i.toString())
    }
    setCircleIds(ids)
  }, [circleCount])

  useEffect(() => {
    generateCircleIds()
  }, [generateCircleIds])

  console.log(circleCount, "count")
  console.log(circleIds, "circleIds")
  console.log(searchQuery, "searchQuery")

  if (!circleCount || circleIds.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Circles</h2>
        <Card className="text-center py-8">
          <CardContent>
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No circles available</h3>
            <p className="text-gray-600">Create a new circle to get started!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Available Circles</h2>
      <div className="space-y-4">
        {circleIds.map((id) => (
          <JoinCircleCard 
            key={id} 
            id={id} 
            onJoinSuccess={onJoinSuccess}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  )
} 