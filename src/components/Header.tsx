// src/components/Header.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import LoginModal from './LoginModal';
import { useCart } from '@/context/CartContext';
import CartPanel from './CartPanel';

const Header = () => {
  const { user, isAdmin } = useAuthContext();
  const { openCart, itemCount } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!mounted) {
    return (
      <header className="bg-brand-blue shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-white font-display text-3xl font-bold">
              ZONAF <span className="text-brand-red">CREP'S</span>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-brand-blue/95 backdrop-blur-lg shadow-2xl py-3' 
          : 'bg-brand-blue py-5'
      }`}>
        <nav className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            
            {/* Logo con animación */}
            <Link 
              href="/" 
              className="group relative"
            >
              <div className="text-white font-display text-3xl font-bold transition-all duration-300 group-hover:scale-105">
                ZONAF <span className="text-brand-red transition-colors duration-300 group-hover:text-red-400">CREP'S</span>
              </div>
              {/* Efecto de subrayado animado */}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-gold to-brand-red transition-all duration-500 group-hover:w-full"></div>
            </Link>

            {/* Navegación Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              
              {/* Links de navegación */}
              <div className="flex items-center space-x-6">
                <Link 
                  href="/tienda" 
                  className="relative text-brand-cream hover:text-brand-gold transition-all duration-300 group font-medium text-sm uppercase tracking-wide"
                >
                  Tienda
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                </Link>
                
                <Link 
                  href="/#about" 
                  className="relative text-brand-cream hover:text-brand-gold transition-all duration-300 group font-medium text-sm uppercase tracking-wide"
                >
                  Nosotros
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                </Link>

                {/* MIS PEDIDOS - NUEVO ENLACE */}
                {user && (
                  <Link 
                    href="/mis-pedidos" 
                    className="relative text-brand-cream hover:text-brand-gold transition-all duration-300 group font-medium text-sm uppercase tracking-wide"
                  >
                    Mis Pedidos
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )}

                {/* Panel Admin */}
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="relative text-yellow-300 hover:text-yellow-200 transition-all duration-300 group font-bold text-sm uppercase tracking-wide border-l border-gray-600 pl-6 ml-2"
                  >
                    Panel Admin
                    <span className="absolute -bottom-1 left-6 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )}
              </div>

              {/* Separador visual */}
              <div className="h-6 w-px bg-gray-600 mx-2"></div>

              {/* Acciones de usuario */}
              <div className="flex items-center space-x-4">
                
                {/* Estado del usuario */}
                {user ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-brand-cream text-sm bg-white/10 px-3 py-1.5 rounded-full border border-brand-gold/30 backdrop-blur-sm">
                      ¡Hola, {user.email?.split('@')[0]}!
                    </span>
                    <button 
                      onClick={handleSignOut}
                      className="bg-brand-gold text-brand-blue py-2 px-4 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-brand-gold/50"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brand-red text-white py-2.5 px-5 rounded-full font-semibold hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-red-500/30"
                  >
                    Iniciar Sesión
                  </button>
                )}

                {/* Botón del Carrito Mejorado */}
                <button 
                  onClick={openCart}
                  className="relative bg-gradient-to-r from-brand-gold to-amber-500 text-brand-blue py-2.5 px-5 rounded-full font-semibold hover:from-amber-500 hover:to-brand-gold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group border border-amber-400/50"
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21" />
                    </svg>
                    <span>Carrito</span>
                  </span>
                  
                  {/* Badge del contador */}
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-brand-red text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow border border-white/50">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Menú Móvil */}
            <div className="md:hidden flex items-center space-x-4">
              
              {/* Botón Carrito Móvil */}
              <button 
                onClick={openCart}
                className="relative p-2 text-brand-cream hover:text-brand-gold transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Botón Menú Hamburguesa */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-brand-cream hover:text-brand-gold transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Menú Móvil Desplegable */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-600 pt-4 animate-slideDown">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/tienda" 
                  className="text-brand-cream hover:text-brand-gold transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tienda
                </Link>
                <Link 
                  href="/#about" 
                  className="text-brand-cream hover:text-brand-gold transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Nosotros
                </Link>
                
                {/* MIS PEDIDOS - MÓVIL */}
                {user && (
                  <Link 
                    href="/mis-pedidos" 
                    className="text-brand-cream hover:text-brand-gold transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📦 Mis Pedidos
                  </Link>
                )}

                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="text-yellow-400 hover:text-yellow-300 transition-colors py-2 font-bold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Panel Admin
                  </Link>
                )}
                {user ? (
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-brand-cream hover:text-brand-gold transition-colors py-2 text-left"
                  >
                    Cerrar Sesión
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setIsModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-brand-cream hover:text-brand-gold transition-colors py-2 text-left"
                  >
                    Iniciar Sesión
                  </button>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Modales */}
      {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} />}
      <CartPanel/>
    </>
  );
};

export default Header;