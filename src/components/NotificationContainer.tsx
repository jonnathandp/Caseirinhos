'use client'

import { useEffect, useState } from 'react'
import { useNotification } from '@/contexts/NotificationContext'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

interface NotificationCardProps {
  notification: {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
  }
  onClose: () => void
}

function NotificationCard({ notification, onClose }: NotificationCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getColors = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200'
        }
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-200'
        }
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200'
        }
    }
  }

  const colors = getColors()

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
        ${colors.bg} ${colors.border} ${colors.text}
        border rounded-lg shadow-lg p-4 max-w-sm w-full
        backdrop-blur-sm
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">
            {notification.title}
          </div>
          {notification.message && (
            <div className="text-xs mt-1 opacity-80">
              {notification.message}
            </div>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className={`
            flex-shrink-0 ml-auto pl-3 opacity-60 hover:opacity-100
            transition-opacity duration-200
          `}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Progress bar para mostrar tempo restante */}
      {notification.duration && notification.duration > 0 && (
        <div className="mt-3 bg-black/10 dark:bg-white/10 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-current opacity-30 rounded-full transition-all ease-linear"
            style={{
              animation: `shrink ${notification.duration}ms linear forwards`
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}