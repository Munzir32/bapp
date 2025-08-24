import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// Configure VAPID keys
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
}

webpush.setVapidDetails(
  'mailto:your-email@example.com', // Replace with your email
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

export async function POST(request: NextRequest) {
  try {
    const { subscription, payload } = await request.json()

    if (!subscription || !payload) {
      return NextResponse.json(
        { error: 'Missing subscription or payload' },
        { status: 400 }
      )
    }

    // Send push notification
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    )

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error sending push notification:', error)
    
    if (error instanceof Error && error.message.includes('410')) {
      // Subscription has expired or is no longer valid
      return NextResponse.json(
        { error: 'Subscription expired' },
        { status: 410 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Push notifications endpoint' })
}
