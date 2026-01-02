'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'

interface NotificationManagerProps {
  onPermissionChange?: (permission: NotificationPermission) => void
}

export default function NotificationManager({ onPermissionChange }: NotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
      
      // Mostrar prompt se for a primeira vez
      if (Notification.permission === 'default') {
        const hasAsked = localStorage.getItem('notification-asked')
        if (!hasAsked) {
          setTimeout(() => setShowPrompt(true), 2000) // Mostrar após 2 segundos
        }
      }
    }
  }, [])

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
      setShowPrompt(false)
      localStorage.setItem('notification-asked', 'true')
      
      if (result === 'granted') {
        // Mostrar notificação de teste
        new Notification('🔔 Notificações ativadas!', {
          body: 'Você receberá atualizações sobre seus pedidos.',
          icon: '/favicon.ico'
        })
      }
      
      onPermissionChange?.(result)
    }
  }

  const dismissPrompt = () => {
    setShowPrompt(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('notification-asked', 'true')
    }
  }

  if (typeof window === 'undefined' || !('Notification' in window) || permission === 'granted' || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">
              Quer receber notificações?
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Receba atualizações sobre o status dos seus pedidos
            </p>
            <div className="flex gap-2">
              <button
                onClick={requestPermission}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Permitir
              </button>
              <button
                onClick={dismissPrompt}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
          <button
            onClick={dismissPrompt}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}