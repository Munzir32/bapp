"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle } from "lucide-react"

interface Member {
  id: number
  address: string
  name: string
  avatar: string
  status: string
  isYou: boolean
  nextPayout: boolean
}

interface PayoutScheduleProps {
  members: Member[]
  currentRound: number
}

export function PayoutSchedule({ members, currentRound }: PayoutScheduleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Schedule</CardTitle>
        <CardDescription>See who receives the payout each round</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member, index) => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-medium text-orange-600">
                  {index + 1}
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {member.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {member.name} {member.isYou && "(You)"}
                  </p>
                  <p className="text-sm text-gray-500">Round {index + 1}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {index < currentRound - 1 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
                {index === currentRound - 1 && <Badge className="bg-orange-500">Current Round</Badge>}
                {index > currentRound - 1 && <Badge variant="outline">Upcoming</Badge>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 