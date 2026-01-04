'use client'

import { useNotification } from '@/contexts/NotificationContext'

export const useToast = () => {
  const { showNotification } = useNotification()

  return {
    success: (title: string, message?: string) => {
      showNotification({
        type: 'success',
        title,
        message,
        duration: 4000
      })
    },

    error: (title: string, message?: string) => {
      showNotification({
        type: 'error',
        title,
        message,
        duration: 6000
      })
    },

    warning: (title: string, message?: string) => {
      showNotification({
        type: 'warning',
        title,
        message,
        duration: 5000
      })
    },

    info: (title: string, message?: string) => {
      showNotification({
        type: 'info',
        title,
        message,
        duration: 4000
      })
    },

    custom: (notification: {
      type: 'success' | 'error' | 'warning' | 'info'
      title: string
      message?: string
      duration?: number
    }) => {
      showNotification(notification)
    }
  }
}

export default useToast