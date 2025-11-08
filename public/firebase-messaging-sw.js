// public/firebase-messaging-sw.js - VERSIÓN MEJORADA
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

console.log('🔧 Service Worker profesional iniciado');

let firebaseApp = null;

// CONFIGURACIÓN SEGURA DESDE LA APP
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CONFIGURAR_FIREBASE') {
    try {
      firebaseApp = firebase.initializeApp(event.data.config);
      console.log('✅ Firebase configurado profesionalmente');
      
      // Configurar mensajería de Firebase
      const messaging = firebase.messaging();
      
      // Manejar mensajes en segundo plano de Firebase
      messaging.onBackgroundMessage((payload) => {
        console.log('📦 Mensaje background Firebase:', payload);
        showNotification(
          payload.notification?.title || '¡Zona Creps!',
          payload.notification?.body || 'Nueva notificación',
          payload.notification?.image
        );
      });
      
    } catch (error) {
      console.error('❌ Error configurando Firebase:', error);
    }
  }
});

// MANEJADOR DE PUSH NATIVO CON MANEJO DE ERRORES
self.addEventListener('push', (event) => {
  console.log('📨 Evento push nativo recibido');
  
  let title = '¡Zona Creps! 🎉';
  let body = 'Tienes un nuevo pedido';
  let icon = '/badge/badge-72x72.svg';
  
  // Procesar datos del push
   if (event.data) {
    try {
      // Primero intentar como texto
      const textData = event.data.text();
      console.log('Datos push como texto:', textData);
      
      // Luego intentar parsear como JSON
      try {
        const payload = JSON.parse(textData);
        console.log('Datos push como JSON:', payload);
        
        if (payload.notification) {
          title = payload.notification.title || title;
          body = payload.notification.body || body;
        } else if (payload.title || payload.body) {
          title = payload.title || title;
          body = payload.body || body;
        }
      } catch (jsonError) {
        // Si no es JSON, usar el texto como body
        body = textData || body;
        console.log('Usando datos como texto plano');
      }
    } catch (e) {
      console.log('No se pudieron leer los datos push');
    }
  }
  
  const options = {
    body: body,
    
    requireInteraction: true
  };
  
  // 🆕 CON MANEJO DE ERRORES PROFESIONAL
  const showNotif = self.registration.showNotification(title, options)
    .then(() => {
      console.log('✅ Notificación mostrada exitosamente');
    })
    .catch(error => {
      console.log('❌ Error mostrando notificación:', error);
      // En producción, este error no debería ocurrir
    });
  
  event.waitUntil(showNotif);
});

// MANEJAR CLICS EN NOTIFICACIONES
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notificación clickeada');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/admin')
  );
});

// MANEJAR CIERRE DE NOTIFICACIONES
self.addEventListener('notificationclose', (event) => {
  console.log('📪 Notificación cerrada');
});

// 🆕 FUNCIÓN AUXILIAR PARA MOSTRAR NOTIFICACIONES
function showNotification(title, body, image) {
  const options = {
    body: body,
    icon: '/badge/badge-72x72.svg',
    badge: '/badge/badge-72x72.svg',
    image: image,
    requireInteraction: true
  };
  
  return self.registration.showNotification(title, options)
    .then(() => console.log('✅ Notificación mostrada profesionalmente'))
    .catch(error => console.error('❌ Error mostrando notificación:', error));
}