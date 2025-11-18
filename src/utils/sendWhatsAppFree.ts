// utils/sendWhatsAppFree.ts
import { openMultipleWhatsApp } from './whatsappOpener';

interface WhatsAppConfig {
  adminPhone: string;
  businessName: string;
  bankDetails: {
    bank: string;
    holder: string;
    account: string;
    alias: string;
  };
  deliveryMessage: string;
}

// 🔥 CONFIGURACIÓN CORREGIDA - FORMATO WHATSAPP
export const WHATSAPP_CONFIG: WhatsAppConfig = {
  adminPhone: '593999931458', // MANTÉN ESTE FORMATO: código país + número completo
  businessName: 'Zona Creps',
  bankDetails: {
    bank: 'Pichincha',
    holder: 'Zona Creps',
    account: '1234567890',
    alias: 'zona.creps'
  },
  deliveryMessage: '🚗 Ofrecemos delivery gratuito en un radio de 5km'
};

// 🔥 FUNCIÓN PARA FORMATEAR NÚMEROS CORRECTAMENTE
const formatPhoneForWhatsApp = (phone: string): string => {
  // Eliminar espacios, guiones, paréntesis, etc.
  let cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Si el número empieza con 0, quitarlo (para Ecuador)
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }
  
  // Si no tiene código de país, agregar 593 (Ecuador)
  if (!cleanPhone.startsWith('593') && cleanPhone.length === 9) {
    cleanPhone = '593' + cleanPhone;
  }
  
  console.log('📞 Teléfono formateado:', phone, '→', cleanPhone);
  return cleanPhone;
};

// 🔥 DETECTAR SI ES MODO PRUEBA (mismo admin y cliente)
const isTestMode = (adminPhone: string, customerPhone: string): boolean => {
  return adminPhone === customerPhone;
};

export const sendWhatsAppFree = async (
  orderData: any, 
  orderId: string, 
  customerPhone?: string
): Promise<boolean> => {
  try {
    const { adminPhone, businessName, bankDetails, deliveryMessage } = WHATSAPP_CONFIG;
    
    // Validar número de admin
    if (!adminPhone || adminPhone === '593987654321') {
      console.warn('⚠️ Configura tu número en WHATSAPP_CONFIG');
      alert('Por favor, configura tu número de WhatsApp en el sistema');
      return false;
    }

    if (!customerPhone) {
      alert('❌ Se necesita el número de WhatsApp del cliente para enviar la ubicación');
      return false;
    }

    // 🔥 FORMATEAR NÚMEROS CORRECTAMENTE
    const formattedAdminPhone = formatPhoneForWhatsApp(adminPhone);
    const formattedCustomerPhone = formatPhoneForWhatsApp(customerPhone);

    console.log('📞 Admin:', formattedAdminPhone);
    console.log('📞 Cliente:', formattedCustomerPhone);

    // 🔥 DETECTAR MODO PRUEBA
    const testMode = isTestMode(formattedAdminPhone, formattedCustomerPhone);
    console.log('🔧 Modo prueba:', testMode);

    // Preparar detalles de productos
    const itemDetails = orderData.items?.map((item: any) => 
      `• ${item.quantity}x ${item.name} - $${(item.totalPrice || item.price * item.quantity).toFixed(2)}`
    ).join('\n') || '• Productos varios';

    const orderNumber = orderId.slice(-8);
    const orderTime = new Date().toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // 🎯 MENSAJE PARA EL ADMINISTRADOR
    const adminMessage = `🆕 *NUEVO PEDIDO - ${businessName.toUpperCase()}* 🎉

📦 *Pedido:* #${orderNumber}
👤 *Cliente:* ${orderData.customerName || 'Cliente'}
📞 *Teléfono:* ${formattedCustomerPhone}
⏰ *Fecha/Hora:* ${orderTime}

🍽️ *PRODUCTOS:*
${itemDetails}

💰 *TOTAL: $${orderData.total?.toFixed(2) || '0.00'}*

💳 *MÉTODO DE PAGO:* ${orderData.paymentMethod || 'Por confirmar'}

${orderData.paymentMethod === 'Transferencia' ? 
`🏦 *PAGO POR TRANSFERENCIA*
El cliente recibió los datos bancarios

✅ *Pedir comprobante al cliente*` : 
`💵 *PAGO EN EFECTIVO*
El cliente debe enviar su ubicación exacta

💰 *COBRAR: $${orderData.total?.toFixed(2) || '0.00'}*`}

📍 *NOTAS:* ${orderData.notes || 'Ninguna'}

📱 *Contactar al cliente:* https://wa.me/${formattedCustomerPhone}`;

    // 🎯 MENSAJE PARA EL CLIENTE (SEGÚN MÉTODO DE PAGO)
    let customerMessage = '';

    if (orderData.paymentMethod === 'Transferencia') {
      customerMessage = `¡Hola ${orderData.customerName}! 👋

Tu pedido en *${businessName}* ha sido recibido 🎉

📦 *Pedido:* #${orderNumber}
🍽️ *Productos:*
${itemDetails}

💰 *Total a pagar:* $${orderData.total?.toFixed(2) || '0.00'}

💳 *Para confirmar tu pedido, realiza la transferencia a:*
🏦 Banco: ${bankDetails.bank}
👤 Titular: ${bankDetails.holder}
📊 Cuenta: ${bankDetails.account}
🔖 Alias: ${bankDetails.alias}
💵 Monto: $${orderData.total?.toFixed(2) || '0.00'}

📎 *Envía el comprobante de pago por este mismo chat*

${deliveryMessage}

⏰ *Tu pedido estará listo en aproximadamente 20-30 minutos*

¡Gracias por tu compra! 🎉`;
    } else {
      // 🗺️ MENSAJE PARA EFECTIVO - SOLICITANDO UBICACIÓN
      customerMessage = `¡Hola ${orderData.customerName}! 👋

Tu pedido en *${businessName}* ha sido recibido 🎉

📦 *Pedido:* #${orderNumber}
🍽️ *Productos:*
${itemDetails}

💰 *Total a pagar:* $${orderData.total?.toFixed(2) || '0.00'}

💵 *MÉTODO DE PAGO: EFECTIVO*

🗺️ *¡IMPORTANTE! Para la entrega necesitamos tu UBICACIÓN EXACTA:*

1. 📍 Haz clic en el *clip* 📎 de WhatsApp
2. 🗺️ Selecciona *"Ubicación"*
3. 📌 Envía tu *ubicación en tiempo real*
4. 🏠 O marca tu *ubicación exacta* en el mapa

${deliveryMessage}

⏰ *Tu pedido estará listo en aproximadamente 20-30 minutos*

¡Gracias por tu compra! 🎉`;
    }

    // 🔥 USAR LA SOLUCIÓN UNIVERSAL CON WHATSAPPOPENER
    console.log('📱 Usando WhatsAppOpener universal...');

    const chatsToOpen = [
      { phone: formattedCustomerPhone, message: customerMessage },
      { phone: formattedAdminPhone, message: adminMessage }
    ];

    // 🔥 ESTRATEGIA DIFERENCIADA: MODO PRUEBA vs MODO REAL
    if (testMode) {
      console.log('🔧 MODO PRUEBA: Admin y cliente son la misma persona');
      
      // En modo prueba, abrir solo UNA ventana con mensaje combinado
      const testMessage = `🔧 *MODO PRUEBA - ${businessName}*\n\n` +
        `Estás probando el sistema como ADMIN y CLIENTE\n\n` +
        `📦 Pedido: #${orderNumber}\n` +
        `👤 Cliente: ${orderData.customerName}\n` +
        `💰 Total: $${orderData.total?.toFixed(2)}\n` +
        `💳 Método: ${orderData.paymentMethod}\n` +
        `📍 Notas: ${orderData.notes || 'Prueba del sistema'}\n\n` +
        `✅ En un pedido real:\n` +
        `• Cliente recibiría: ${orderData.paymentMethod === 'Transferencia' ? 'datos bancarios' : 'solicitud de ubicación'}\n` +
        `• Admin recibiría: notificación completa del pedido`;

      const testChat = [{ phone: formattedAdminPhone, message: testMessage }];
      return openMultipleWhatsApp(testChat);
      
    } else {
      console.log('🚀 MODO REAL: Cliente diferente al admin');
      
      // 🚀 MODO REAL - Usar la solución universal
      const success = openMultipleWhatsApp(chatsToOpen);

      if (!success) {
        console.error('❌ No se pudo abrir WhatsApp automáticamente');
        
        // 🔥 FALLBACK: Mostrar enlaces manuales
        const fallbackMessage = `📱 Para completar tu pedido:\n\n` +
          `1. CLIENTE: ${customerMessage.substring(0, 100)}...\n` +
          `   Enlace: https://wa.me/${formattedCustomerPhone}?text=${encodeURIComponent(customerMessage)}\n\n` +
          `2. ADMIN: ${adminMessage.substring(0, 100)}...\n` +
          `   Enlace: https://wa.me/${formattedAdminPhone}?text=${encodeURIComponent(adminMessage)}`;
        
        alert(fallbackMessage);
      }

      return success;
    }

  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error);
    alert('Error al preparar WhatsApp. Por favor, contacta al administrador.');
    return false;
  }
};