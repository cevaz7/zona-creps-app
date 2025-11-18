// utils/sendWhatsAppFree.ts

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

export const WHATSAPP_CONFIG: WhatsAppConfig = {
  adminPhone: '593999931458',
  businessName: 'Zona Creps',
  bankDetails: {
    bank: 'Pichincha',
    holder: 'Zona Creps',
    account: '1234567890',
    alias: 'zona.creps'
  },
  deliveryMessage: '🚗 Ofrecemos delivery gratuito en un radio de 5km'
};

const formatPhoneForWhatsApp = (phone: string): string => {
  let cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }
  
  if (!cleanPhone.startsWith('593') && cleanPhone.length === 9) {
    cleanPhone = '593' + cleanPhone;
  }
  
  return cleanPhone;
};

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    return false;
  }
};

const openWhatsApp = (url: string): boolean => {
  try {
    console.log('📱 Abriendo WhatsApp...');
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      console.log('❌ WhatsApp bloqueado');
      return false;
    }
    
    console.log('✅ WhatsApp abierto correctamente');
    return true;
  } catch (error) {
    return false;
  }
};

// 🔥 FUNCIÓN SIMPLE CON INSTRUCCIONES PARA DESBLOQUEAR
const openWhatsAppWithInstructions = async (customerUrl: string, adminUrl: string): Promise<boolean> => {
  // 1. Primero intentar abrir automáticamente
  console.log('📱 Intentando abrir WhatsApp automáticamente...');
  const clientOpened = openWhatsApp(customerUrl);
  
  if (clientOpened) {
    // Si se abrió, esperar y abrir admin también
    setTimeout(() => {
      openWhatsApp(adminUrl);
    }, 1500);
    return true;
  }
  
  // 2. Si falla, mostrar instrucciones para desbloquear
  console.log('❌ WhatsApp bloqueado, mostrando instrucciones...');
  
  const userWantsInstructions = confirm(
    `📱 **WHATSAAP BLOQUEADO**\n\n` +
    `El navegador está bloqueando la apertura automática de WhatsApp.\n\n` +
    `¿Quieres ver instrucciones para desbloquearlo?`
  );
  
  if (userWantsInstructions) {
    // 🔥 MOSTRAR INSTRUCCIONES CLARAS
    const instructionsConfirmed = confirm(
      `🔓 **INSTRUCCIONES PARA DESBLOQUEAR WHATSAPP**\n\n` +
      `📱 **EN CELULAR:**\n` +
      `1. Toca los 3 puntos ⋮ arriba\n` +
      `2. Ve a "Configuración del sitio"\n` +
      `3. Activa "Ventanas emergentes"\n\n` +
      `💻 **EN COMPUTADORA:**\n` +
      `1. Haz clic en el 🔒 candado en la barra de URL\n` +
      `2. Selecciona "Permitir ventanas emergentes"\n` +
      `3. Recarga la página\n\n` +
      `Después de configurar, pulsa "Aceptar" para reintentar.`
    );
    
    if (instructionsConfirmed) {
      // Reintentar después de instrucciones
      const retryOpened = openWhatsApp(customerUrl);
      if (retryOpened) {
        setTimeout(() => {
          openWhatsApp(adminUrl);
        }, 1500);
        return true;
      }
    }
  }
  
  // 3. Si sigue fallando, ofrecer copiar enlaces
  const copyInstead = confirm(
    `📋 **COPIAR ENLACES MANUALMENTE**\n\n` +
    `¿Prefieres copiar los enlaces y abrirlos manualmente?`
  );
  
  if (copyInstead) {
    // Copiar enlace del cliente
    const clientCopied = await copyToClipboard(customerUrl);
    if (clientCopied) {
      alert('✅ Enlace del CLIENTE copiado\n\nPégalo en tu navegador.');
    } else {
      alert(`📋 Enlace CLIENTE manual:\n\n${customerUrl}`);
    }
    
    // Copiar enlace del admin
    const adminCopied = await copyToClipboard(adminUrl);
    if (adminCopied) {
      alert('✅ Enlace del ADMIN copiado\n\nPégalo para recibir la notificación.');
    } else {
      alert(`📋 Enlace ADMIN manual:\n\n${adminUrl}`);
    }
    
    return true;
  }
  
  return false;
};

export const sendWhatsAppFree = async (
  orderData: any, 
  orderId: string, 
  customerPhone?: string
): Promise<boolean> => {
  try {
    const { adminPhone, businessName, bankDetails, deliveryMessage } = WHATSAPP_CONFIG;
    
    if (!adminPhone || adminPhone === '593987654321') {
      alert('⚠️ Configura tu número de administrador');
      return false;
    }

    if (!customerPhone) {
      alert('❌ Se necesita el número del cliente');
      return false;
    }

    const formattedAdminPhone = formatPhoneForWhatsApp(adminPhone);
    const formattedCustomerPhone = formatPhoneForWhatsApp(customerPhone);

    console.log('📞 Admin:', formattedAdminPhone);
    console.log('📞 Cliente:', formattedCustomerPhone);

    const orderNumber = orderId.slice(-8);

    // MENSAJE PARA EL CLIENTE
    const customerMessage = `¡Hola ${orderData.customerName}! 👋

*¡Tu pedido en ${businessName} ha sido recibido!* 🎉

📦 *Pedido:* #${orderNumber}
🍽️ *Tu orden:*
${orderData.items?.map((item: any) => 
  `• ${item.quantity}x ${item.name} - $${(item.totalPrice || item.price * item.quantity).toFixed(2)}`
).join('\n')}

💰 *Total a pagar:* $${orderData.total?.toFixed(2)}

💳 *Método de pago:* ${orderData.paymentMethod}

${orderData.paymentMethod === 'Transferencia' ? 
`🏦 *Datos para transferencia:*
• Banco: ${bankDetails.bank}
• Titular: ${bankDetails.holder}  
• Cuenta: ${bankDetails.account}
• Alias: ${bankDetails.alias}
• Monto: $${orderData.total?.toFixed(2)}

📎 *Envía el COMPROBANTE de transferencia por este chat*` : 
`💵 *Pagarás en EFECTIVO al momento de la entrega*`}

🗺️ *¡UBICACIÓN REQUERIDA PARA LA ENTREGA!*

*Para entregar tu pedido necesitamos tu UBICACIÓN EXACTA:*

1. 📍 Toca el *clip* 📎 en WhatsApp
2. 🗺️ Selecciona *"Ubicación"*
3. 📌 Envía tu *ubicación en tiempo real*
4. 🏠 *O marca tu ubicación exacta* en el mapa

${deliveryMessage}

⏰ *Tu pedido estará listo en 20-30 minutos*

¡Gracias por tu compra! 🎉`;

    // MENSAJE PARA EL ADMIN
    const adminMessage = `🆕 *NUEVO PEDIDO - ${businessName.toUpperCase()}* 🎉

📦 *Pedido:* #${orderNumber}
👤 *Cliente:* ${orderData.customerName}
📞 *Teléfono:* ${formattedCustomerPhone}
⏰ *Hora:* ${new Date().toLocaleString('es-ES')}

🍽️ *Productos:*
${orderData.items?.map((item: any) => 
  `• ${item.quantity}x ${item.name} - $${(item.totalPrice || item.price * item.quantity).toFixed(2)}`
).join('\n')}

💰 *TOTAL: $${orderData.total?.toFixed(2)}*

💳 *Método de pago:* ${orderData.paymentMethod}

🔔 *ACCIONES REQUERIDAS:*
${orderData.paymentMethod === 'Transferencia' ? 
`• Solicitar COMPROBANTE de transferencia al cliente
• Confirmar ubicación de entrega` : 
`• Cobrar $${orderData.total?.toFixed(2)} en efectivo
• Confirmar ubicación de entrega`}

📍 *Notas del cliente:* ${orderData.notes || 'Ninguna'}

📱 *Contactar al cliente:* https://wa.me/${formattedCustomerPhone}`;

    const adminWhatsAppUrl = `https://wa.me/${formattedAdminPhone}?text=${encodeURIComponent(adminMessage)}`;
    const customerWhatsAppUrl = `https://wa.me/${formattedCustomerPhone}?text=${encodeURIComponent(customerMessage)}`;

    console.log('📱 URLs generadas');

    // 🔥 EJECUTAR LA FUNCIÓN SIMPLE CON INSTRUCCIONES
    const success = await openWhatsAppWithInstructions(customerWhatsAppUrl, adminWhatsAppUrl);
    return success;

  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error al procesar WhatsApp. Intenta nuevamente.');
    return false;
  }
};