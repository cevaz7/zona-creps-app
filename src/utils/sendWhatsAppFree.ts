// utils/sendWhatsAppFree.ts

export const formatPhoneEcuador = (phone: string): string => {
  let clean = phone.replace(/[\s\-\(\)\+]/g, "");
  if (clean.startsWith("0")) clean = clean.substring(1);
  if (!clean.startsWith("593")) clean = "593" + clean;
  return clean;
};

export const generateWhatsAppClientToAdminMessage = (
  orderData: any,
  orderId: string
): string => {

  const adminPhone = "593999931458";
  const business = "Zona Creps";

  const orderNumber = orderId.slice(-8);
  const name = orderData.customerName;
  const total = orderData.total.toFixed(2);

  const productsList = orderData.items
    .map(
      (item: any) =>
        `• ${item.quantity}x ${item.name} - $${(
          item.totalPrice ||
          item.quantity * item.price
        ).toFixed(2)}`
    )
    .join("\n");

  const paymentMethod = orderData.paymentMethod;

  // -------------------------------
  // 🔥 SECCIÓN DE PAGO SEGÚN OPCIÓN
  // -------------------------------
  let paymentSection = "";

  if (paymentMethod === "Transferencia") {
    paymentSection = `💳 *Forma de pago:* Transferencia

🏦 Banco: Pichincha  
👤 Titular: Zona Creps  
📊 Cuenta: 1234567890  
🔖 Alias: zona.creps  
💵 Monto: $${total}

📎 *Envía el comprobante de pago por este mismo chat*`;
  }

  if (paymentMethod === "Efectivo") {
    paymentSection = `💵 *Forma de pago:* Efectivo  
Pagarás en efectivo *al recibir tu pedido*.`;
  }

  // -------------------------------
  // 🔥 MENSAJE FINAL
  // -------------------------------
  const message = `¡Hola ${name}! 👋

Tu pedido en *${business}* ha sido recibido 🎉

📦 *Pedido:* #${orderNumber}

🍽 *Productos:*
${productsList}

💰 *Total a pagar:* $${total}

${paymentSection}

📍 *Por favor envía tu ubicación para el delivery:*
1. Toca el icono de 📎  
2. Elige “Ubicación”  
3. Selecciona “Ubicación actual”

🚗 Delivery gratuito en 5 km  
⏰ Tu pedido estará listo en *20-30 minutos*

¡Gracias por tu compra! 🎉`;

  return `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
};

export const sendWhatsAppFree = (orderData: any, orderId: string): string => {
  return generateWhatsAppClientToAdminMessage(orderData, orderId);
};
