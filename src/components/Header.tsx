// src/components/Header.tsx
import React from 'react';

const Header = () => {
  return (
    <header className="bg-brand-blue shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          {/* Aquí puedes poner tu logo */}
          <a href="#" className="text-white font-display text-3xl font-bold">
            ZONA <span className="text-brand-red">CREP'S</span>
          </a>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-brand-cream hover:text-brand-gold transition-colors">Menú</a>
          <a href="#" className="text-brand-cream hover:text-brand-gold transition-colors">Nosotros</a>
          <a href="#" className="text-brand-cream hover:text-brand-gold transition-colors">Contacto</a>
          <button className="bg-brand-red text-white py-2 px-4 rounded-full hover:bg-red-700 transition-colors">
            Ver Carrito (0)
          </button>
        </div>
        <div className="md:hidden">
          <button className="text-white">
            {/* Icono de menú para móviles */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;