import { useEffect, useState, useCallback, useRef } from "react"
import Pusher from 'pusher-js'
import { useIpfs } from "./useIpfs"

interface Message {
  sender: string
  message: string
  time: string
  cid?: string
  id?: string
}

interface CircleMessageIndex {
  circleId: string
  messageCids: string[]
  lastUpdated: number
}

export function usePusherChat(
  circleId: string,
  isMember: boolean,
  userName: string
) {
  const ipfs = useIpfs()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const pusherRef = useRef<Pusher | null>(null)
  const channelRef = useRef<any>(null)
  const hasLoadedFromIPFSRef = useRef(false)
  const messageIndexCidRef = useRef<string | null>(null)

  // Initialize Pusher
  useEffect(() => {
    if (!isMember || pusherRef.current) return

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    pusherRef.current = pusher

    pusher.connection.bind('connected', () => {
      console.log('Pusher connected')
      setIsConnected(true)
    })

    pusher.connection.bind('disconnected', () => {
      console.log('Pusher disconnected')
      setIsConnected(false)
    })

    return () => {
      pusher.disconnect()
    }
  }, [isMember])

  // Subscribe to channel
  useEffect(() => {
    if (!pusherRef.current || !circleId || !isMember) return

    const channel = pusherRef.current.subscribe(`circle-${circleId}`)
    channelRef.current = channel

    channel.bind('new-message', (message: Message) => {
      console.log('Received new message:', message)
      
      // Add unique ID if not present
      if (!message.id) {
        message.id = `${Date.now()}-${Math.random()}`
      }
      
      // Check if message already exists to prevent duplicates
      setMessages((prev) => {
        const exists = prev.some(m => m.id === message.id || (m.sender === message.sender && m.message === message.message && m.time === message.time))
        if (exists) {
          console.log('Duplicate message detected, skipping:', message)
          return prev
        }
        console.log('Adding new message:', message)
        return [...prev, message]
      })
    })

    return () => {
      pusherRef.current?.unsubscribe(`circle-${circleId}`)
    }
  }, [circleId, isMember])

  // Load messages from IPFS on mount
  useEffect(() => {
    if (!circleId || !ipfs || hasLoadedFromIPFSRef.current) return
    
    const loadMessagesFromIPFS = async () => {
      try {
        setIsLoadingHistory(true)
        console.log('Loading messages from IPFS for circle:', circleId)
        
        // Try to load the message index for this circle
        const indexCid = await getCircleMessageIndexCid(circleId)
        
        if (indexCid) {
          messageIndexCidRef.current = indexCid
          
          // Load the index
          const indexData = await ipfs.cat(indexCid)
          const index: CircleMessageIndex = JSON.parse(indexData)
          
          console.log('Found message index with', index.messageCids.length, 'messages')
          
          // Load all messages from their CIDs
          const loadedMessages: Message[] = []
          for (const cid of index.messageCids) {
            try {
              const messageData = await ipfs.cat(cid)
              const message: Message = JSON.parse(messageData)
              message.cid = cid // Ensure CID is set
              loadedMessages.push(message)
            } catch (error) {
              console.error('Error loading message from CID:', cid, error)
            }
          }
          
          setMessages(loadedMessages)
          console.log('Loaded', loadedMessages.length, 'messages from IPFS')
        } else {
          console.log('No existing message index found for circle:', circleId)
        }
      } catch (error) {
        console.error('Error loading messages from IPFS:', error)
      } finally {
        setIsLoadingHistory(false)
        hasLoadedFromIPFSRef.current = true
      }
    }
    
    loadMessagesFromIPFS()
  }, [circleId, ipfs])

  // Helper function to get the message index CID for a circle
  const getCircleMessageIndexCid = async (circleId: string): Promise<string | null> => {
    try {
      const storageKey = `circle-${circleId}-index-cid`
      const storedCid = localStorage.getItem(storageKey)
      
      if (storedCid) {
        console.log('Found stored index CID:', storedCid)
        return storedCid
      }
      
      console.log('No stored index CID found for circle:', circleId)
      return null
    } catch (error) {
      console.log('Error getting index CID:', error)
      return null
    }
  }

  // Helper function to save the message index to IPFS
  const saveMessageIndexToIPFS = async (messageCids: string[]): Promise<string> => {
    const index: CircleMessageIndex = {
      circleId,
      messageCids,
      lastUpdated: Date.now()
    }
    
    const { cid } = await ipfs.add(JSON.stringify(index))
    const cidString = cid.toString()
    console.log('Saved message index to IPFS with CID:', cidString)
    
    // Store the index CID locally for future reference
    const storageKey = `circle-${circleId}-index-cid`
    localStorage.setItem(storageKey, cidString)
    messageIndexCidRef.current = cidString
    
    return cidString
  }

  const sendMessage = useCallback(async (message: string) => {
    if (!ipfs || !isMember) {
      console.error('Cannot send message: IPFS not ready or not a member')
      return
    }
    
    if (!isConnected) {
      console.error('Cannot send message: Pusher not connected')
      return
    }
    
    try {
      const msgObj: Message = {
        id: `${Date.now()}-${Math.random()}`,
        sender: userName,
        message,
        time: new Date().toLocaleTimeString(),
      }
      
      // Store message on IPFS
      const { cid } = await ipfs.add(JSON.stringify(msgObj))
      
      // Add CID to message
      const messageWithCid = { ...msgObj, cid: cid.toString() }
      
      // Send message via API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          circleId,
          message: messageWithCid
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      
      // Add to local messages immediately
      setMessages((prev) => {
        const newMessages = [...prev, messageWithCid]
        
        // Update the message index on IPFS (do this asynchronously)
        setTimeout(async () => {
          try {
            const messageCids = newMessages.map(m => m.cid!).filter(Boolean)
            await saveMessageIndexToIPFS(messageCids)
          } catch (error) {
            console.error('Error updating message index:', error)
          }
        }, 0)
        
        console.log('Adding sent message to local state:', messageWithCid)
        return newMessages
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }, [ipfs, circleId, isMember, userName, isConnected])

  return { messages, sendMessage, isLoadingHistory, isConnected }
} 