"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, AlertCircle } from "lucide-react"

interface Member {
  id: number
  address: string
  name: string
  avatar: string
  status: string
  isYou: boolean
  nextPayout: boolean
}

interface MembersListProps {
  members: Member[]
}

export function MembersList({ members }: MembersListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Circle Members</CardTitle>
        <CardDescription>Track everyone's contribution status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
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
                  <p className="text-sm text-gray-500">
                    {member.nextPayout ? "Next to receive payout" : "Active member"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {member.status === "paid" ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Paid
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
                {member.nextPayout && <Badge className="bg-orange-500">Next Payout</Badge>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 