// src/components/CartPanel.tsx
"use client";

import { useCart } from "@/context/CartContext";
import { sendFCMPushDirect } from "@/utils/sendFCMPush";
import { useState } from "react";
import Image from "next/image";
import { getAuth } from "firebase/auth";
import { sendWhatsAppFree } from "@/utils/sendWhatsAppFree";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function CartPanel() {
  const { isCartOpen, closeCart, cartItems, removeFromCart, cartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFinalizeOrder = async () => {
    try {
      setIsProcessing(true);

      if (cartItems.length === 0) {
        alert("🛒 El carrito está vacío");
        return;
      }

      // 🔥 USUARIO AUTH
      const auth = getAuth();
      const user = auth.currentUser;

      const userName = user?.displayName || user?.email?.split("@")[0] || "Cliente";
      const userEmail = user?.email || "";

      // -----------------------------------------------------------------
      // 🔥 OBTENER ROL DESDE FIRESTORE
      // -----------------------------------------------------------------
      let userRole = "user"; // default
      let isAdmin = false;

      if (user) {
        const db = getFirestore();
        const userDocRef = doc(db, "users", user.uid);
        const snap = await getDoc(userDocRef);

        if (snap.exists()) {
          userRole = snap.data().role || "user";
          isAdmin = userRole === "admin";
        }
      }

      // -----------------------------------------------------------------
      // 🔥 DATOS DEL PEDIDO
      // -----------------------------------------------------------------
      let customerName = userName;
      let customerPhone = "";
      let paymentMethod = "";
      let customerNotes = "";

      // Nombre editable
      const nameInput = prompt("👤 ¿Nombre del cliente?", customerName);
      if (nameInput) customerName = nameInput;

      if (!customerName) {
        alert("❌ Se requiere el nombre del cliente");
        return;
      }

      // Teléfono obligatorio
      customerPhone = prompt("📞 ¿Número de WhatsApp del cliente? (OBLIGATORIO)") || "";
      const cleanPhone = customerPhone.replace(/\s+/g, "").replace("+", "");

      if (!cleanPhone || cleanPhone.length < 10) {
        alert("❌ Número de WhatsApp inválido o incompleto");
        return;
      }

      // Método de pago
      const paymentInput = prompt(
        `💳 Método de pago para ${customerName}:\n\n1. Transferencia\n2. Efectivo\n\nEscribe "1" o "2":`
      );

      if (paymentInput === "1") paymentMethod = "Transferencia";
      else if (paymentInput === "2") paymentMethod = "Efectivo";
      else {
        alert("❌ Método de pago no válido");
        return;
      }

      // Notas opcionales
      customerNotes = prompt("📝 ¿Alguna nota especial? (opcional)") || "";

      // ID único
      const orderId = "order-" + Date.now();

      // Datos del pedido
      const orderData = {
        items: cartItems.map((item) => ({
          name: item.product.nombre,
          quantity: item.quantity,
          price: item.product.precioBase,
          totalPrice: item.totalPrice,
          selectedOptions: item.selectedOptions,
          productId: item.product.id,
        })),
        total: cartTotal,
        customerName,
        customerEmail: userEmail,
        customerId: user?.uid || "",
        paymentMethod,
        customerPhone: cleanPhone,
        notes: customerNotes,
        status: "pending",
      };

      console.log("🟡 Procesando pedido...", orderId);

      // -----------------------------------------------------------------
      // 📱 GENERAR LINK DE WHATSAPP
      // -----------------------------------------------------------------
      const whatsappUrl = sendWhatsAppFree(orderData, orderId, cleanPhone);

      // ----------------------
      // 🚨 ABRIR WHATSAPP
      // ----------------------
      const newWindow = window.open(whatsappUrl, "_blank");

      // ⚠️ SI EL POPUP FUE BLOQUEADO
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        const retry = confirm(
          "⚠️ El navegador bloqueó la ventana de WhatsApp.\n\n" +
            "📱 *EN CELULAR:*\n" +
            "• Toca los tres puntos (⋮) arriba a la derecha.\n" +
            "• Entra a Configuración → Configuración del sitio.\n" +
            "• Activa: Ventanas emergentes y redirecciones.\n\n" +
            "💻 *EN COMPUTADORA:*\n" +
            "• Haz clic en el candado (🔒) junto a la barra de dirección.\n" +
            "• Busca: Ventanas emergentes.\n" +
            "• Selecciona: Permitir.\n\n" +
            "¿Quieres intentarlo de nuevo?"
        );

        if (retry) {
          location.reload();
          return;
        } else {
          alert("❌ No se pudo abrir WhatsApp. Activa las ventanas emergentes e intenta nuevamente.");
          return;
        }
      }

      // -----------------------------------------------------------------
      // 💾 CREAR NOTIFICACIÓN FCM (PEDIDO NUEVO)
      // -----------------------------------------------------------------
      await sendFCMPushDirect(orderData, orderId);

      // Vaciar carrito
      clearCart();
      closeCart();

      // -----------------------------------------------------------------
      // 🔥 MENSAJES DEPENDIENDO DEL ROL
      // -----------------------------------------------------------------
      if (isAdmin) {
        if (paymentMethod === "Transferencia") {
          alert(
            `✅ Pedido #${orderId.slice(-8)} registrado\n\n` +
              `📞 Cliente: ${customerName}\n` +
              `📱 Teléfono: ${cleanPhone}\n\n` +
              `💵 Método: Transferencia\n` +
              `👉 Solicita el comprobante al cliente`
          );
        } else {
          alert(
            `✅ Pedido #${orderId.slice(-8)} registrado\n\n` +
              `📞 Cliente: ${customerName}\n` +
              `📱 Teléfono: ${cleanPhone}\n\n` +
              `💵 Cobrar en efectivo: $${cartTotal.toFixed(2)}`
          );
        }
      } else {
        alert(
          `🎉 ¡Gracias por tu pedido ${customerName}!\n\n` +
            `Te contactaremos pronto para confirmar tu orden.`
        );
      }
    } catch (error) {
      console.error("❌ ERROR:", error);
      alert("❌ Error al procesar el pedido. Intenta nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isCartOpen) return null;

  // 🟦 UI DEL PANEL
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black bg-opacity-60" onClick={closeCart}></div>

      <div className="relative z-10 w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="font-display text-2xl font-bold text-brand-brown">Tu Pedido</h2>
          <button onClick={closeCart} className="text-gray-500 text-2xl font-bold">
            &times;
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
            <p className="font-semibold text-gray-700">Tu carrito está vacío</p>
            <p className="text-gray-500 text-sm">Añade algunos postres deliciosos.</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {cartItems.map((item) => (
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

                  {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {Object.entries(item.selectedOptions).map(([key, value]) => (
                        <div key={key}>
                          {key}: {String(value)}
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
                <p className="font-bold text-gray-800">${item.totalPrice.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="p-6 border-t mt-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-lg text-gray-700">Subtotal</span>
            <span className="font-bold text-2xl text-brand-blue">${cartTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleFinalizeOrder}
            disabled={cartItems.length === 0 || isProcessing}
            className={`w-full text-center bg-brand-red text-white font-bold py-3 rounded-full ${
              cartItems.length === 0 || isProcessing
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-red-700"
            } transition-colors`}
          >
            {isProcessing ? "Procesando..." : "Finalizar Pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}
