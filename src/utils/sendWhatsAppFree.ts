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

// 🔥 FUNCIÓN MEJORADA: Primero intenta abrir automáticamente SIN mostrar mensajes
const openWhatsAppSilent = (url: string): boolean => {
  try {
    console.log('🔄 Intentando abrir WhatsApp silenciosamente...');
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      console.log('❌ Bloqueado en primer intento');
      return false;
    }
    
    console.log('✅ Abierto exitosamente en primer intento');
    return true;
  } catch (error) {
    return false;
  }
};

// 🔥 FUNCIÓN QUE SOLO SE ACTIVA SI EL PRIMER INTENTO FALLA
const handleWhatsAppBlocked = async (customerUrl: string, adminUrl: string, isSamePerson: boolean, orderData: any): Promise<boolean> => {
  return new Promise(async (resolve) => {
    const paymentMethodText = orderData.paymentMethod === 'Transferencia' 
      ? '📎 Debes enviar el COMPROBANTE DE PAGO'
      : '🗺️ Debes enviar tu UBICACIÓN EXACTA';

    // 🔥 PRIMERO: Dar instrucciones para desbloquear
    const userChoice = confirm(
      `📱 **WHATSAAP BLOQUEADO - ${orderData.paymentMethod.toUpperCase()}**\n\n` +
      `${paymentMethodText} por WhatsApp para completar tu pedido.\n\n` +
      `El navegador está bloqueando la apertura automática.\n\n` +
      `¿Quieres ver instrucciones para desbloquearlo?`
    );

    if (userChoice) {
      // 🔥 MOSTRAR INSTRUCCIONES DE DESBLOQUEO
      confirm(
        `🔓 **INSTRUCCIONES PARA DESBLOQUEAR WHATSAPP**\n\n` +
        `📱 **EN CELULAR:**\n` +
        `1. Toca los 3 puntos ⋮ arriba\n` +
        `2. Ve a "Configuración del sitio"\n` +
        `3. Activa "Ventanas emergentes"\n\n` +
        `💻 **EN COMPUTADORA:**\n` +
        `1. Haz clic en el 🔒 candado en la barra de URL\n` +
        `2. Selecciona "Permitir ventanas emergentes"\n\n` +
        `Después de configurar, pulsa "Aceptar" para reintentar.`
      );

      // 🔥 REINTENTAR DESPUÉS DE INSTRUCCIONES
      console.log('🔄 Reintentando después de instrucciones...');
      
      let retrySuccess = false;
      if (isSamePerson) {
        retrySuccess = openWhatsAppSilent(adminUrl);
      } else {
        retrySuccess = openWhatsAppSilent(customerUrl);
        if (retrySuccess) {
          setTimeout(() => openWhatsAppSilent(adminUrl), 1000);
        }
      }

      // 🔥 SI EL REINTENTO FUNCIONA, TERMINAR AQUÍ
      if (retrySuccess) {
        console.log('✅ Reintento exitoso después de instrucciones');
        alert('¡Perfecto! WhatsApp se abrió correctamente. 🎉\n\nEnvía la información requerida para completar tu pedido.');
        resolve(true);
        return;
      }
    }

    // 🔥 SI LLEGAMOS AQUÍ, ES PORQUE SIGUE BLOQUEADO - OBLIGAR COPIAR ENLACES
    console.log('❌ WhatsApp sigue bloqueado, forzando copia manual');
    
    let resolved = false;
    while (!resolved) {
      const copyChoice = confirm(
        `📋 **COPIA MANUALMENTE - ES NECESARIO**\n\n` +
        `Para completar tu pedido necesitas:\n\n` +
        `• ${orderData.paymentMethod === 'Transferencia' ? 'Enviar comprobante de pago' : 'Enviar ubicación exacta'}\n\n` +
        `¿Quieres copiar los enlaces de WhatsApp?`
      );

      if (copyChoice) {
        if (!isSamePerson) {
          const clientSuccess = await copyToClipboard(customerUrl);
          if (clientSuccess) {
            alert('✅ **ENLACE DEL CLIENTE COPIADO**\n\n📱 Pégalo en tu navegador para enviar instrucciones al cliente.');
          }
        }

        const adminSuccess = await copyToClipboard(adminUrl);
        if (adminSuccess) {
          alert('✅ **ENLACE DEL ADMIN COPIADO**\n\n📱 Pégalo en tu navegador para recibir la notificación.');
          resolved = true;
        }
      } else {
        // 🔥 OBLIGAR A RESOLVER
        const forceResolve = confirm(
          `🚨 **PEDIDO INCOMPLETO**\n\n` +
          `Sin WhatsApp no podemos procesar tu pedido.\n\n` +
          `¿Estás seguro de que quieres continuar SIN enviar la información requerida?`
        );

        if (!forceResolve) {
          continue; // Volver a mostrar opciones
        } else {
          alert('⚠️ Pedido guardado pero INCOMPLETO.\n\nContacta manualmente para completarlo.');
          resolved = true;
        }
      }
    }

    resolve(true);
  });
};

export const sendWhatsAppFree = async (
  orderData: any, 
  orderId: string, 
  customerPhone?: string
): Promise<boolean> => {
  try {
    const { adminPhone, businessName, bankDetails, deliveryMessage } = WHATSAPP_CONFIG;
    
    if (!adminPhone || adminPhone === '593987654321') {
      alert('Por favor, configura tu número de WhatsApp en el sistema');
      return false;
    }

    if (!customerPhone) {
      alert('❌ Se necesita el número de WhatsApp del cliente');
      return false;
    }

    const formattedAdminPhone = formatPhoneForWhatsApp(adminPhone);
    const formattedCustomerPhone = formatPhoneForWhatsApp(customerPhone);
    const isSamePerson = formattedAdminPhone === formattedCustomerPhone;

    // Preparar mensajes
    const itemDetails = orderData.items?.map((item: any) => 
      `• ${item.quantity}x ${item.name} - $${(item.totalPrice || item.price * item.quantity).toFixed(2)}`
    ).join('\n') || '• Productos varios';

    const orderNumber = orderId.slice(-8);

    // Mensaje para ADMIN
    const adminMessage = `🆕 *NUEVO PEDIDO - ${businessName.toUpperCase()}* 🎉

📦 *Pedido:* #${orderNumber}
👤 *Cliente:* ${orderData.customerName}
📞 *Teléfono:* ${formattedCustomerPhone}

🍽️ *PRODUCTOS:*
${itemDetails}

💰 *TOTAL: $${orderData.total?.toFixed(2)}*

💳 *MÉTODO DE PAGO:* ${orderData.paymentMethod}

${orderData.paymentMethod === 'Transferencia' ? 
`✅ Pedir comprobante al cliente` : 
`🗺️ Cliente debe enviar ubicación exacta`}

📍 *NOTAS:* ${orderData.notes || 'Ninguna'}`;

    // Mensaje para CLIENTE
    let customerMessage = '';
    if (orderData.paymentMethod === 'Transferencia') {
      customerMessage = `¡Hola ${orderData.customerName}! 👋

Tu pedido en *${businessName}* 🎉

📦 *Pedido:* #${orderNumber}
🍽️ *Productos:*
${itemDetails}

💰 *Total:* $${orderData.total?.toFixed(2)}

💳 *Transferencia a:*
🏦 ${bankDetails.bank}
👤 ${bankDetails.holder}
📊 ${bankDetails.account}
🔖 ${bankDetails.alias}

📎 Envía el comprobante por este chat`;
    } else {
      customerMessage = `¡Hola ${orderData.customerName}! 👋

Tu pedido en *${businessName}* 🎉

📦 *Pedido:* #${orderNumber}
🍽️ *Productos:*
${itemDetails}

💰 *Total:* $${orderData.total?.toFixed(2)}

🗺️ *Envía tu UBICACIÓN EXACTA:*
1. 📍 Toca el clip 📎 
2. 🗺️ Selecciona "Ubicación"
3. 📌 Envía ubicación en tiempo real

${deliveryMessage}`;
    }

    const adminWhatsAppUrl = `https://wa.me/${formattedAdminPhone}?text=${encodeURIComponent(adminMessage)}`;
    const customerWhatsAppUrl = `https://wa.me/${formattedCustomerPhone}?text=${encodeURIComponent(customerMessage)}`;

    // 🔥 ESTRATEGIA MEJORADA:
    // 1. PRIMERO: Intentar abrir SILENCIOSAMENTE
    console.log('🚀 Intento silencioso de apertura...');
    
    let firstTrySuccess = false;
    if (isSamePerson) {
      firstTrySuccess = openWhatsAppSilent(adminWhatsAppUrl);
    } else {
      firstTrySuccess = openWhatsAppSilent(customerWhatsAppUrl);
      if (firstTrySuccess) {
        setTimeout(() => openWhatsAppSilent(adminWhatsAppUrl), 1000);
      }
    }

    // 2. SOLO SI FALLA EL PRIMER INTENTO, MOSTRAR MENSAJES
    if (!firstTrySuccess) {
      console.log('❌ Primer intento fallido, mostrando ayuda...');
      await handleWhatsAppBlocked(customerWhatsAppUrl, adminWhatsAppUrl, isSamePerson, {
        ...orderData,
        orderId: orderNumber
      });
    } else {
      console.log('✅ WhatsApp abierto automáticamente sin mensajes');
      // 🔥 MENSAJE POSITIVO SI SE ABRIÓ CORRECTAMENTE
      setTimeout(() => {
        alert(`✅ WhatsApp abierto\n\n${
          orderData.paymentMethod === 'Transferencia' 
            ? '📎 El cliente debe enviar el comprobante' 
            : '🗺️ El cliente debe enviar la ubicación'
        }`);
      }, 2000);
    }

    return true;

  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error al procesar WhatsApp. Contacta al administrador.');
    return false;
  }
};