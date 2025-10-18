// src/components/Header.tsx
"use client";

import { useState, useEffect } from 'react';
import React from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from "../../firebase/config";
import LoginModal from './LoginModal';
import Toast from './Toast';

const Header = () => {
  const { user, isAdmin } = useAuthContext();
  const [showLogin, setShowLogin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Controlar el mensaje de bienvenida con localStorage
  useEffect(() => {
    if (!mounted) return;

    const hasShownWelcome = localStorage.getItem('hasShownWelcome');
    
    if (user && !hasShownWelcome) {
      setToast({
        message: `¡Bienvenido! Has iniciado sesión correctamente.`,
        type: 'success'
      });
      localStorage.setItem('hasShownWelcome', 'true');
    }

    if (!user) {
      localStorage.removeItem('hasShownWelcome');
    }
  }, [user, mounted]);

  const handleOpenLogin = () => {
    setShowLogin(true);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setToast({
        message: 'Has cerrado sesión correctamente.',
        type: 'info'
      });
      localStorage.removeItem('hasShownWelcome');
    } catch (error) {
      setToast({
        message: 'Error al cerrar sesión.',
        type: 'error'
      });
    }
  };

  if (!mounted) {
    return (
      <header className="bg-brand-blue shadow-md sticky top-0 z-40">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-white font-display text-3xl font-bold">
            ZONAF <span className="text-brand-red">CREP'S</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="bg-gray-600 animate-pulse h-6 w-20 rounded"></div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <>
      <header className="bg-brand-blue shadow-md sticky top-0 z-40">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-white font-display text-3xl font-bold hover:scale-105 transition-transform duration-200">
            ZONAF <span className="text-brand-red">CREP'S</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/#menu" className="text-brand-cream hover:text-brand-gold transition-colors font-semibold">Menú</Link>
            <Link href="/#about" className="text-brand-cream hover:text-brand-gold transition-colors font-semibold">Nosotros</Link>
            <a href="#" className="text-brand-cream hover:text-brand-gold transition-colors font-semibold">Contacto</a>
            
            {isAdmin && (
              <Link href="/admin" className="text-yellow-400 font-bold hover:text-yellow-300 transition-colors border-l border-gray-600 pl-6">
                Panel Admin
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-brand-cream text-sm bg-brand-blue/50 px-3 py-1 rounded-full border border-brand-gold/30">
                  ¡Hola, {user.email?.split('@')[0]}!
                </span>
                <button 
                  onClick={handleSignOut}
                  className="bg-brand-gold text-brand-blue py-2 px-4 rounded-full font-semibold hover:bg-opacity-80 transition-all duration-200 hover:scale-105"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button 
                onClick={handleOpenLogin}
                className="bg-brand-red text-white py-2 px-4 rounded-full font-semibold hover:bg-red-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </nav>
      </header>

      {showLogin && <LoginModal onClose={handleCloseLogin} />}

      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default Header;

