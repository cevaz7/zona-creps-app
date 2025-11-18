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

// 🔥 FUNCIÓN MEJORADA PARA ABRIR WHATSAPP
const openWhatsApp = (url: string, target: string = '_blank'): boolean => {
  try {
    console.log('📱 Intentando abrir WhatsApp...');
    
    // Método 1: window.open normal
    const newWindow = window.open(url, target);
    
    // Verificar si fue bloqueado
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      console.log('❌ WhatsApp bloqueado por popup blocker');
      return false;
    }
    
    // Verificar después de un tiempo si la ventana sigue abierta
    setTimeout(() => {
      try {
        if (newWindow.closed) {
          console.log('❌ Ventana cerrada inmediatamente');
        }
      } catch (e) {
        console.log('❌ No se puede verificar estado de ventana');
      }
    }, 500);
    
    console.log('✅ WhatsApp abierto exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error al abrir WhatsApp:', error);
    return false;
  }
};

// 🔥 FUNCIÓN PRINCIPAL MEJORADA
const openWhatsAppWithInstructions = async (customerUrl: string, adminUrl: string): Promise<boolean> => {
  console.log('🎯 Iniciando proceso de WhatsApp...');
  
  // 1. PRIMERO: Intentar abrir automáticamente para CLIENTE
  console.log('📱 Abriendo WhatsApp para CLIENTE...');
  let clientOpened = openWhatsApp(customerUrl);
  
  if (clientOpened) {
    console.log('✅ WhatsApp cliente abierto automáticamente');
    
    // 2. LUEGO: Abrir para ADMIN con delay
    setTimeout(() => {
      console.log('👑 Abriendo WhatsApp para ADMIN...');
      const adminOpened = openWhatsApp(adminUrl, '_blank');
      
      if (!adminOpened) {
        console.log('❌ WhatsApp admin bloqueado');
        // Mostrar instrucciones solo para admin
        setTimeout(() => {
          showAdminInstructions(adminUrl);
        }, 1000);
      }
    }, 1500);
    
    return true;
  }
  
  // 3. SI FALLA: Mostrar instrucciones completas
  console.log('❌ WhatsApp bloqueado, mostrando instrucciones...');
  return await showCompleteInstructions(customerUrl, adminUrl);
};

// 🔥 FUNCIÓN PARA MOSTRAR INSTRUCCIONES COMPLETAS
const showCompleteInstructions = async (customerUrl: string, adminUrl: string): Promise<boolean> => {
  const userChoice = confirm(
    `📱 **WHATSAAP BLOQUEADO**\n\n` +
    `El navegador está bloqueando la apertura automática.\n\n` +
    `¿Quieres ver INSTRUCCIONES para desbloquear o COPIAR los enlaces manualmente?\n\n` +
    `• "Aceptar" = Ver INSTRUCCIONES de desbloqueo\n` +
    `• "Cancelar" = COPIAR enlaces manualmente`
  );
  
  if (userChoice) {
    // 🔥 OPCIÓN 1: MOSTRAR INSTRUCCIONES DE DESBLOQUEO
    return await showUnlockInstructions(customerUrl, adminUrl);
  } else {
    // 🔥 OPCIÓN 2: COPIAR ENLACES MANUALMENTE
    return await copyLinksManually(customerUrl, adminUrl);
  }
};

// 🔥 FUNCIÓN PARA MOSTRAR INSTRUCCIONES DE DESBLOQUEO
const showUnlockInstructions = async (customerUrl: string, adminUrl: string): Promise<boolean> => {
  const instructionsConfirmed = confirm(
    `🔓 **INSTRUCCIONES PARA DESBLOQUEAR WHATSAPP**\n\n` +
    `📱 **EN CELULAR:**\n` +
    `1. Toca los 3 puntos ⋮ (menú)\n` +
    `2. Ve a "Configuración del sitio" o "Site settings"\n` +
    `3. Busca "Ventanas emergentes" o "Pop-ups"\n` +
    `4. Activa para este sitio web\n\n` +
    `💻 **EN COMPUTADORA:**\n` +
    `1. Haz clic en el 🔒 candado en la barra de URL\n` +
    `2. Busca "Ventanas emergentes" o "Pop-ups"\n` +
    `3. Cambia a "Permitir"\n` +
    `4. Recarga la página\n\n` +
    `¿Quieres que reintentemos abrir WhatsApp?`
  );
  
  if (instructionsConfirmed) {
    console.log('🔄 Reintentando después de instrucciones...');
    
    // Reintentar después de instrucciones
    const retryClient = openWhatsApp(customerUrl);
    
    if (retryClient) {
      console.log('✅ Reintento exitoso para cliente');
      setTimeout(() => {
        openWhatsApp(adminUrl, '_blank');
      }, 1500);
      return true;
    } else {
      console.log('❌ Reintento fallido');
      alert('⚠️ Sigue bloqueado. Debes configurar los permisos en tu navegador.');
      return await copyLinksManually(customerUrl, adminUrl);
    }
  }
  
  return false;
};

// 🔥 FUNCIÓN PARA COPIAR ENLACES MANUALMENTE
const copyLinksManually = async (customerUrl: string, adminUrl: string): Promise<boolean> => {
  console.log('📋 Mostrando opciones de copia manual...');
  
  let copiedAny = false;
  
  // Copiar enlace del CLIENTE
  const copyClient = confirm(
    `📱 **COPIAR ENLACE PARA CLIENTE**\n\n` +
    `Este enlace enviará las instrucciones al CLIENTE:\n\n` +
    `¿Quieres copiarlo al portapapeles?`
  );
  
  if (copyClient) {
    const success = await copyToClipboard(customerUrl);
    if (success) {
      alert('✅ **Enlace del CLIENTE COPIADO**\n\n📱 Pégalo en tu navegador para enviar instrucciones al cliente.');
      copiedAny = true;
    } else {
      alert(`📋 Enlace CLIENTE manual:\n\n${customerUrl}`);
      copiedAny = true;
    }
  }
  
  // Copiar enlace del ADMIN
  const copyAdmin = confirm(
    `👑 **COPIAR ENLACE PARA ADMIN**\n\n` +
    `Este enlace enviará la notificación a TI (ADMIN):\n\n` +
    `¿Quieres copiarlo al portapapeles?`
  );
  
  if (copyAdmin) {
    const success = await copyToClipboard(adminUrl);
    if (success) {
      alert('✅ **Enlace del ADMIN COPIADO**\n\n📱 Pégalo para recibir la notificación del pedido.');
      copiedAny = true;
    } else {
      alert(`📋 Enlace ADMIN manual:\n\n${adminUrl}`);
      copiedAny = true;
    }
  }
  
  if (!copiedAny) {
    alert(
      `📋 **ENLACES DE WHATSAPP**\n\n` +
      `**PARA EL CLIENTE:**\n${customerUrl}\n\n` +
      `**PARA EL ADMIN:**\n${adminUrl}\n\n` +
      `Copia y pega estos enlaces manualmente.`
    );
  }
  
  return true;
};

// 🔥 FUNCIÓN PARA INSTRUCCIONES SOLO DEL ADMIN
const showAdminInstructions = async (adminUrl: string): Promise<void> => {
  const copyAdmin = confirm(
    `👑 **NO SE PUDO ABRIR WHATSAPP PARA ADMIN**\n\n` +
    `¿Quieres copiar el enlace manualmente para recibir la notificación?`
  );
  
  if (copyAdmin) {
    const success = await copyToClipboard(adminUrl);
    if (success) {
      alert('✅ Enlace del ADMIN COPIADO');
    } else {
      alert(`📋 Enlace ADMIN manual:\n\n${adminUrl}`);
    }
  }
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

    // 🔥 MENSAJE PARA EL CLIENTE - va al NÚMERO DEL CLIENTE
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

    // 🔥 MENSAJE PARA EL ADMIN - va a TU NÚMERO (593999931458)
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

    // 🔥 GENERAR URLs CORRECTAS
    const adminWhatsAppUrl = `https://wa.me/${formattedAdminPhone}?text=${encodeURIComponent(adminMessage)}`;
    const customerWhatsAppUrl = `https://wa.me/${formattedCustomerPhone}?text=${encodeURIComponent(customerMessage)}`;

    console.log('📱 URL Admin (para 593999931458):', adminWhatsAppUrl);
    console.log('📱 URL Cliente (para el cliente):', customerWhatsAppUrl);

    // 🔥 EJECUTAR PROCESO MEJORADO
    const success = await openWhatsAppWithInstructions(customerWhatsAppUrl, adminWhatsAppUrl);
    return success;

  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error al procesar WhatsApp. Intenta nuevamente.');
    return false;
  }
};