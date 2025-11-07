// src/context/CartContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Producto } from '@/interfaces/Product';

// Definimos cómo se verá un item DENTRO del carrito
export interface CartItem {
  id: string;
  product: Producto;
  quantity: number;
  selectedOptions: any;
  totalPrice: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  itemCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const storedCart = localStorage.getItem('zonafcreps_cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('zonafcreps_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (itemToAdd: Omit<CartItem, 'id'>) => {
    const newItemId = itemToAdd.product.id + JSON.stringify(itemToAdd.selectedOptions);
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItemId);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === newItemId
            ? { ...item, quantity: item.quantity + itemToAdd.quantity, totalPrice: item.totalPrice + itemToAdd.totalPrice }
            : item
        );
      } else {
        return [...prevItems, { ...itemToAdd, id: newItemId }];
      }
    });
    openCart();
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        isCartOpen,
        addToCart, 
        removeFromCart, 
        clearCart, 
        openCart, 
        closeCart, 
        itemCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 🔽 ESTA ES LA PARTE MÁS IMPORTANTE - EXPORT CORRECTO
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};