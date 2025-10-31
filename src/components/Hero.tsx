// src/components/Hero.tsx - VERSIÓN CON IMAGEN
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* Imagen de fondo con Next.js Image */}
      <div className="absolute inset-0">
        <Image
          src="/Fondo_Hero/crepsfondo.jpg" // Ruta de tu imagen en public/images/
          alt="Deliciosos crepes y waffles de Zonaf Creps"
          fill
          className="object-cover"
          priority // Para que cargue inmediatamente
          quality={85}
          sizes="100vw"
          style={{
            objectPosition: 'center center', // 🔥 Ajuste: posiciona la imagen
          }}
        />
        {/* Overlay para mejor legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/80 to-purple-900/70"></div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10 pt-16">
        
        {/* Contenido */}
        <div className={`mb-8 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4">
            ZONAF CREP'S
          </h1>
          <div className="w-32 h-1 bg-brand-gold mx-auto mb-6"></div>
          <h2 className="font-display text-2xl md:text-3xl text-brand-gold font-light italic">
            Un viaje de sabores auténticos
          </h2>
        </div>

        <p className={`text-lg text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed transform transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          Descubre la magia de los crepes artesanales, preparados con ingredientes 
          selectos y una pasión que se siente en cada bocado.
        </p>

        <div className={`flex flex-col sm:flex-row gap-4 justify-center transform transition-all duration-1000 delay-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          
          <Link 
            href="/tienda"
            className="bg-brand-gold text-brand-blue px-8 py-4 rounded-lg font-semibold hover:bg-amber-500 transition-all duration-300 transform hover:scale-105"
          >
            Ver Menú Completo
          </Link>

          <a 
            href="#menu"
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-brand-blue transition-all duration-300 transform hover:scale-105"
          >
            Ver Especialidades
          </a>
        </div>
      </div>
    </section>
  );
}