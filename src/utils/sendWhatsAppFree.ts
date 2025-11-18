// utils/sendWhatsAppFree.ts

/**
 * Limpia y normaliza un número ecuatoriano a formato WhatsApp internacional.
 */
export const formatPhoneEcuador = (phone: string): string => {
  let clean = phone.replace(/[\s\-\(\)\+]/g, "");

  // Si empieza con 0 → removerlo
  if (clean.startsWith("0")) clean = clean.substring(1);

  // Agregar prefijo 593 si no lo tiene
  if (!clean.startsWith("593")) clean = "593" + clean;

  return clean;
};

/**
 * 🔥 Genera EL MENSAJE QUE EL CLIENTE RECIBE
 * Contiene todo: pedido, transferencia, instrucciones de ubicación, etc.
 */
export const generateWhatsAppClientToAdminMessage = (
  orderData: any,
  orderId: string
): string => {
  const adminPhone = "593999931458"; // número del negocio
  const business = "Zona Creps";

  const orderNumber = orderId.slice(-8);

  // Lista de productos
  const productsList = orderData.items
    .map(
      (item: any) =>
        `• ${item.quantity}x ${item.name} - $${(
          item.totalPrice ||
          item.quantity * item.price
        ).toFixed(2)}`
    )
    .join("\n");

  const name = orderData.customerName;
  const total = orderData.total.toFixed(2);

  const message = `¡Hola ${name}! 👋

Tu pedido en *${business}* ha sido recibido 🎉

📦 *Pedido:* #${orderNumber}

🍽 *Productos:*
${productsList}

💰 *Total a pagar:* $${total}

💳 *Para confirmar tu pedido, realiza la transferencia a:*
🏦 Banco: Pichincha
👤 Titular: Zona Creps
📊 Cuenta: 1234567890
🔖 Alias: zona.creps
💵 Monto: $${total}

📎 *Envía el comprobante de pago por este mismo chat*

📍 *Por favor envía tu ubicación para el delivery:*
1️⃣ Toca el icono de 📎 (clip)  
2️⃣ Elige “Ubicación”  
3️⃣ Selecciona “Ubicación actual”  

🚗 *Delivery gratuito* en un radio de 5 km  
⏰ Tu pedido estará listo en *20-30 minutos*

¡Gracias por tu compra! 🎉`;

  // URL final de WhatsApp
  const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;

  return url;
};

/**
 * 🔥 Retorna la URL para abrir WhatsApp
 * NO abre la ventana — eso lo hace CartPanel
 */
export const sendWhatsAppFree = (
  orderData: any,
  orderId: string
): string => {
  return generateWhatsAppClientToAdminMessage(orderData, orderId);
};
