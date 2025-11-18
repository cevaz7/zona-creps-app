// utils/whatsappOpener.ts

export const openWhatsAppUniversal = (phone: string, message: string): boolean => {
  try {
    const formattedPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    console.log('📱 Intentando abrir WhatsApp:', formattedPhone);
    
    // 🔥 ESTRATEGIA 1: Intentar con window.open primero
    const newWindow = window.open(whatsappUrl, '_blank');
    
    // 🔥 ESTRATEGIA 2: Si falla, usar método para móviles
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      console.log('⚠️ window.open falló, usando método móvil...');
      
      // Para móviles: crear un iframe temporal
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = whatsappUrl;
      document.body.appendChild(iframe);
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
      
      // 🔥 ESTRATEGIA 3: Si todo falla, mostrar enlace para copiar
      setTimeout(() => {
        if (confirm('¿No se abrió WhatsApp?\n\nPulsa "Aceptar" para copiar el enlace manualmente.')) {
          // Copiar enlace al portapapeles
          navigator.clipboard.writeText(whatsappUrl).then(() => {
            alert('✅ Enlace copiado. Pégalo en tu navegador para abrir WhatsApp.');
          }).catch(() => {
            // Fallback: mostrar enlace
            alert(`📱 Copia este enlace manualmente:\n\n${whatsappUrl}`);
          });
        }
      }, 2000);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error abriendo WhatsApp:', error);
    return false;
  }
};

/**
 * 🔥 ABRIR MÚLTIPLES CHATS DE WHATSAPP
 */
export const openMultipleWhatsApp = (chats: Array<{phone: string, message: string}>): boolean => {
  if (chats.length === 0) return false;
  
  // Abrir el primer chat inmediatamente
  openWhatsAppUniversal(chats[0].phone, chats[0].message);
  
  // Abrir los demás con delay
  if (chats.length > 1) {
    setTimeout(() => {
      openWhatsAppUniversal(chats[1].phone, chats[1].message);
    }, 1500);
  }
  
  return true;
};