// utils/sendNotification.ts - VERSIÓN QUE SÍ LLAMA A FCM
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { sendFCMPushDirect } from './sendFCMPush'; // ← Asegúrate que este import sea correcto

export const sendNewOrderNotification = async (orderData: any) => {
  try {
    console.log('🔄 Creando pedido y notificaciones...');

    // 1. Guardar el pedido en Firestore
    const orderRef = doc(collection(db, 'orders'));
    const orderId = orderRef.id;
    
    const completeOrderData = {
      ...orderData,
      id: orderId,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    await setDoc(orderRef, completeOrderData);
    console.log('✅ Pedido guardado en Firestore:', orderId);

    // 2. Crear notificación en Firestore (para el panel admin)
    const notificationRef = doc(collection(db, 'notifications'));
    
    const itemNames = orderData.items?.map((item: any) => 
      `${item.quantity}x ${item.name}`
    ).join(', ') || 'productos';

    await setDoc(notificationRef, {
      title: '¡Nuevo Pedido! 🎉',
      body: `Pedido #${orderId.substring(0, 8)} - ${itemNames} - Total: $${orderData.total?.toFixed(2) || '0.00'}`,
      type: 'new_order',
      orderId: orderId,
      total: orderData.total || 0,
      itemsCount: orderData.items?.length || 0,
      read: false,
      createdAt: serverTimestamp(),
      sentTo: 'admin'
    });

    console.log('✅ Notificación en Firestore creada');

    // 3. 🔥🔥🔥 LLAMAR REALMENTE A LA FUNCIÓN FCM
    console.log('🚀 Llamando a sendFCMPushDirect...');
    await sendFCMPushDirect(orderData, orderId);
    console.log('✅ sendFCMPushDirect completado');
    
    console.log('✅ Flujo completado - Notificaciones enviadas a administradores');
    return true;
    
  } catch (error) {
    console.error('❌ Error en el flujo de notificaciones:', error);
    return false;
  }
};