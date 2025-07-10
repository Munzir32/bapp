import { NextRequest, NextResponse } from 'next/server'
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true
})

export async function POST(request: NextRequest) {
  try {
    const { circleId, message } = await request.json()
    
    if (!circleId || !message) {
      return NextResponse.json({ error: 'Missing circleId or message' }, { status: 400 })
    }
    
    await pusher.trigger(`circle-${circleId}`, 'new-message', message)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
} 