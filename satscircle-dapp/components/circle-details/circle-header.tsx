"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Share2, Settings } from "lucide-react"
import Link from "next/link"

interface CircleHeaderProps {
  name: string
  currentRound: number
  totalRounds: number
}

export function CircleHeader({ name, currentRound, totalRounds }: CircleHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{name}</h1>
              <p className="text-sm text-gray-600">
                Round {currentRound} of {totalRounds}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 