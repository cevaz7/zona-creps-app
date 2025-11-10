// utils/sendFCMPush.ts - VERSIÓN SIN ICONOS
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
        // icon: '/icon-192x192.png' ← Eliminar esta línea temporalmente
      });
    }

    console.log('✅ Notificaciones FCM enviadas');

  } catch (error) {
    console.error('❌ Error enviando FCM:', error);
  }
};

// Función para enviar a FCM desde el frontend
const sendToFCM = async (token: string, notification: any) => {
  try {
    // EN DESARROLLO: Simular envío
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] FCM a: ${token.substring(0, 20)}...`, notification);
      
      // Mostrar notificación local en desarrollo
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          // icon: notification.icon ← Eliminar temporalmente
        });
      }
      return;
    }

    // EN PRODUCCIÓN: Necesitarías un backend simple o seguir con notificaciones locales
    console.log(`[PROD] Simulando FCM a: ${token.substring(0, 20)}...`);
    
  } catch (error) {
    console.error('Error en sendToFCM:', error);
  }
};