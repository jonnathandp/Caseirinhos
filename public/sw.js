// Service Worker para notificações push
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'Seu pedido foi atualizado!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Pedido',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/favicon.ico'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Caseirinhos - Atualização do Pedido', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  
  if (event.action === 'explore') {
    // Open the tracking page
    event.waitUntil(
      clients.openWindow('/acompanhar')
    )
  }
})

// Install service worker
self.addEventListener('install', function(event) {
  console.log('Service Worker instalado')
  self.skipWaiting()
})

// Activate service worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker ativado')
  event.waitUntil(self.clients.claim())
})