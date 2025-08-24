"use client"

import React, { useState } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Info, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useNotifications } from '@/lib/contexts/NotificationsContext'
import { Notification } from '@/lib/types/notifications'
import { formatDistanceToNow } from 'date-fns'

export function NotificationsBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    preferences,
    updatePreferences,
    subscribeToPushNotifications
  } = useNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'contribution_reminder':
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      case 'payout_received':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'new_member_joined':
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'contribution_reminder':
        return 'border-l-orange-500'
      case 'payout_received':
        return 'border-l-green-500'
      case 'new_member_joined':
        return 'border-l-blue-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    
    // Navigate to relevant page based on notification type
    if (notification.circleId) {
      window.location.href = `/circle/${notification.circleId}`
    }
    
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] overflow-hidden">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreferences(!showPreferences)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </Button>
                </div>
              )}
            </CardHeader>

            {showPreferences ? (
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Notification Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="browser-notifications">Browser Notifications</Label>
                    <Switch
                      id="browser-notifications"
                      checked={preferences.browser}
                      onCheckedChange={(checked) => updatePreferences({ browser: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="contribution-reminders">Contribution Reminders</Label>
                    <Switch
                      id="contribution-reminders"
                      checked={preferences.contributionReminders}
                      onCheckedChange={(checked) => updatePreferences({ contributionReminders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="payout-notifications">Payout Notifications</Label>
                    <Switch
                      id="payout-notifications"
                      checked={preferences.payoutNotifications}
                      onCheckedChange={(checked) => updatePreferences({ payoutNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="member-updates">Member Updates</Label>
                    <Switch
                      id="member-updates"
                      checked={preferences.memberUpdates}
                      onCheckedChange={(checked) => updatePreferences({ memberUpdates: checked })}
                    />
                  </div>

                  <Button
                    onClick={subscribeToPushNotifications}
                    className="w-full"
                    variant="outline"
                  >
                    Enable Push Notifications
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-0">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No notifications yet</p>
                    <p className="text-sm">You'll see updates about your circles here</p>
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          notification.isRead ? 'opacity-60' : ''
                        } ${getNotificationColor(notification.type)}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              notification.isRead ? 'text-gray-600' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                              </span>
                              {notification.circleName && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.circleName}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
