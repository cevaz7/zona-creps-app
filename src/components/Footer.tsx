// src/components/Footer.tsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-brand-blue text-brand-cream mt-12">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="font-display text-2xl font-bold">ZONA CREP'S</h3>
            <p className="text-sm mt-2">© {new Date().getFullYear()} Todos los derechos reservados.</p>
          </div>
          <div className="flex space-x-4">
            {/* Aquí puedes agregar enlaces a tus redes sociales */}
            <a href="#" className="hover:text-brand-gold transition-colors">Facebook</a>
            <a href="#" className="hover:text-brand-gold transition-colors">Instagram</a>
            <a href="#" className="hover:text-brand-gold transition-colors">WhatsApp</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
