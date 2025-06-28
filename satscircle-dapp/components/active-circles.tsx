"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import ActiveCard from "./cards/active-circle"
import { Users } from "lucide-react"
import { useReadCircleTotal } from "@/hooks/useReadCircle"
import { useCallback, useState, useEffect } from 'react'

export function ActiveCircles() {
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

  if (!circleCount || circleIds.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Active Circles</h2>
        <Card className="text-center py-8">
          <CardContent>
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active circles</h3>
            <p className="text-gray-600">Join or create a circle to start your Bitcoin savings journey!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Active Circles</h2>
      <div className="space-y-4">
        {circleIds.map((id) => (
          <ActiveCard key={id} id={id} />
        ))}
      </div>
    </div>
  )
} 