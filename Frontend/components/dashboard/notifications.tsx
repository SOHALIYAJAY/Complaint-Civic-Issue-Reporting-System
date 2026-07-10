'use client'

import { Bell, AlertTriangle, CheckCircle, MessageSquare, Zap } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'assigned' | 'resolved' | 'escalation' | 'remarks'
  timestamp: string
  read: boolean
  icon: React.ReactNode
  bgColor: string
  borderColor: string
}

export default function NotificationsPanel() {
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Complaint Assigned',
      message: 'CMP-2024-001 has been assigned to Officer Sharma',
      type: 'assigned',
      timestamp: '2 hours ago',
      read: false,
      icon: <Zap className="w-5 h-5" />,
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
    },
    {
      id: '2',
      title: 'Complaint Resolved',
      message: 'CMP-2024-003 has been successfully resolved',
      type: 'resolved',
      timestamp: '5 hours ago',
      read: false,
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      id: '3',
      title: 'Escalation Alert',
      message: 'CMP-2024-002 SLA deadline is approaching',
      type: 'escalation',
      timestamp: '1 day ago',
      read: true,
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
    {
      id: '4',
      title: 'Officer Remarks',
      message: 'Officer has added remarks to CMP-2024-001',
      type: 'remarks',
      timestamp: '1 day ago',
      read: true,
      icon: <MessageSquare className="w-5 h-5" />,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
  ]

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Notifications</h2>
        <div className="relative">
          <Bell className="w-6 h-6 text-primary cursor-pointer hover:scale-110 transition-transform" />
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            2
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`glass-effect rounded-lg border ${notification.borderColor} p-4 transition-all duration-300 hover:shadow-lg ${
              !notification.read ? 'border-l-4 border-l-accent' : ''
            }`}
          >
            <div className="flex gap-4">
              <div className={`${notification.bgColor} rounded-lg p-3 flex-shrink-0 flex items-center justify-center h-fit`}>
                <div className="text-primary">{notification.icon}</div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{notification.title}</h3>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                <p className="text-xs text-muted-foreground/70 mt-2">{notification.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>


    </section>
  )
}
