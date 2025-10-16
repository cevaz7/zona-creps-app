// src/components/Header.tsx
"use client";

import { useState } from 'react';
import React from 'react';
import Link from 'next/link'; // Importamos el componente Link de Next.js
import { useAuthContext } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from "../../firebase/config";
import LoginModal from './LoginModal';


const Header = () => {
  const { user, isAdmin } = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="bg-brand-blue shadow-md sticky top-0 z-40">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-white font-display text-3xl font-bold">
            ZONAF <span className="text-brand-red">CREP'S</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/#menu" className="text-brand-cream hover:text-brand-gold transition-colors">Menú</Link>
            <Link href="/#about" className="text-brand-cream hover:text-brand-gold transition-colors">Nosotros</Link>
            <a href="#" className="text-brand-cream hover:text-brand-gold transition-colors">Contacto</a>
            
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
          </div>
          <div className="md:hidden">
            <button className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default Header;

