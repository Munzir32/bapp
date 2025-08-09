"use client"

import { useState, useCallback, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useReadCircle, useReadCircleMembers } from "@/hooks/useReadCircle"
import { useParams } from "next/navigation"
import { useAccount, useWriteContract, useContractRead } from "wagmi"
import { useToast } from "@/hooks/use-toast"
import { contractAddress } from "@/contracts/constant"
import ABI from "@/contracts/abi.json"
import {
  CircleHeader,
  StatusBanner,
  CircleStats,
  PayoutSchedule,
  MembersList,
  CircleChat,
  CircleAchievements
} from "@/components/circle-details/index"

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

export default function CircleDetail() {
  const params = useParams();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();
  const [formattedCircle, setFormattedCircle] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [isDistributing, setIsDistributing] = useState(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const { circleData } = useReadCircle(params?.id as string)
  const { circleMembers } = useReadCircleMembers(params?.id as string)

  // Use wagmi's useContractRead to check membership
  const { data: isMemberData } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: ABI,
    functionName: 'isCircleMember',
    args: [params?.id ? BigInt(String(params.id)) : BigInt(0), address || '0x0000000000000000000000000000000000000000'],
    query: {
      enabled: !!params?.id && !!address,
    },
  })

  const isMember = Boolean(isMemberData)

  console.log("circleMembers raw data:", circleMembers)
  console.log("circleMembers type:", typeof circleMembers)
  console.log("circleMembers is array:", Array.isArray(circleMembers))
  console.log("circleMembers keys:", circleMembers ? Object.keys(circleMembers) : "null")
  console.log("circleMembers values:", circleMembers ? Object.values(circleMembers) : "null")
  console.log("circleMembers[0]:", Array.isArray(circleMembers) ? (circleMembers as any[])[0] : "not array")
  console.log("circleMembers[0] type:", Array.isArray(circleMembers) ? typeof (circleMembers as any[])[0] : "not array")
  console.log("circleMembers[0] keys:", Array.isArray(circleMembers) && (circleMembers as any[])[0] ? Object.keys((circleMembers as any[])[0]) : "not array or null")
  console.log("circleMembers[0] values:", Array.isArray(circleMembers) && (circleMembers as any[])[0] ? Object.values((circleMembers as any[])[0]) : "not array or null")

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

    // Calculate additional derived data
    const progress = Number(formattedData.currentRound) / Number(formattedData.memberLimit) * 100
    const frequencyText = formattedData.frequency === 0 ? 'Weekly' : 'Monthly'
    const visibilityText = formattedData.visibility === 0 ? 'Public' : 'Private'
    const nextContribution = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Mock calculation
    const daysUntilContribution = Math.ceil((nextContribution.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    // Use real member data from blockchain
    let memberAddresses: string[] = []
    
    if (circleMembers) {
      if (Array.isArray(circleMembers)) {
        // Handle case where circleMembers is an array of objects
        const membersArray = circleMembers as any[]
        memberAddresses = membersArray
          .flatMap((member: any) => {
            if (typeof member === 'string' && member.startsWith('0x')) {
              return [member]
            } else if (typeof member === 'object' && member !== null) {
              // Extract addresses from the object
              return Object.values(member)
                .filter((value: any) => typeof value === 'string' && value.startsWith('0x'))
            }
            return []
          })
          .map(addr => String(addr))
      } else if (typeof circleMembers === 'object' && circleMembers !== null) {
        // If it's an object, try to extract the addresses
        // The structure might be like { 0: "address1", 1: "address2", length: 2 }
        memberAddresses = Object.values(circleMembers)
          .filter((value: any) => 
            typeof value === 'string' && value.startsWith('0x')
          )
          .map(addr => String(addr))
      }
    }

    console.log("Extracted member addresses:", memberAddresses)

    const realMembers = memberAddresses.map((memberAddr: string, index: number) => {
      // Ensure memberAddr is a string and has the slice method
      const addressStr = String(memberAddr)
      return {
        id: index + 1,
        address: addressStr,
        name: `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`, // Truncated address as name
        avatar: "/placeholder.svg?height=40&width=40",
        status: "paid", // This would need to be fetched from member data
        isYou: address?.toLowerCase() === addressStr.toLowerCase(),
        nextPayout: index === Number(formattedData.payoutIndex)
      }
    })

    // Mock messages data
    const mockMessages = [
      { id: 1, sender: "Sarah Doe", message: "Thanks everyone for staying consistent! 💪", time: "2 hours ago" },
      { id: 2, sender: "Mike Doe", message: "Just made my contribution for this week!", time: "1 day ago" },
      { id: 3, sender: "You", message: "Great job team, we're doing amazing!", time: "2 days ago" },
    ]

    // Mock milestones data
    const mockMilestones = [
      { name: "First Month Complete", achieved: true, icon: "🎯" },
      { name: "50% Progress", achieved: true, icon: "⭐" },
      { name: "Perfect Attendance", achieved: false, icon: "💎" },
      { name: "Circle Complete", achieved: false, icon: "🏆" },
    ]
    
    setFormattedCircle({
      ...formattedData,
      progress: Math.min(progress, 100),
      frequencyText,
      visibilityText,
      contributionAmountFormatted: Number(formattedData.contributionAmount).toLocaleString(),
      totalBTCSavedFormatted: Number(formattedData.totalBTCSaved).toLocaleString(),
      createdAtFormatted: new Date(Number(formattedData.createdAt) * 1000).toLocaleDateString(),
      nextContribution,
      daysUntilContribution,
      members: realMembers,
      messages: mockMessages,
      milestones: mockMilestones,
      totalRounds: Number(formattedData.memberLimit),
      groupSize: Number(formattedData.memberLimit),
      currentRound: Number(formattedData.currentRound),
      memberLimit: Number(formattedData.memberLimit),
      contributionAmount: Number(formattedData.contributionAmount),
      totalBTCSaved: Number(formattedData.totalBTCSaved)
    })
  }, [circleData, circleMembers, address])

  useEffect(() => {
    formatCircleData()
  }, [formatCircleData])

  const handleSendMessage = (message: string) => {
      // Handle sending message
      console.log("Sending message:", message)
  }

  const handlePayNow = async () => {
    if (!address || !formattedCircle) return

    try {
      setIsDistributing(true)

      await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: ABI,
        functionName: 'contribute',
        args: [formattedCircle.id],
        value: BigInt(formattedCircle.contributionAmount)
      })

      toast({
        title: "Contribution Successful!",
        description: `You've contributed ${formattedCircle.contributionAmountFormatted} cBTC to ${formattedCircle.name}`,
      })
    } catch (error) {
      console.error("Contribution error:", error)
      toast({
        title: "Contribution Failed",
        description: "There was an error processing your contribution. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDistributing(false)
    }
  }

  if (!formattedCircle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading circle details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CircleHeader 
        name={formattedCircle.name}
        currentRound={formattedCircle.currentRound}
        totalRounds={formattedCircle.totalRounds}
      />

      <main className="container mx-auto px-4 py-6">
        <StatusBanner
          daysUntilContribution={formattedCircle.daysUntilContribution}
          progress={formattedCircle.progress}
          totalBTCSavedFormatted={formattedCircle.totalBTCSavedFormatted}
          membersCount={formattedCircle.members.length}
          contributionAmountFormatted={formattedCircle.contributionAmountFormatted}
          onPayNow={handlePayNow}
          isDistributing={isDistributing}
          isOwner={address?.toLowerCase() === formattedCircle.owner.toLowerCase()}
        />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="achievements">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <CircleStats
              contributionAmountFormatted={formattedCircle.contributionAmountFormatted}
              groupSize={formattedCircle.groupSize}
              frequencyText={formattedCircle.frequencyText}
              membersCount={formattedCircle.members.length}
            />
            <PayoutSchedule 
              members={formattedCircle.members}
              currentRound={formattedCircle.currentRound}
            />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <MembersList members={formattedCircle.members} />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <CircleChat 
              circleId={params?.id as string}
              isMember={isMember}
              userName={address || ""}
            />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <CircleAchievements milestones={formattedCircle.milestones} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
