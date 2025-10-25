// src/components/Header.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import LoginModal from './LoginModal';
import { useCart } from '@/context/CartContext'; // <-- 1. IMPORTAR HOOK DEL CARRITO
import CartPanel from '././CartPanel'; // <-- 2. IMPORTAR PANEL DEL CARRITO

const Header = () => {
  const { user, isAdmin } = useAuthContext();
  const { openCart, itemCount } = useCart(); // <-- 3. USAR HOOK DEL CARRITO
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="bg-brand-blue shadow-md sticky top-0 z-40">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-white font-display text-3xl font-bold">
            ZONAF <span className="text-brand-red">CREP'S</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/tienda" className="text-brand-cream hover:text-brand-gold transition-colors">Tienda</Link>
            <Link href="/#about" className="text-brand-cream hover:text-brand-gold transition-colors">Nosotros</Link>
            
            {isAdmin && (
              <Link href="/admin" className="text-yellow-400 font-bold hover:text-yellow-300 transition-colors border-l border-gray-600 pl-6">
                Panel Admin
              </Link>
            )}

            {user ? (
              <button onClick={() => signOut(auth)} className="bg-brand-gold text-brand-blue py-2 px-4 rounded-full font-semibold hover:bg-opacity-80 transition-colors">
                Cerrar Sesión
              </button>
            ) : (
              <button onClick={() => setIsModalOpen(true)} className="bg-brand-red text-white py-2 px-4 rounded-full font-semibold hover:bg-red-700 transition-colors">
                Iniciar Sesión
              </button>
            )}
            
            {/* 4. BOTÓN DEL CARRITO ACTUALIZADO */}
            <button 
              onClick={openCart}
              className="relative bg-brand-gold text-brand-blue py-2 px-5 rounded-full font-semibold hover:bg-opacity-80 transition-colors"
            >
              Carrito
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
          {/* ... Menú móvil ... */}
        </nav>
      </header>

      {/* 5. RENDERIZAR LOS MODALES */}
      {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} />}
      <CartPanel /> 
    </>
  );
};

export default Header;