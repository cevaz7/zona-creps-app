// src/components/CartPanel.tsx
"use client";

import React, { useEffect, useState } from "react";
import OrderModal from "./OrderModal";
import { useCart, CartItem } from "@/context/CartContext";
import { sendFCMPushDirect } from "@/utils/sendFCMPush";
import { sendWhatsAppFree } from "@/utils/sendWhatsAppFree";
import Image from "next/image";
import { auth } from '../../firebase/config';
import { useRouter } from 'next/navigation';

interface PendingOrder {
  url: string;
  orderData: any;
  orderId: string;
}

export default function CartPanel() {

  const router = useRouter();

  const {
    cartItems,
    isCartOpen,
    closeCart,
    openCart,
    removeFromCart,
    clearCart,
    cartTotal,
    itemCount,
  } = useCart();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pending, setPending] = useState<PendingOrder | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Evitar scroll al abrir carrito
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "unset";
  }, [isCartOpen]);

  // Helper para mostrar selectedOptions en formato legible
  const renderSelectedOptions = (selectedOptions: any) => {
    if (!selectedOptions) return null;
    
    return Object.entries(selectedOptions).map(([groupTitle, val]) => {
      if (Array.isArray(val)) {
        return (
          <div key={groupTitle} className="text-sm text-gray-600">
            <strong className="text-brand-brown">{groupTitle}: </strong>
            {val.join(", ")}
          </div>
        );
      } else {
        return (
          <div key={groupTitle} className="text-sm text-gray-600">
            <strong className="text-brand-brown">{groupTitle}: </strong>
            {String(val)}
          </div>
        );
      }
    });
  };

  // Al confirmar desde el modal
  const handleModalConfirm = async (payload: {
    name: string;
    phone: string;
    paymentMethod: "Transferencia" | "Efectivo";
    notes: string;
  }) => {
    if (cartItems.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    setIsProcessing(true);

    // Generar orderId
    const orderId = "order-" + Date.now();

    const currentUser = auth.currentUser;

    const cleanPhone = payload.phone.replace(/\D/g, '');

    // Construir orderData usando la estructura que ya usas en addToCart
    const orderData = {
      items: cartItems.map((item: CartItem) => ({
        name: item.product.nombre,
        quantity: item.quantity,
        price: item.product.precioBase,
        totalPrice: item.totalPrice,
        selectedOptions: item.selectedOptions,
        productId: item.product.id,
        imageUrl: item.product.imagenUrl // Incluir la URL de la imagen
      })),
      total: cartTotal,
      customerName: payload.name,
      customerPhone: cleanPhone,
      customerEmail: currentUser?.email || '',
      paymentMethod: payload.paymentMethod,
      notes: payload.notes,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      // sendWhatsAppFree ahora devuelve la URL (según tu util actual)
      const waUrl = await sendWhatsAppFree(orderData, orderId);

      // Intento abrir ventana (click del usuario)
      const newWin = window.open(waUrl, "_blank");

      if (!newWin || newWin.closed || typeof newWin.closed === "undefined") {
        // Bloqueado -> guardar pendiente y mostrar instrucciones breves
        setPending({ url: waUrl, orderData, orderId });

        const retry = confirm(
          "⚠️ El navegador bloqueó la apertura de WhatsApp.\n\n" +
            "📱 En celular: toca ⋮ → Configuración del sitio → Permitir ventanas emergentes.\n" +
            "💻 En PC: haz clic en el candado (🔒) → Permitir ventanas emergentes.\n\n" +
            "¿Quieres intentar abrir WhatsApp otra vez ahora?"
        );

        if (retry) {
          const reNew = window.open(waUrl, "_blank");
          if (!reNew || reNew.closed || typeof reNew.closed === "undefined") {
            alert("❌ Sigue bloqueado. Activa ventanas emergentes y presiona 'Reintentar' en el panel.");
            setIsProcessing(false);
            return;
          }
          // si abre en reintento, continuamos
        } else {
          setIsProcessing(false);
          return;
        }
      }

      // Si la ventana se abrió correctamente: guardar orden en Firestore
      await sendFCMPushDirect(orderData, orderId);

      // limpiar carrito y estados
      clearCart();
      setPending(null);
      setIsModalOpen(false);
      closeCart();

      setShowSuccessBanner(true);

      setTimeout(() => {
        router.push('/'); 
      }, 2000);

      setTimeout(() => setShowSuccessBanner(false), 6000);
    } catch (err) {
      console.error("Error al confirmar pedido:", err);
      alert("❌ Error al procesar el pedido. Revisa la consola.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reintentar apertura pendiente
  const retryPending = async () => {
    if (!pending) return alert("No hay pedido pendiente.");
    const newWin = window.open(pending.url, "_blank");
    if (!newWin || newWin.closed || typeof newWin.closed === "undefined") {
      return alert("❌ Sigue bloqueado. Activa ventanas emergentes y reintenta.");
    }
    // si abre, guardar en Firestore y limpiar
    try {
      await sendFCMPushDirect(pending.orderData, pending.orderId);
      clearCart();
      setPending(null);
      closeCart();
      alert("✅ Pedido registrado correctamente.");
    } catch (e) {
      console.error(e);
      alert("❌ Falló al guardar la orden. Revisa la consola.");
    }
  };

  // calcular unitPrice (por seguridad)
  const unitPriceOf = (item: CartItem) => {
    if (item.quantity > 0) return item.totalPrice / item.quantity;
    // fallback: producto precio base/promocional
    const promo = item.product.enPromocion && item.product.precioPromocional
      ? Number(item.product.precioPromocional)
      : Number(item.product.precioBase);
    return promo;
  };

  return (
    <>
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={async (data) => {
          await handleModalConfirm({
            name: data.name,
            phone: data.phone,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
          });
        }}
      />

      {/* overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeCart}
        />
      )}

     
      {showSuccessBanner && (
      <div className="fixed top-4 right-4 z-[10000] bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-xl shadow-2xl animate-in slide-in-from-right duration-300 max-w-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white text-green-500 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
              ✓
            </div>
            <div>
              <p className="font-bold text-sm">¡Pedido confirmado! 🎉</p>
              <p className="text-xs opacity-90">Envia tu comprobante y direccion para el envio</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowSuccessBanner(false);
              router.push('/tienda');
            }}
            className="text-white hover:text-gray-200 text-sm font-bold ml-2 shrink-0"
          >
            ×
          </button>
        </div>
      </div>
    )}

      <aside
        className={`fixed top-0 right-0 w-full sm:w-96 h-full bg-brand-cream z-50 transform transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        } shadow-2xl flex flex-col`}
      >
        {/* Header fijo - altura definida */}
        <div className="p-5 border-b flex justify-between items-center h-20 shrink-0">
          <h2 className="text-2xl font-display text-brand-brown">Tu Pedido</h2>
          <div className="flex items-center gap-3">
            {itemCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-brand-red text-white font-bold">
                {itemCount}
              </span>
            )}
            <button onClick={closeCart} className="text-2xl font-bold text-brand-brown">×</button>
          </div>
        </div>

        {/* Contenido scrollable - altura calculada */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-4">🛒</div>
                <p className="text-lg">Tu carrito está vacío</p>
              </div>
            </div>
          ) : (
            cartItems.map((item) => {
              const unitPrice = unitPriceOf(item);
              return (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-brand-gold">
                  <div className="flex gap-3">
                    {/* Imagen del producto */}
                    {item.product.imagenUrl && (
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                          <Image
                            src={item.product.imagenUrl}
                            alt={item.product.nombre}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Contenido del producto */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-3">
                          <h3 className="font-semibold text-brand-blue text-sm leading-tight">
                            {item.product.nombre}
                          </h3>

                          {/* Opciones seleccionadas - AQUÍ ESTÁ EL CAMBIO */}
                          <div className="mt-1">
                            {renderSelectedOptions(item.selectedOptions)}
                          </div>

                          <div className="mt-2 text-sm text-gray-700">
                            <span className="font-semibold">${unitPrice.toFixed(2)}</span> {" "}
                            <span className="text-gray-500">x {item.quantity}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-brand-red text-sm">${item.totalPrice.toFixed(2)}</div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="mt-2 text-xs text-red-500 hover:underline"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer fijo - altura definida */}
        <div className="border-t bg-brand-cream p-4 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-brand-blue">Subtotal</span>
            <span className="text-2xl font-bold text-brand-brown">${cartTotal.toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={cartItems.length === 0 || isProcessing}
              className="w-full py-3 rounded-full font-bold text-white bg-brand-red hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {isProcessing ? "Procesando..." : "Finalizar Pedido"}
            </button>

            {cartItems.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("¿Vaciar el carrito?")) clearCart();
                }}
                className="w-full py-2 rounded-full font-semibold border border-brand-gold text-brand-blue bg-white hover:bg-gray-50 transition-colors"
              >
                Vaciar Carrito
              </button>
            )}

            {pending && (
              <div className="mt-2 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-sm">
                <p className="mb-2">Intento de apertura bloqueado por el navegador.</p>
                <div className="flex gap-2">
                  <button 
                    onClick={retryPending} 
                    className="flex-1 py-2 rounded-md bg-brand-gold text-white font-semibold hover:bg-amber-600 transition-colors"
                  >
                    Reintentar abrir WhatsApp
                  </button>
                  <button 
                    onClick={() => setPending(null)} 
                    className="py-2 px-3 rounded-md border hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}