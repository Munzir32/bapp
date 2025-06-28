"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Users, Coins, TrendingUp, Award, Zap, Clock, Target, Star } from "lucide-react"
import Link from "next/link"
import { CreateCircleModal } from "@/components/create-circle-modal"
import { JoinCircleModal } from "@/components/join-circle-modal"
import { ActiveCircles } from "@/components/active-circles"
import { StatsCards } from "@/components/stats-cards"
import { BadgesSection } from "@/components/badges-section"
import { RecentActivity } from "@/components/recent-activity"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function Dashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  const activeCircles = [
    {
      id: 1,
      name: "Family Savers",
      members: 6,
      totalMembers: 6,
      contribution: 10000,
      frequency: "Weekly",
      nextPayout: "Sarah",
      daysUntilContribution: 3,
      progress: 67,
      totalSaved: 240000,
    },
    {
      id: 2,
      name: "College Friends",
      members: 4,
      totalMembers: 5,
      contribution: 25000,
      frequency: "Monthly",
      nextPayout: "You",
      daysUntilContribution: 12,
      progress: 80,
      totalSaved: 500000,
    },
  ]

  const stats = {
    totalSaved: 740000,
    activeCircles: 2,
    currentStreak: 8,
    completedCircles: 1,
  }

  const badges = [
    { name: "Early Adopter", icon: "🚀", earned: true },
    { name: "Consistent Saver", icon: "💎", earned: true },
    { name: "Circle Creator", icon: "👑", earned: false },
    { name: "Bitcoin Builder", icon: "🏗️", earned: true },
  ]

  const activities = [
    {
      id: "1",
      type: "contribution" as const,
      title: "Contributed to Family Savers",
      description: "Made weekly contribution",
      amount: "+10,000 sats",
      icon: Coins,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      timestamp: "2 days ago"
    },
    {
      id: "2",
      type: "badge" as const,
      title: "Earned \"Consistent Saver\" badge",
      description: "Achievement unlocked",
      icon: Award,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      timestamp: "1 week ago"
    },
    {
      id: "3",
      type: "payout" as const,
      title: "Received payout from College Friends",
      description: "Circle payout received",
      amount: "125,000 sats",
      icon: Target,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      timestamp: "2 weeks ago"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SatsCircle</span>
            </div>
            {/* <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">John Doe</span>
            </div> */}
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, John! 👋</h1>
          <p className="text-gray-600">Keep up your great saving streak!</p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button onClick={() => setShowCreateModal(true)} className="flex-1 h-12 bg-orange-500 hover:bg-orange-600">
            <Plus className="w-5 h-5 mr-2" />
            Create New Circle
          </Button>
          <Button variant="outline" className="flex-1 h-12 bg-transparent" onClick={() => setShowJoinModal(true)}>
            <Users className="w-5 h-5 mr-2" />
            Join a Circle
          </Button>
        </div>

        {/* Active Circles */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Active Circles</h2>
          <ActiveCircles />
        </div>

        {/* Badges & Achievements */}
        <BadgesSection badges={badges} />

        {/* Recent Activity */}
        <RecentActivity activities={activities} />
      </main>
            {/* done */}
      <CreateCircleModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      <JoinCircleModal open={showJoinModal} onOpenChange={setShowJoinModal} />
    </div>
  )
}
