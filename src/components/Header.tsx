// src/app/components/Header.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-orange-300 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-2xl font-bold text-rose-600">CrepeDelicia</span>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
              Inicio
            </Link>
            <Link href="/menu" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
              Menú
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
              Nosotros
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
              Contacto
            </Link>
          </nav>

          {/* Iconos de acción */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-rose-50 transition-colors">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-rose-50 transition-colors relative">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>
            
            {/* Botón menú móvil */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-rose-50 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-rose-600 font-medium transition-colors py-2">
                Inicio
              </Link>
              <Link href="/menu" className="text-gray-700 hover:text-rose-600 font-medium transition-colors py-2">
                Menú
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-rose-600 font-medium transition-colors py-2">
                Nosotros
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-rose-600 font-medium transition-colors py-2">
                Contacto
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}