"use client"

import { useMemo } from 'react'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import type { Abi } from 'viem'
import ABI from '@/contracts/abi.json'
import { contractAddress } from '@/contracts/constant'

const CONTRACT_ABI = ABI as unknown as Abi

type CirclesContractCall = {
  abi: Abi
  address: `0x${string}`
  functionName: 'circles'
  args: readonly [bigint]
}

type MembersContractCall = {
  abi: Abi
  address: `0x${string}`
  functionName: 'members'
  args: readonly [bigint, `0x${string}`]
}

export interface DashboardStats {
  totalSaved: number
  activeCircles: number
  currentStreak: number
  completedCircles: number
}

export function useDashboardStats() {
  const { address } = useAccount()

  const { data: userCircleIds } = useReadContract({
    abi: CONTRACT_ABI,
    address: contractAddress as `0x${string}`,
    functionName: 'getUserCircles',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  }) as { data: readonly bigint[] | undefined }

  const circleIds = (userCircleIds ?? []) as readonly bigint[]

  const circleContracts = circleIds.map((id) => ({
    abi: CONTRACT_ABI,
    address: contractAddress as `0x${string}`,
    functionName: 'circles',
    args: [id] as const
  })) as readonly CirclesContractCall[]

  const memberContracts = circleIds.map((id) => ({
    abi: CONTRACT_ABI,
    address: contractAddress as `0x${string}`,
    functionName: 'members',
    args: [id, (address as `0x${string}`)] as const
  })) as readonly MembersContractCall[]

  const { data: circlesData } = useReadContracts({
    contracts: circleContracts
  })

  const { data: membersData } = useReadContracts({
    contracts: memberContracts
  })

  const stats: DashboardStats = useMemo(() => {
    let totalSaved = 0
    let activeCircles = 0
    let currentStreak = 0
    let completedCircles = 0

    if (!circlesData || !membersData) {
      return { totalSaved, activeCircles, currentStreak, completedCircles }
    }

    for (let i = 0; i < circleIds.length; i++) {
      const circle = (circlesData[i] as any)?.result as any[] | undefined
      const member = (membersData[i] as any)?.result as any[] | undefined

      if (member && typeof member[2] !== 'undefined') {
        try {
          totalSaved += Number(member[2] ?? 0) // totalContributed
        } catch {
          // ignore overflow in UI context
        }
      }

      if (member && typeof member[3] !== 'undefined') {
        try {
          currentStreak += Number(member[3] ?? 0) // currentStreak
        } catch {
          // ignore
        }
      }

      const isActive = circle ? Boolean(circle[11]) : false
      if (isActive) activeCircles += 1
      else completedCircles += 1 // treat inactive circles as completed/ended
    }

    return { totalSaved, activeCircles, currentStreak, completedCircles }
  }, [circlesData, membersData, circleIds.length])

  const isLoading = !address || circlesData === undefined || membersData === undefined

  return { stats, isLoading }
}
