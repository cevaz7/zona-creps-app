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
  adminPhone: '593999931458', // 🔥 TU NÚMERO (admin)
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

// 🔥 FUNCIÓN CORREGIDA PARA ABRIR WHATSAPP
const openWhatsApp = (url: string): boolean => {
  try {
    console.log('📱 Intentando abrir WhatsApp...');
    
    // Método mejorado: crear enlace y hacer click
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ WhatsApp abierto exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error al abrir WhatsApp:', error);
    return false;
  }
};

// 🔥 FUNCIÓN PRINCIPAL COMPLETAMENTE CORREGIDA
const openWhatsAppWithInstructions = async (adminUrl: string): Promise<boolean> => {
  console.log('🎯 Iniciando proceso de WhatsApp para ADMIN...');
  
  // 1. PRIMERO: Intentar abrir automáticamente para ADMIN
  console.log('👑 Abriendo WhatsApp para ADMIN...');
  let adminOpened = openWhatsApp(adminUrl);
  
  if (adminOpened) {
    console.log('✅ WhatsApp admin abierto automáticamente');
    return true;
  }
  
  // 2. SI FALLA: Mostrar instrucciones
  console.log('❌ WhatsApp bloqueado, mostrando instrucciones...');
  return await showUnlockInstructions(adminUrl);
};

// 🔥 FUNCIÓN PARA MOSTRAR INSTRUCCIONES
const showUnlockInstructions = async (adminUrl: string): Promise<boolean> => {
  const userChoice = confirm(
    `📱 **WHATSAAP BLOQUEADO**\n\n` +
    `No se pudo abrir WhatsApp para notificar al administrador.\n\n` +
    `¿Quieres ver INSTRUCCIONES para desbloquear?`
  );
  
  if (userChoice) {
    // 🔥 MOSTRAR INSTRUCCIONES DE DESBLOQUEO
    const instructionsConfirmed = confirm(
      `🔓 **INSTRUCCIONES PARA DESBLOQUEO**\n\n` +
      `📱 **EN CELULAR:**\n` +
      `1. Toca los 3 puntos ⋮ (menú)\n` +
      `2. Ve a "Configuración del sitio"\n` +
      `3. Activa "Ventanas emergentes"\n\n` +
      `💻 **EN COMPUTADORA:**\n` +
      `1. Haz clic en el 🔒 candado en la barra de URL\n` +
      `2. Selecciona "Permitir ventanas emergentes"\n` +
      `3. Recarga la página\n\n` +
      `¿Quieres que reintentemos abrir WhatsApp?`
    );
    
    if (instructionsConfirmed) {
      console.log('🔄 Reintentando después de instrucciones...');
      
      // Reintentar después de instrucciones
      const retryAdmin = openWhatsApp(adminUrl);
      
      if (retryAdmin) {
        console.log('✅ Reintento exitoso');
        return true;
      } else {
        console.log('❌ Reintento fallido');
        return await copyAdminLink(adminUrl);
      }
    }
  }
  
  // 3. COPIAR ENLACE DEL ADMIN
  return await copyAdminLink(adminUrl);
};

// 🔥 FUNCIÓN PARA COPIAR ENLACE DEL ADMIN
const copyAdminLink = async (adminUrl: string): Promise<boolean> => {
  const copyAdmin = confirm(
    `👑 **COPIAR ENLACE PARA ADMIN**\n\n` +
    `¿Quieres copiar el enlace para notificar manualmente al administrador?`
  );
  
  if (copyAdmin) {
    const success = await copyToClipboard(adminUrl);
    if (success) {
      alert('✅ **Enlace COPIADO**\n\nPégalo en tu navegador para notificar al administrador.');
    } else {
      alert(`📋 Enlace manual:\n\n${adminUrl}`);
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

    console.log('📞 Admin (TU NÚMERO):', formattedAdminPhone);
    console.log('📞 Cliente (SU NÚMERO):', formattedCustomerPhone);

    const orderNumber = orderId.slice(-8);

    // 🔥 SOLO UN MENSAJE: PARA EL ADMIN (no se envía nada al cliente)
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

🔔 *INSTRUCCIONES PARA EL CLIENTE:*
${orderData.paymentMethod === 'Transferencia' ? 
`• Realizar transferencia a:
  Banco: ${bankDetails.bank}
  Titular: ${bankDetails.holder}  
  Cuenta: ${bankDetails.account}
  Alias: ${bankDetails.alias}
  Monto: $${orderData.total?.toFixed(2)}
• Enviar COMPROBANTE por WhatsApp
• Enviar UBICACIÓN exacta` : 
`• Preparar $${orderData.total?.toFixed(2)} en efectivo
• Enviar UBICACIÓN exacta por WhatsApp`}

🗺️ *El cliente debe enviar su UBICACIÓN:*
1. 📍 Tocar el clip 📎 en WhatsApp
2. 🗺️ Seleccionar "Ubicación"  
3. 📌 Enviar ubicación en tiempo real

📍 *Notas del cliente:* ${orderData.notes || 'Ninguna'}

${deliveryMessage}`;

    // 🔥 SOLO UNA URL: Para el ADMIN (tu número)
    const adminWhatsAppUrl = `https://wa.me/${formattedAdminPhone}?text=${encodeURIComponent(adminMessage)}`;

    console.log('📱 URL Admin (para 593999931458):', adminWhatsAppUrl);

    // 🔥 SOLO UNA APERTURA: Para el ADMIN
    const success = await openWhatsAppWithInstructions(adminWhatsAppUrl);
    return success;

  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error al procesar WhatsApp. Intenta nuevamente.');
    return false;
  }
};