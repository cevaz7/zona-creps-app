// public/firebase-messaging-sw.js - VERSIÓN COMPATIBLE CON EDGE
console.log('🔧 Service Worker iniciado - Versión Edge compatible');

// 🆕 CONFIGURACIÓN MÍNIMA PARA EDGE
try {
  importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');
  console.log('✅ Firebase scripts cargados en SW');
} catch (error) {
  console.error('❌ Error cargando Firebase en SW:', error);
}

// 🆕 MANEJADORES BÁSICOS QUE FUNCIONAN EN EDGE
self.addEventListener('install', (event) => {
  console.log('⚡ Service Worker instalado');
  self.skipWaiting(); // 🆕 Importante para Edge
});

self.addEventListener('activate', (event) => {
  console.log('🎯 Service Worker activado');
  event.waitUntil(self.clients.claim()); // 🆕 Tomar control inmediato
});

// 🆕 CONFIGURACIÓN DIFERIDA PARA EDGE
let messaging = null;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    console.log('🔧 Recibiendo configuración Firebase...');
    
    try {
      if (typeof firebase !== 'undefined') {
        firebase.initializeApp(event.data.config);
        messaging = firebase.messaging();
        console.log('✅ Firebase configurado en SW');
        
        // 🆕 MANEJADOR DE MENSAJES EN BACKGROUND
        messaging.onBackgroundMessage((payload) => {
          console.log('📦 Mensaje background recibido:', payload);
          
          const notificationTitle = payload.notification?.title || '¡Zona Creps!';
          const notificationOptions = {
            body: payload.notification?.body || 'Nueva notificación',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            requireInteraction: true
          };

          return self.registration.showNotification(notificationTitle, notificationOptions);
        });
      }
    } catch (error) {
      console.error('❌ Error configurando Firebase en SW:', error);
    }
  }
});

// 🆕 MANEJADOR DE PUSH BÁSICO (fallback para Edge)
self.addEventListener('push', (event) => {
  console.log('📨 Evento push recibido');
  
  let title = '¡Zona Creps! 🎉';
  let body = 'Tienes un nuevo pedido';
  
  try {
    if (event.data) {
      const data = event.data.json();
      if (data.notification) {
        title = data.notification.title || title;
        body = data.notification.body || body;
      }
    }
  } catch (error) {
    console.log('📨 Datos push no JSON, usando valores por defecto');
  }
  
  const options = {
    body: body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    requireInteraction: true
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notificación clickeada');
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/admin');
      }
    })
  );
});