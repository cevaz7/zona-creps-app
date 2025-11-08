// public/firebase-messaging-sw.js - VERSIÓN CORREGIDA
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

console.log('🔧 Service Worker profesional iniciado');

// 🆕 REGISTRAR EVENT HANDLERS INMEDIATAMENTE (no dentro de message)
self.addEventListener('push', (event) => {
  console.log('📨 Evento push nativo recibido');
  
  let title = '¡Zona Creps! 🎉';
  let body = 'Tienes un nuevo pedido';
  
  if (event.data) {
    try {
      const textData = event.data.text();
      console.log('Datos push como texto:', textData);
      
      try {
        const payload = JSON.parse(textData);
        console.log('Datos push como JSON:', payload);
        
        if (payload.notification) {
          title = payload.notification.title || title;
          body = payload.notification.body || body;
        }
      } catch (jsonError) {
        body = textData || body;
      }
    } catch (e) {
      console.log('No se pudieron leer los datos push');
    }
  }
  
  const options = {
    body: body,
    requireInteraction: true
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('✅ Notificación mostrada'))
      .catch(error => console.log('❌ Error:', error))
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notificación clickeada');
  event.notification.close();
  event.waitUntil(clients.openWindow('/admin'));
});

// 🆕 MANEJADOR para subscription change (requerido por Firebase)
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('🔄 Push subscription changed');
});

let firebaseApp = null;

// CONFIGURACIÓN DE FIREBASE (esto puede venir después)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CONFIGURAR_FIREBASE') {
    try {
      firebaseApp = firebase.initializeApp(event.data.config);
      console.log('✅ Firebase configurado profesionalmente');
      
      const messaging = firebase.messaging();
      
      messaging.onBackgroundMessage((payload) => {
        console.log('📦 Mensaje background Firebase:', payload);
        self.registration.showNotification(
          payload.notification?.title || '¡Zona Creps!',
          {
            body: payload.notification?.body || 'Nueva notificación',
            requireInteraction: true
          }
        ).catch(error => console.log('Error Firebase notificación:', error));
      });
      
    } catch (error) {
      console.error('❌ Error configurando Firebase:', error);
    }
  }
});