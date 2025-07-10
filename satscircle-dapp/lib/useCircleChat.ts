import { useEffect, useState, useCallback, useRef } from "react"
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

export function useCircleChat(
  circleId: string,
  isMember: boolean,
  userName: string
) {
  const ipfs = useIpfs()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)
  const isConnectedRef = useRef(false)
  const hasLoadedFromIPFSRef = useRef(false)
  const messageIndexCidRef = useRef<string | null>(null)

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
      // For now, we'll use a simple approach - store the index CID in localStorage
      // In a production app, you might want to use a smart contract or a centralized registry
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

  useEffect(() => {
    if (!isMember || isConnectedRef.current) return
    
    const ws = new WebSocket('ws://localhost:8080')
    wsRef.current = ws
    isConnectedRef.current = true

    ws.onopen = () => {
      console.log('WebSocket connected')
      ws.send(JSON.stringify({ circleId }))
    }
    
    ws.onmessage = async (event) => {
      try {
        // Handle both string and blob data
        let data: string
        if (event.data instanceof Blob) {
          data = await event.data.text()
        } else {
          data = event.data
        }
        
        // Skip empty messages
        if (!data || data.trim() === '') {
          return
        }
        
        const msg: Message = JSON.parse(data)
        
        // Add unique ID if not present
        if (!msg.id) {
          msg.id = `${Date.now()}-${Math.random()}`
        }
        
        // Check if message already exists to prevent duplicates
        setMessages((prev) => {
          const exists = prev.some(m => m.id === msg.id || (m.sender === msg.sender && m.message === msg.message && m.time === msg.time))
          if (exists) {
            console.log('Duplicate message detected, skipping:', msg)
            return prev
          }
          console.log('Adding new message:', msg)
          return [...prev, msg]
        })
      } catch (e) {
        console.error('Error parsing WebSocket message:', e, 'Raw data:', event.data)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected')
      isConnectedRef.current = false
    }
    
    return () => {
      isConnectedRef.current = false
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [circleId, isMember])

  const sendMessage = useCallback(async (message: string) => {
    if (!ipfs || !isMember || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: IPFS not ready, not a member, or WebSocket not connected')
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
      
      // Send message to relay
      wsRef.current.send(
        JSON.stringify({ 
          circleId, 
          message: messageWithCid
        })
      )
      
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
  }, [ipfs, circleId, isMember, userName])

  return { messages, sendMessage, isLoadingHistory }
} 