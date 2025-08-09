import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Wifi, WifiOff } from "lucide-react"
import { useCircleChat } from "@/lib/useCircleChat"

interface Message {
  sender: string
  message: string
  time: string
}

interface CircleChatProps {
  circleId: string
  isMember: boolean
  userName: string
}

function CircleChat({ circleId, isMember, userName }: CircleChatProps) {
  const { messages, sendMessage, isLoadingHistory, isConnected } = useCircleChat(circleId, isMember, userName) as { 
    messages: Message[], 
    sendMessage: (msg: string) => void,
    isLoadingHistory: boolean,
    isConnected: boolean
  }
  const [message, setMessage] = useState("")

  if (!isMember) {
    return (
      <div className="p-4 text-center text-gray-500">You are not a member of this circle and cannot participate in the chat.</div>
    )
  }

  const handleSendMessage = () => {
    if (message.trim() && isConnected) {
      sendMessage(message)
      setMessage("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <span>Circle Chat</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            {isConnected ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span>Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span>Disconnected</span>
              </div>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          {isConnected 
            ? "Stay connected with your circle members" 
            : "Reconnecting to chat server..."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {isLoadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading chat history from IPFS...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg: Message, idx: number) => (
              <div key={idx} className={`flex ${msg.sender === userName ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === userName ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${msg.sender === userName ? "text-orange-100" : "text-gray-500"}`}>
                  {msg.sender} • {msg.time}
                </p>
              </div>
            </div>
            ))
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
            disabled={isLoadingHistory || !isConnected}
          />
          <Button 
            onClick={handleSendMessage} 
            size="sm" 
            disabled={isLoadingHistory || !isConnected || !message.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {!isConnected && (
          <div className="mt-2 text-center text-sm text-amber-600">
            Messages will be sent when connection is restored
          </div>
        )}
      </CardContent>
    </Card>
  )
} 

export default CircleChat; 