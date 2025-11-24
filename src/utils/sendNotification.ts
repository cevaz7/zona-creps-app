// utils/sendNotification.ts
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { sendFCMPushDirect } from './sendFCMPush'; 

export const sendNewOrderNotification = async (orderData: any) => {
  try {
    

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

    

    // 3. LLAMAR REALMENTE A LA FUNCIÓN FCM
    
    await sendFCMPushDirect(orderData, orderId);
    
    
    
    return true;
    
  } catch (error) {
    
    return false;
  }
};