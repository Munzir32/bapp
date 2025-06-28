"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Users,
  AlertCircle,
  LinkIcon,
  Filter,
} from "lucide-react"
import { AvailableCircles } from "./available-circles"

interface JoinCircleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinCircleModal({ open, onOpenChange }: JoinCircleModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [inviteCode, setInviteCode] = useState("")

  const handleJoinSuccess = () => {
    // Close modal and reset state
    onOpenChange(false)
    setSearchQuery("")
    setInviteCode("")
  }

  // TODO: implement this later 
  const handleJoinWithCode = async () => {
    try {
      if (!inviteCode.trim()) {
        // Show error message
        return
      }

      console.log("Joining with invite code:", inviteCode)
      
      // For now, we'll show a placeholder message since invite codes need additional implementation
      // 1. Decode the invite code to get circle ID
      // 2. Fetch circle details from the blockchain
      // 3. Call joinCircle with the decoded circle ID
      
      // Close modal and reset state
      onOpenChange(false)
      setInviteCode("")

    } catch (error: any) {
      console.error("Error joining with invite code:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Join a Circle</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="browse" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Public Circles</TabsTrigger>
            <TabsTrigger value="invite">Join with Invite</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6 mt-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search circles by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>
            </div>

            {/* Available Circles Component */}
            <AvailableCircles onJoinSuccess={handleJoinSuccess} searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="invite" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LinkIcon className="w-5 h-5" />
                  <span>Join with Invite Code</span>
                </CardTitle>
                <CardDescription>
                  Have an invite code from a friend? Enter it below to join their private circle.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="invite-code">Invite Code</Label>
                  <Input
                    id="invite-code"
                    placeholder="Enter invite code (e.g., FAMILY2024)"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Invite codes are usually shared by circle creators via message or email
                  </p>
                </div>

                <Button
                  onClick={handleJoinWithCode}
                  disabled={!inviteCode.trim()}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Join with Code
                </Button>
              </CardContent>
            </Card>

            {/* How to get invite codes */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Need an invite code?</h4>
                    <p className="text-sm text-blue-800">
                      Ask friends or family members who have created private circles to share their invite code with
                      you. You can also browse public circles in the other tab!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
