"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import type { Notification, NotificationType, NotificationPreferences } from '../types/notifications'
import { useToast } from '@/hooks/use-toast'
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react'

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  preferences: NotificationPreferences
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void
  requestNotificationPermission: () => Promise<boolean>
  subscribeToPushNotifications: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

const defaultPreferences: NotificationPreferences = {
  userId: '',
  email: true,
  push: true,
  browser: true,
  contributionReminders: true,
  payoutNotifications: true,
  memberUpdates: true,
  systemAlerts: true,
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences)
  const { user } = useDynamicContext()
  const { toast } = useToast()

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (user?.email) {
      const stored = localStorage.getItem(`notifications_${user.email}`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setNotifications(parsed.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
            expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined
          })))
        } catch (error) {
          console.error('Error parsing stored notifications:', error)
        }
      }

      // Load preferences
      const storedPrefs = localStorage.getItem(`notification_preferences_${user.email}`)
      if (storedPrefs) {
        try {
          setPreferences(JSON.parse(storedPrefs))
        } catch (error) {
          console.error('Error parsing stored preferences:', error)
        }
      }
    }
  }, [user?.email])

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (user?.email && notifications.length > 0) {
      localStorage.setItem(`notifications_${user.email}`, JSON.stringify(notifications))
    }
  }, [notifications, user?.email])

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(`notification_preferences_${user.email}`, JSON.stringify(preferences))
    }
  }, [preferences, user?.email])

  // Clean up expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.filter(n => !n.expiresAt || n.expiresAt > new Date()))
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      isRead: false,
    }

    setNotifications(prev => [newNotification, ...prev])

    // Show toast notification if browser notifications are enabled
    if (preferences.browser) {
      toast({
        title: newNotification.title,
        description: newNotification.message,
        action: (
          <button
            onClick={() => markAsRead(newNotification.id)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark Read
          </button>
        ),
      })
    }

    // Show browser notification if permission granted
    if (Notification.permission === 'granted' && preferences.browser) {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/placeholder-logo.png',
        badge: '/placeholder-logo.png',
        tag: newNotification.id,
        requireInteraction: true,
      })
    }
  }, [preferences.browser, toast, markAsRead])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const updatePreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }))
  }, [])

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }, [])

  const subscribeToPushNotifications = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications are not supported')
      return
    }

    try {
      const permission = await requestNotificationPermission()
      if (!permission) {
        throw new Error('Notification permission denied')
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      // Here you would typically send the subscription to your backend
      console.log('Push notification subscription:', subscription)
      
      toast({
        title: "Push Notifications Enabled! 🎉",
        description: "You'll now receive real-time updates about your circles.",
      })
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      toast({
        title: "Push Notifications Failed",
        description: "Unable to enable push notifications. Please try again.",
        variant: "destructive"
      })
    }
  }, [requestNotificationPermission, toast])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearNotifications,
    preferences,
    updatePreferences,
    requestNotificationPermission,
    subscribeToPushNotifications,
  }

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
