// utils/sendNotification.ts
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const sendNewOrderNotification = async (orderData: any) => {
  try {
    console.log('🔄 Procesando pedido...', orderData);

    // 1. Primero guardar el PEDIDO en Firestore
    const orderRef = doc(collection(db, 'orders'));
    const orderId = orderRef.id;
    
    const completeOrderData = {
      ...orderData,
      id: orderId, // Agregar el ID generado
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    await setDoc(orderRef, completeOrderData);
    console.log('✅ Pedido guardado en Firestore:', orderId);

    // 2. Luego crear la NOTIFICACIÓN
    const notificationRef = doc(collection(db, 'notifications'));
    
    // Mejorar el mensaje de la notificación
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

    console.log('✅ Notificación de nuevo pedido enviada');
    return true; // Importante: retornar éxito
    
  } catch (error) {
    console.error('❌ Error enviando notificación:', error);
    return false; // Retornar fallo
  }
};