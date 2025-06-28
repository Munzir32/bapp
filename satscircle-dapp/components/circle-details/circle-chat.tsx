"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send } from "lucide-react"

interface Message {
  id: number
  sender: string
  message: string
  time: string
}

interface CircleChatProps {
  messages: Message[]
  onSendMessage: (message: string) => void
}

export function CircleChat({ messages, onSendMessage }: CircleChatProps) {
  const [message, setMessage] = useState("")

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <span>Circle Chat</span>
        </CardTitle>
        <CardDescription>Stay connected with your circle members</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender === "You" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${msg.sender === "You" ? "text-orange-100" : "text-gray-500"}`}>
                  {msg.sender} • {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 