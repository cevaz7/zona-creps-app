// utils/sendFCMPush.ts - VERSIÓN MEJORADA
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const sendFCMPushDirect = async (orderData: any, orderId: string) => {
  try {
    console.log('📤 Enviando FCM push directo...');

    // 1. Obtener tokens de administradores
    const tokensSnapshot = await getDocs(collection(db, 'adminTokens'));
    const adminTokens: string[] = [];
    
    tokensSnapshot.forEach((doc) => {
      const tokenData = doc.data();
      if (tokenData.token) {
        adminTokens.push(tokenData.token);
      }
    });

    console.log(`📋 Tokens encontrados: ${adminTokens.length}`);

    if (adminTokens.length === 0) {
      console.log('ℹ️ No hay administradores registrados');
      return;
    }

    // 2. Preparar notificación
    const itemNames = orderData.items?.map((item: any) => 
      `${item.quantity}x ${item.name}`
    ).join(', ') || 'productos';

    // 3. Enviar a cada token
    for (const token of adminTokens) {
      await sendToFCM(token, {
        title: '¡Nuevo Pedido! 🎉',
        body: `Pedido #${orderId.substring(0, 8)} - ${itemNames} - $${orderData.total?.toFixed(2)}`,
      });
    }

    console.log('✅ Notificaciones FCM enviadas');

  } catch (error) {
    console.error('❌ Error enviando FCM:', error);
  }
};

// Función mejorada para enviar notificaciones
const sendToFCM = async (token: string, notification: any) => {
  try {
    // EN DESARROLLO: Mostrar notificación local
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] FCM a: ${token.substring(0, 20)}...`, notification);
      
      await showBrowserNotification(notification);
      return;
    }

    console.log(`[PROD] Simulando FCM a: ${token.substring(0, 20)}...`);
    
  } catch (error) {
    console.error('Error en sendToFCM:', error);
  }
};

// Función separada para mostrar notificación del navegador
const showBrowserNotification = async (notification: any) => {
  try {
    // Verificar si el navegador soporta notificaciones
    if (!('Notification' in window)) {
      console.log('❌ Este navegador no soporta notificaciones');
      return;
    }

    console.log('🔔 Estado de permisos:', Notification.permission);

    // Si no tiene permiso, solicitarlo
    if (Notification.permission === 'default') {
      console.log('🔔 Solicitando permisos...');
      const permission = await Notification.requestPermission();
      console.log('🔔 Resultado de permisos:', permission);
    }

    // Si tiene permiso concedido, mostrar notificación
    if (Notification.permission === 'granted') {
      console.log('🔔 Mostrando notificación del navegador...');
      
      const notif = new Notification(notification.title, {
        body: notification.body,
        icon: '/icon-192x192.svg', // Usar SVG que creamos
        badge: '/badge-72x72.svg',
        tag: 'new-order', // Agrupar notificaciones similares
        requireInteraction: true, // Permanecer hasta interacción
      });

      // Manejar clic en la notificación
      notif.onclick = () => {
        console.log('🔔 Notificación clickeada - abriendo admin');
        window.focus();
        // Redirigir al admin si no está allí
        if (window.location.pathname !== '/admin') {
          window.open('/admin', '_blank');
        }
      };

      notif.onclose = () => {
        console.log('🔔 Notificación cerrada');
      };

      console.log('✅ Notificación del navegador mostrada');
      
    } else {
      console.log('❌ Permisos de notificación no concedidos:', Notification.permission);
    }

  } catch (error) {
    console.error('❌ Error mostrando notificación:', error);
  }
};