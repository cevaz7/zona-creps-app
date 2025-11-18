// src/components/CartPanel.tsx
"use client";

import { useCart } from "@/context/CartContext";
import { sendFCMPushDirect } from "@/utils/sendFCMPush";
import { useState } from "react";
import Image from "next/image";
import { getAuth } from 'firebase/auth';
import { sendWhatsAppFree } from '@/utils/sendWhatsAppFree';

export default function CartPanel() {
  const { isCartOpen, closeCart, cartItems, removeFromCart, cartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFinalizeOrder = async () => {
    try {
      setIsProcessing(true);
      
      if (cartItems.length === 0) {
        alert('🛒 El carrito está vacío');
        return;
      }

      // 🔥 OBTENER USUARIO DE FIREBASE AUTH
      const auth = getAuth();
      const user = auth.currentUser;
      const userName = user?.displayName || user?.email?.split('@')[0] || 'Cliente';
      const userEmail = user?.email || '';

      // 🔥 CAPTURAR DATOS ADICIONALES DEL PEDIDO
      let customerName = userName;
      let customerPhone = '';
      let paymentMethod = '';
      let customerNotes = '';

      // Solicitar nombre (puede editar el que viene de Firebase)
      const nameInput = prompt('👤 ¿Nombre del cliente?', customerName);
      if (nameInput) {
        customerName = nameInput;
      } else if (!nameInput && customerName === 'Cliente') {
        alert('❌ Se requiere el nombre del cliente');
        return;
      }

      // 🔥 TELÉFONO OBLIGATORIO
      customerPhone = prompt('📞 ¿Número de WhatsApp del cliente? (OBLIGATORIO para enviar instrucciones)') || '';
      
      if (!customerPhone) {
        alert('❌ El número de WhatsApp es OBLIGATORIO para enviar instrucciones de entrega');
        return;
      }

      // Validar formato básico de teléfono
      const cleanPhone = customerPhone.replace(/\s+/g, '').replace('+', '');
      if (cleanPhone.length < 10) {
        alert('❌ Número de WhatsApp inválido. Debe tener al menos 10 dígitos');
        return;
      }

      // 🔥 MÉTODO DE PAGO
      const paymentInput = prompt(
        `💳 Método de pago para ${customerName}:\n\n1. Transferencia Bancaria\n2. Efectivo\n\nEscribe "1" o "2":`
      );

      if (paymentInput === '1') {
        paymentMethod = 'Transferencia';
      } else if (paymentInput === '2') {
        paymentMethod = 'Efectivo';
      } else {
        alert('❌ Método de pago no válido');
        return;
      }

      // 🔥 NOTAS OPCIONALES
      customerNotes = prompt('📝 ¿Alguna nota especial para el pedido? (opcional)') || '';

      // 🔥 GENERAR ORDER_ID ÚNICO (USAR ESTE MISMO EN AMBOS LUGARES)
      const orderId = 'order-' + Date.now();

      // Preparar datos del pedido
      const orderData = {
        items: cartItems.map(item => ({
          name: item.product.nombre,
          quantity: item.quantity,
          price: item.product.precioBase,
          totalPrice: item.totalPrice,
          selectedOptions: item.selectedOptions,
          productId: item.product.id
        })),
        total: cartTotal,
        customerName: customerName,
        customerEmail: userEmail,
        customerId: user?.uid || '',
        paymentMethod: paymentMethod,
        customerPhone: cleanPhone,
        notes: customerNotes,
        status: 'pending'
      };

      console.log('🟡 Procesando pedido...', orderId);

      // 📱 ENVIAR WHATSAPP PRIMERO (con el mismo orderId)
      console.log('📱 Enviando notificación por WhatsApp...');
      const whatsappSuccess = await sendWhatsAppFree(orderData, orderId, cleanPhone);
      
      if (!whatsappSuccess) {
        alert('⚠️ Error al preparar WhatsApp. Verifica la configuración.');
        return;
      }

      // 💾 GUARDAR EN FIRESTORE (pasar el mismo orderId)
      console.log('💾 Guardando pedido en base de datos...');
      await sendFCMPushDirect(orderData, orderId);

      console.log('🟢 ÉXITO - Limpiando carrito...');
      clearCart();
      closeCart();
      
      // 🔥 MENSAJES SEPARADOS: Admin vs Cliente
      if (user?.uid) {
        // 🔥 SOLO PARA ADMIN - Mostrar detalles del pedido
        const successMessage = paymentMethod === 'Transferencia' 
          ? `✅ Pedido #${orderId.slice(-8)} realizado para ${customerName}\n\n📱 Se enviaron los datos de transferencia al cliente. Solicita el comprobante.`
          : `✅ Pedido #${orderId.slice(-8)} realizado para ${customerName}\n\n📱 Se solicitó la ubicación al cliente. Recuerda cobrar $${cartTotal.toFixed(2)} en efectivo.`;
        
        alert(successMessage);
      } else {
        // 🔥 PARA CLIENTE - Mensaje genérico y amigable
        const clientMessage = `¡Gracias por tu pedido ${customerName}! 🎉\n\nHemos recibido tu orden y te contactaremos pronto por WhatsApp.`;
        alert(clientMessage);
      }
      
    } catch (error) {
      console.error('❌ ERROR en handleFinalizeOrder:', error);
      alert('❌ Error al procesar el pedido. Por favor, intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isCartOpen) return null;

  console.log('🔴 CartPanel renderizado, items:', cartItems.length);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Fondo Oscuro */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" 
        onClick={closeCart}
      ></div>

      {/* Panel Deslizable */}
      <div className="relative z-10 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header del Panel */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="font-display text-2xl font-bold text-brand-brown">Tu Pedido</h2>
          <button onClick={closeCart} className="text-gray-500 text-2xl font-bold">&times;</button>
        </div>

        {/* Lista de Items */}
        {cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
            <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="font-semibold text-gray-700">Tu carrito está vacío</p>
            <p className="text-gray-500 text-sm">Añade algunos postres deliciosos para empezar.</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex gap-4">
                <Image 
                  src={item.product.imagenUrl} 
                  alt={item.product.nombre} 
                  width={80} 
                  height={80} 
                  className="rounded-lg object-cover" 
                />
                <div className="flex-grow">
                  <h4 className="font-bold text-gray-800">{item.product.nombre}</h4>
                  <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                  {/* Mostrar opciones seleccionadas si las hay */}
                  {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {Object.entries(item.selectedOptions).map(([key, value]) => (
                        <div key={key}>{key}: {String(value)}</div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs hover:underline">
                    Eliminar
                  </button>
                </div>
                <p className="font-bold text-gray-800">${item.totalPrice.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer del Panel */}
        <div className="p-6 border-t mt-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-lg text-gray-700">Subtotal</span>
            <span className="font-bold text-2xl text-brand-blue">${cartTotal.toFixed(2)}</span>
          </div>
          
          {/* Información adicional sobre el proceso */}
          {cartItems.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 text-center">
                📱 Al finalizar, se abrirá WhatsApp para confirmar el pedido
              </p>
            </div>
          )}
          
          {/* BOTÓN ACTUALIZADO */}
          <button
            onClick={handleFinalizeOrder}
            disabled={cartItems.length === 0 || isProcessing}
            className={`w-full text-center bg-brand-red text-white font-bold py-3 rounded-full ${
              cartItems.length === 0 || isProcessing 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-red-700'
            } transition-colors`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Procesando...
              </div>
            ) : (
              'Finalizar Pedido'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}