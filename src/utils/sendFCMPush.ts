import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { sendEmailNotification } from './sendEmailNotification'; // 🔥 NUEVA IMPORTACIÓN

const broadcastChannel = typeof window !== 'undefined' 
  ? new BroadcastChannel('admin_notifications')
  : null;

export const sendFCMPushDirect = async (orderData: any, orderId: string) => {
  try {
    console.log('📦 Procesando notificación para pedido:', orderId.substring(0, 8));

    // 1. Obtener tokens de admins
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const adminUserIds = new Set();

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.role === 'admin') {
        adminUserIds.add(doc.id);
      }
    });

    const tokensSnapshot = await getDocs(collection(db, 'adminTokens'));
    const adminTokens: string[] = [];

    tokensSnapshot.forEach((doc) => {
      const tokenData = doc.data();
      if (tokenData.token && tokenData.userId && adminUserIds.has(tokenData.userId)) {
        adminTokens.push(tokenData.token);
      }
    });

    console.log(`👑 ${adminTokens.length} admin(s) conectados`);

    // 2. Preparar notificación
    const itemNames = orderData.items?.map((item: any) => 
      `${item.quantity}x ${item.name}`
    ).join(', ') || 'productos';

    const notificationData = {
      title: '¡Nuevo Pedido! 🎉',
      body: `Pedido #${orderId.substring(0, 8)} - ${itemNames} - Total: $${orderData.total?.toFixed(2) || '0.00'}`,
      orderId: orderId,
      total: orderData.total || 0,
      itemsCount: orderData.items?.length || 0,
      timestamp: new Date().toISOString()
    };

    // 3. Enviar notificación en tiempo real
    if (adminTokens.length > 0 && broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'NEW_ORDER',
        data: notificationData
      });
      console.log('✅ Notificación enviada a panel admin');
    }

    // 🔥 NUEVO: ENVIAR NOTIFICACIÓN POR EMAIL
    console.log('📧 Enviando notificación por email...');
    await sendEmailNotification(orderData, orderId);

  } catch (error) {
    console.error('❌ Error en notificación:', error);
  }
};

// Función para pruebas
export const testAdminNotification = () => {
  const testData = {
    title: '¡TEST Notificación! 🧪',
    body: 'Esta es una notificación de prueba',
    orderId: 'test-' + Date.now(),
    total: 99.99,
    itemsCount: 3,
    timestamp: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    const broadcastChannel = new BroadcastChannel('admin_notifications');
    broadcastChannel.postMessage({
      type: 'NEW_ORDER',
      data: testData
    });
    console.log('🧪 Notificación de prueba enviada');
  }
};