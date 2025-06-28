"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award } from "lucide-react"

interface Milestone {
  name: string
  achieved: boolean
  icon: string
}

interface CircleAchievementsProps {
  milestones: Milestone[]
}

export function CircleAchievements({ milestones }: CircleAchievementsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="w-5 h-5" />
          <span>Circle Milestones</span>
        </CardTitle>
        <CardDescription>Track your circle's achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {milestones.map((milestone, index) => (
            <Card
              key={index}
              className={`text-center ${
                milestone.achieved
                  ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <CardContent className="p-4">
                <div className="text-2xl mb-2">{milestone.icon}</div>
                <p className={`text-sm font-medium ${milestone.achieved ? "text-gray-900" : "text-gray-400"}`}>
                  {milestone.name}
                </p>
                {milestone.achieved && (
                  <Badge variant="secondary" className="mt-2 bg-orange-100 text-orange-800">
                    Achieved
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 