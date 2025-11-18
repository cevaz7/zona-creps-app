// utils/sendWhatsAppFree.ts

export const formatPhoneEcuador = (phone: string): string => {
  let clean = phone.replace(/[\s\-\(\)\+]/g, "");

  if (clean.startsWith("0")) clean = clean.substring(1);

  if (!clean.startsWith("593")) clean = "593" + clean;

  return clean;
};

export const generateWhatsAppAdminMessage = (
  orderData: any,
  orderId: string,
  customerPhone: string
): string => {
  const adminPhone = "593999931458";
  const business = "Zona Creps";

  const orderNumber = orderId.slice(-8);
  const customerPhoneFormatted = formatPhoneEcuador(customerPhone);

  const products = orderData.items
    .map(
      (item: any) =>
        `• ${item.quantity}x ${item.name} - $${(
          item.totalPrice ||
          item.quantity * item.price
        ).toFixed(2)}`
    )
    .join("\n");

  const message = `🆕 *NUEVO PEDIDO - ${business}*

📦 *Pedido:* #${orderNumber}
👤 *Cliente:* ${orderData.customerName}
📞 *Teléfono:* ${customerPhoneFormatted}

🍽️ *Productos:*
${products}

💰 *TOTAL:* $${orderData.total.toFixed(2)}
💳 *Pago:* ${orderData.paymentMethod}

📌 *Notas:* ${orderData.notes || "Ninguna"}

📍 El cliente mandará la ubicación por WhatsApp.`;

  const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
  return url;
};

/**
 *  🔥 Esta función solo genera la URL.
 *     Quien debe abrirla es el componente con window.open()
 *     (desde un onClick para evitar bloqueos).
 */
export const sendWhatsAppFree = (
  orderData: any,
  orderId: string,
  customerPhone: string
): string => {
  return generateWhatsAppAdminMessage(orderData, orderId, customerPhone);
};
