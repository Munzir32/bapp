export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  circleId?: string
  circleName?: string
  userId: string
  isRead: boolean
  createdAt: Date
  expiresAt?: Date
  metadata?: Record<string, any>
}

export type NotificationType = 
  | 'contribution_reminder'
  | 'payout_received'
  | 'new_member_joined'
  | 'payment_confirmed'
  | 'circle_created'
  | 'circle_joined'
  | 'contribution_made'
  | 'payout_scheduled'
  | 'system_alert'

export interface NotificationPreferences {
  userId: string
  email: boolean
  push: boolean
  browser: boolean
  contributionReminders: boolean
  payoutNotifications: boolean
  memberUpdates: boolean
  systemAlerts: boolean
}

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}
