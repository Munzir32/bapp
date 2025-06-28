import { useReadContract } from 'wagmi'
import { contractAddress } from '@/contracts/constant'
import ABI from '@/contracts/abi.json'

export const useReadCircle = (id: string) => {
  const { data: circleData } = useReadContract({
    abi: ABI,
    address: contractAddress as `0x${string}`,
    functionName: "circles",
    args: [id],
  })

  return { circleData }
}

export const useReadCircleTotal = () => {
  const { data: circleCount } = useReadContract({
    abi: ABI,
    address: contractAddress as `0x${string}`,
    functionName: "_circleIds",
    args: [],
  })

  return { circleCount }
}

export const useReadUserCircles = (userAddress: string) => {
  const { data: userCircleIds } = useReadContract({
    abi: ABI,
    address: contractAddress as `0x${string}`,
    functionName: "userCircles",
    args: [userAddress as `0x${string}`],
  })

  return { userCircleIds }
}

export const useReadCircleMembers = (circleId: string) => {
  const { data: circleMembers } = useReadContract({
    abi: ABI,
    address: contractAddress as `0x${string}`,
    functionName: "getTeamMembers",
    args: [circleId],
  })

  return { circleMembers }
} 