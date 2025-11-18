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

// 🔥 FUNCIÓN PARA COPIAR AL PORTAPAPELES
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores más antiguos
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
    console.error('Error al copiar:', error);
    return false;
  }
};

// 🔥 FUNCIÓN PARA ABRIR WHATSAPP Y DETECTAR SI FUE BLOQUEADO
const openWhatsAppWithDetection = (url: string, target: string = '_blank'): boolean => {
  try {
    console.log('🔄 Intentando abrir WhatsApp...');
    
    // Método 1: Intentar con window.open
    const newWindow = window.open(url, target);
    
    // Verificar si fue bloqueado
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      console.log('❌ WhatsApp bloqueado por el navegador');
      return false;
    }
    
    // Esperar un momento y verificar si la ventana sigue abierta
    setTimeout(() => {
      try {
        if (newWindow.closed) {
          console.log('❌ Ventana cerrada inmediatamente');
        }
      } catch (error) {
        console.log('❌ No se puede verificar el estado de la ventana');
      }
    }, 500);
    
    console.log('✅ WhatsApp abierto exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error al abrir WhatsApp:', error);
    return false;
  }
};

// 🔥 FUNCIÓN PARA MOSTRAR OPCIONES MANUALES SOLO SI FALLA LA APERTURA AUTOMÁTICA
const showManualOptionsIfNeeded = async (customerUrl: string, adminUrl: string, isSamePerson: boolean): Promise<boolean> => {
  return new Promise(async (resolve) => {
    // Preparar mensaje según el modo
    const message = isSamePerson 
      ? `🔧 **WHATSAPP BLOQUEADO - MODO PRUEBA**\n\nEl navegador bloqueó la apertura automática de WhatsApp.\n\n¿Quieres copiar los enlaces manualmente?`
      : `📱 **WHATSAPP BLOQUEADO**\n\nEl navegador bloqueó la apertura automática de WhatsApp.\n\n¿Quieres copiar los enlaces manualmente?`;

    const userWantsManual = confirm(message);

    if (userWantsManual) {
      console.log('📋 Usuario eligió opciones manuales');
      
      let copiedAny = false;
      
      if (!isSamePerson) {
        // 🔥 COPIAR ENLACE DEL CLIENTE
        const copyClient = confirm(
          `📱 **ENLACE PARA EL CLIENTE**\n\n` +
          `Copia este enlace y ábrelo en tu navegador:\n\n` +
          `${customerUrl}\n\n` +
          `¿Quieres copiar este enlace al portapapeles?`
        );
        
        if (copyClient) {
          const success = await copyToClipboard(customerUrl);
          if (success) {
            alert('✅ Enlace del cliente COPIADO\n\nPégalo en tu navegador para abrir WhatsApp.');
            copiedAny = true;
          } else {
            alert('❌ No se pudo copiar. Aquí está el enlace:\n\n' + customerUrl);
          }
        }
      }
      
      // 🔥 COPIAR ENLACE DEL ADMIN
      const copyAdmin = confirm(
        `👑 **ENLACE PARA EL ADMINISTRADOR**\n\n` +
        `Copia este enlace y ábrelo en tu navegador:\n\n` +
        `${adminUrl}\n\n` +
        `¿Quieres copiar este enlace al portapapeles?`
      );
      
      if (copyAdmin) {
        const success = await copyToClipboard(adminUrl);
        if (success) {
          alert('✅ Enlace del administrador COPIADO\n\nPégalo en tu navegador para abrir WhatsApp.');
          copiedAny = true;
        } else {
          alert('❌ No se pudo copiar. Aquí está el enlace:\n\n' + adminUrl);
        }
      }
      
      if (!copiedAny) {
        // 🔥 MOSTRAR TODOS LOS ENLACES
        alert(
          `📋 **ENLACES DE WHATSAPP**\n\n` +
          `${!isSamePerson ? `**PARA EL CLIENTE:**\n${customerUrl}\n\n` : ''}` +
          `**PARA EL ADMINISTRADOR:**\n${adminUrl}\n\n` +
          `Copia y pega estos enlaces en tu navegador.`
        );
      }
    } else {
      console.log('❌ Usuario rechazó opciones manuales');
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
    const isSamePerson = formattedAdminPhone === formattedCustomerPhone;
    console.log('👤 Mismo admin y cliente?:', isSamePerson);

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

    // 🔗 GENERAR ENLACES DE WHATSAPP
    const adminWhatsAppUrl = `https://wa.me/${formattedAdminPhone}?text=${encodeURIComponent(adminMessage)}`;
    const customerWhatsAppUrl = `https://wa.me/${formattedCustomerPhone}?text=${encodeURIComponent(customerMessage)}`;

    console.log('📱 WhatsApp Admin:', adminWhatsAppUrl);
    console.log('📱 WhatsApp Cliente:', customerWhatsAppUrl);

    // 🔥 PRIMERO INTENTAR APERTURA AUTOMÁTICA
    console.log('🚀 Intentando apertura automática de WhatsApp...');
    
    let autoOpenSuccess = false;
    
    if (isSamePerson) {
      // 🔧 MODO PRUEBA: Solo abrir admin
      autoOpenSuccess = openWhatsAppWithDetection(adminWhatsAppUrl);
    } else {
      // 🚀 MODO REAL: Abrir cliente primero
      const clientSuccess = openWhatsAppWithDetection(customerWhatsAppUrl);
      
      // Esperar un poco y abrir admin
      setTimeout(() => {
        const adminSuccess = openWhatsAppWithDetection(adminWhatsAppUrl, '_blank');
        if (!adminSuccess) {
          console.log('❌ No se pudo abrir WhatsApp para admin');
        }
      }, 1000);
      
      autoOpenSuccess = clientSuccess;
    }

    // 🔥 SOLO SI FALLA LA APERTURA AUTOMÁTICA, MOSTRAR OPCIONES MANUALES
    if (!autoOpenSuccess) {
      console.log('❌ Apertura automática fallida, mostrando opciones manuales...');
      await showManualOptionsIfNeeded(customerWhatsAppUrl, adminWhatsAppUrl, isSamePerson);
    } else {
      console.log('✅ Apertura automática exitosa');
    }

    return true;

  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error);
    
    // 🔥 FALLBACK EN CASO DE ERROR
    alert(
      '❌ Error al preparar WhatsApp\n\n' +
      'Por favor, contacta al administrador o intenta realizar el pedido nuevamente.'
    );
    
    return false;
  }
};