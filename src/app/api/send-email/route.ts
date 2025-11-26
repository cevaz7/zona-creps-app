import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { orderData, orderId, adminEmails } = await request.json();

    const baseUrl = process.env.NEXTAUTH_URL || 
                   process.env.VERCEL_URL || 
                   'https://zona-creps-app.vercel.app';
    
    const adminUrl = `${baseUrl}/admin`;

    //  CALCULAR PRECIOS REALES CON EXTRAS
    const formatItemsWithRealPrices = (items: any[]) => {
      return items?.map((item: any) => {
        // Usar totalPrice que incluye extras, o calcularlo
        const realPrice = item.totalPrice || (item.price * item.quantity);
        
        let itemText = `${item.quantity}x ${item.name} - $${realPrice.toFixed(2)}`;
        
        //  AGREGAR EXTRAS SI EXISTEN
        if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
          itemText += `<br><small style="color: #666; margin-left: 20px;">Extras: `;
          itemText += Object.entries(item.selectedOptions)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          itemText += `</small>`;
        }
        
        return itemText;
      }).join('') || 'productos';
    };

    const { data, error } = await resend.emails.send({
      from: 'Zonaf Creps <notificaciones@resend.dev>',
      to: adminEmails,
      subject: `🎉 Nuevo Pedido #${orderId.slice(-8)} - $${orderData.total?.toFixed(2) || '0.00'}`, // 🔥 FIX ORDER ID
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuevo Pedido - Zonaf Crep's</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f8f9fa; margin: 0; padding: 20px; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; }
            .header { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 25px; text-align: center; }
            .content { padding: 30px; line-height: 1.6; }
            .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa; }
            .product-item { padding: 8px 0; border-bottom: 1px solid #eee; }
            .extras { color: #666; font-size: 12px; margin-left: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">¡Nuevo Pedido Recibido! 🎉</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Zonaf Crep's - Sistema de Notificaciones</p>
            </div>
            
            <div class="content">
              <h2 style="color: #2c3e50; margin-bottom: 20px;">Detalles del Pedido</h2>
              
              <div class="order-details">
                <p><strong>📦 Número de Pedido:</strong> #${orderId.slice(-8)}</p> <!-- 🔥 FIX ORDER ID -->
                <p><strong>🍽️ Productos:</strong></p>
                <div style="margin-left: 20px;">
                  ${orderData.items?.map((item: any) => {
                    const realPrice = item.totalPrice || (item.price * item.quantity);
                    let itemHtml = `<div class="product-item">${item.quantity}x ${item.name} - $${realPrice.toFixed(2)}`;
                    
                    // 🔥 MOSTRAR EXTRAS SI EXISTEN
                    if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
                      itemHtml += `<div class="extras">`;
                      itemHtml += Object.entries(item.selectedOptions)
                        .map(([key, value]) => `• ${value}`)
                        .join('<br>');
                      itemHtml += `</div>`;
                    }
                    
                    itemHtml += `</div>`;
                    return itemHtml;
                  }).join('')}
                </div>
                <p><strong>💰 Total Real:</strong> $${orderData.total?.toFixed(2) || '0.00'}</p>
                <p><strong>👤 Cliente:</strong> ${orderData.customerName || 'Cliente'}</p>
                <p><strong>📅 Fecha y Hora:</strong> ${new Date().toLocaleString('es-ES')}</p>
                <p><strong>🛒 Cantidad de Items:</strong> ${orderData.items?.length || 0}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <p style="margin-bottom: 15px; color: #666;">Accede al panel de administración para gestionar este pedido:</p>
                <a href="${adminUrl}" class="button">
                  📊 Acceder al Panel Admin
                </a>
              </div>

              <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <p style="margin: 0; color: #856404;"><strong>💡 Nota:</strong> Este es un mensaje automático del sistema de notificaciones de Zona Creps. No responda a este email.</p>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">Zonaf Crep's &copy; ${new Date().getFullYear()} - Sistema de Notificaciones Automáticas</p>
              <p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">
                Si recibió este email por error, por favor ignórelo.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error en API send-email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}