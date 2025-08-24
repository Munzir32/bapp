import { Notification, NotificationType } from '../types/notifications'

export class NotificationService {
  private static instance: NotificationService
  private listeners: Map<string, (notification: Notification) => void> = new Map()

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Subscribe to notification events
  subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    this.listeners.set(userId, callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(userId)
    }
  }

  // Send notification to specific user
  private sendToUser(userId: string, notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): void {
    const listener = this.listeners.get(userId)
    if (listener) {
      listener({
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        isRead: false,
      })
    }
  }

  // Contribution reminder notifications
  sendContributionReminder(
    userId: string, 
    circleId: string, 
    circleName: string, 
    amount: string, 
    dueDate: Date
  ): void {
    this.sendToUser(userId, {
      type: 'contribution_reminder',
      title: 'Contribution Reminder',
      message: `Your contribution of ${amount} cBTC to "${circleName}" is due ${dueDate.toLocaleDateString()}. Please make your payment to stay in good standing.`,
      circleId,
      circleName,
      userId,
      expiresAt: dueDate,
      metadata: { amount, dueDate: dueDate.toISOString() }
    })
  }

  // Payout received notifications
  sendPayoutReceived(
    userId: string, 
    circleId: string, 
    circleName: string, 
    amount: string
  ): void {
    this.sendToUser(userId, {
      type: 'payout_received',
      title: 'Payout Received! 🎉',
      message: `Congratulations! You've received ${amount} cBTC from "${circleName}". Your payout has been processed successfully.`,
      circleId,
      circleName,
      userId,
      metadata: { amount }
    })
  }

  // New member joined notifications
  sendNewMemberJoined(
    userId: string, 
    circleId: string, 
    circleName: string, 
    newMemberAddress: string
  ): void {
    this.sendToUser(userId, {
      type: 'new_member_joined',
      title: 'New Member Joined',
      message: `A new member has joined "${circleName}". Welcome them to the circle!`,
      circleId,
      circleName,
      userId,
      metadata: { newMemberAddress }
    })
  }

  // Payment confirmation notifications
  sendPaymentConfirmed(
    userId: string, 
    circleId: string, 
    circleName: string, 
    amount: string, 
    transactionHash: string
  ): void {
    this.sendToUser(userId, {
      type: 'payment_confirmed',
      title: 'Payment Confirmed',
      message: `Your contribution of ${amount} cBTC to "${circleName}" has been confirmed on the blockchain.`,
      circleId,
      circleName,
      userId,
      metadata: { amount, transactionHash }
    })
  }

  // Circle created notifications
  sendCircleCreated(
    userId: string, 
    circleId: string, 
    circleName: string
  ): void {
    this.sendToUser(userId, {
      type: 'circle_created',
      title: 'Circle Created Successfully! 🎉',
      message: `Your circle "${circleName}" has been created and is now active. Start inviting members to begin saving together!`,
      circleId,
      circleName,
      userId,
      metadata: { circleId }
    })
  }

  // Circle joined notifications
  sendCircleJoined(
    userId: string, 
    circleId: string, 
    circleName: string, 
    contributionAmount: string
  ): void {
    this.sendToUser(userId, {
      type: 'circle_joined',
      title: 'Welcome to the Circle! 🎉',
      message: `You've successfully joined "${circleName}" with a contribution of ${contributionAmount} cBTC. Welcome to the community!`,
      circleId,
      circleName,
      userId,
      metadata: { contributionAmount }
    })
  }

  // Contribution made notifications
  sendContributionMade(
    userId: string, 
    circleId: string, 
    circleName: string, 
    amount: string
  ): void {
    this.sendToUser(userId, {
      type: 'contribution_made',
      title: 'Contribution Made',
      message: `You've successfully contributed ${amount} cBTC to "${circleName}". Keep up the great saving habit!`,
      circleId,
      circleName,
      userId,
      metadata: { amount }
    })
  }

  // Payout scheduled notifications
  sendPayoutScheduled(
    userId: string, 
    circleId: string, 
    circleName: string, 
    payoutDate: Date, 
    amount: string
  ): void {
    this.sendToUser(userId, {
      type: 'payout_scheduled',
      title: 'Payout Scheduled',
      message: `Your payout of ${amount} cBTC from "${circleName}" is scheduled for ${payoutDate.toLocaleDateString()}.`,
      circleId,
      circleName,
      userId,
      expiresAt: payoutDate,
      metadata: { payoutDate: payoutDate.toISOString(), amount }
    })
  }

  // System alert notifications
  sendSystemAlert(
    userId: string, 
    title: string, 
    message: string, 
    metadata?: Record<string, any>
  ): void {
    this.sendToUser(userId, {
      type: 'system_alert',
      title,
      message,
      userId,
      metadata
    })
  }

  // Batch notifications for multiple users
  sendBatchNotification(
    userIds: string[], 
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'userId'>
  ): void {
    userIds.forEach(userId => {
      this.sendToUser(userId, {
        ...notification,
        userId
      })
    })
  }

  // Schedule future notifications
  scheduleNotification(
    userId: string, 
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>, 
    delayMs: number
  ): void {
    setTimeout(() => {
      this.sendToUser(userId, notification)
    }, delayMs)
  }

  // Recurring notifications (e.g., weekly reminders)
  scheduleRecurringNotification(
    userId: string, 
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>, 
    intervalMs: number
  ): () => void {
    const intervalId = setInterval(() => {
      this.sendToUser(userId, notification)
    }, intervalMs)

    // Return function to cancel recurring notification
    return () => clearInterval(intervalId)
  }
}

export const notificationService = NotificationService.getInstance()
