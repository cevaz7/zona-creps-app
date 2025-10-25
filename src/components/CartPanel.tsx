// src/components/CartPanel.tsx
"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";

export default function CartPanel() {
  const { isCartOpen, closeCart, cartItems, removeFromCart, cartTotal } = useCart();

  if (!isCartOpen) return null;

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
            <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
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
          <Link 
            href="/checkout" // La futura página de pago
            onClick={closeCart}
            className={`w-full block text-center bg-brand-red text-white font-bold py-3 rounded-full ${cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
          >
            Finalizar Pedido
          </Link>
        </div>
      </div>
    </div>
  );
}