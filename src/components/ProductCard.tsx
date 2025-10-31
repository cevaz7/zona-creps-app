// src/components/ProductCard.tsx - VERSIÓN MEJORADA SIN PROPIEDADES EXTRA
"use client";

import Image from 'next/image';
import { Producto } from '@/interfaces/Product';
import { useState } from 'react';

interface Props {
  producto: Producto;
}

const ProductCard = ({ producto }: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-brand-cream rounded-2xl shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-all duration-500 flex flex-col border-2 border-transparent hover:border-brand-gold cursor-pointer h-full relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Efecto de brillo en hover */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 ${
        isHovered ? 'translate-x-full' : '-translate-x-full'
      } z-10 pointer-events-none`}></div>

      {/* Zona de Imagen con Insignias Mejoradas */}
      <div className="relative w-full h-56 overflow-hidden">
        <Image
          src={producto.imagenUrl || 'https://placehold.co/600x400/F5EFE6/6B240C?text=Zonaf+Creps'}
          alt={`Imagen de ${producto.nombre}`}
          fill
          className={`object-cover transition-all duration-700 ${
            imageLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-110'
          } ${
            isHovered ? 'scale-110 rotate-1' : 'scale-100 rotate-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Overlay sutil en hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/10 to-transparent transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}></div>

        {/* Insignia de Producto del Día Mejorada */}
        {producto.productoDelDia && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-brand-red to-red-600 text-white text-xs font-bold py-2 px-4 rounded-full uppercase tracking-wide shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl z-20">
             Del Día
          </span>
        )}
        
        {/* Insignia de Promoción Mejorada */}
        {producto.enPromocion && (
          <span className="absolute top-3 right-3 bg-gradient-to-r from-brand-gold to-amber-500 text-brand-blue text-xs font-bold py-2 px-4 rounded-full uppercase tracking-wide shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl z-20">
            ⚡ Promo
          </span>
        )}

        {/* Efecto de nuevo badge si es nuevo producto (opcional) */}
        {/* {producto.esNuevo && (
          <span className="absolute top-12 left-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold py-2 px-4 rounded-full uppercase tracking-wide shadow-lg transform transition-all duration-300 group-hover:scale-110 z-20">
            Nuevo
          </span>
        )} */}
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-6 flex flex-col flex-grow relative z-10">
        <h3 className="font-display text-2xl font-bold text-brand-brown truncate transition-colors duration-300 group-hover:text-brand-gold">
          {producto.nombre}
        </h3>
        
        {/* Descripción con animación */}
        <p className="font-body text-gray-700 text-sm mt-2 flex-grow min-h-[3rem] transition-all duration-300 group-hover:text-gray-800">
          {producto.descripcion}
        </p>
        
        {/* Zona de Precio y Botón Mejorada */}
        <div className="mt-4 flex justify-between items-center">
          
          {/* Lógica de Precios con Animaciones */}
          {producto.enPromocion && producto.precioPromocional && producto.precioPromocional > 0 ? (
            <div className="flex flex-col transform transition-all duration-300 group-hover:scale-105">
              <p className="font-body text-lg font-bold text-gray-400 line-through transition-all duration-300 group-hover:text-gray-500">
                ${Number(producto.precioBase).toFixed(2)}
              </p>
              <p className="font-body text-3xl font-black text-brand-red bg-gradient-to-r from-brand-red to-red-600 bg-clip-text text-transparent transition-all duration-500 group-hover:scale-110">
                ${Number(producto.precioPromocional).toFixed(2)}
              </p>
            </div>
          ) : (
            <p className="font-body text-3xl font-black text-brand-blue transform transition-all duration-300 group-hover:scale-105 group-hover:text-brand-gold">
              ${Number(producto.precioBase).toFixed(2)}
            </p>
          )}

          {/* Botón con Animaciones Mejoradas */}
          <div className="relative overflow-hidden">
            <div className={`bg-brand-brown text-white font-bold py-3 px-6 rounded-full shadow-md transition-all duration-500 transform ${
              isHovered ? 'scale-110 bg-brand-red shadow-lg shadow-red-500/30' : 'scale-100'
            } relative z-10 flex items-center gap-2`}>
              <span>Ver</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${
                  isHovered ? 'translate-x-1 scale-110' : 'translate-x-0 scale-100'
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            {/* Efecto de pulso en el botón */}
            <div className={`absolute inset-0 rounded-full bg-brand-red opacity-0 transition-opacity duration-500 ${
              isHovered ? 'opacity-20 animate-ping' : 'opacity-0'
            }`}></div>
          </div>
        </div>

        {/* Información adicional que aparece en hover - SOLO SI TIENES ESTOS DATOS PILAS HEMBRA BORIS AQUI PODEMOS AÑADIR ESTO*/}
        {/* {producto.tiempoPreparacion && (
          <div className={`mt-3 pt-3 border-t border-gray-200 transition-all duration-500 overflow-hidden ${
            isHovered ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1">
                ⏱️ {producto.tiempoPreparacion} min
              </span>
              {producto.calificacion && (
                <span className="flex items-center gap-1">
                  ⭐ {producto.calificacion}
                </span>
              )}
            </div>
          </div>
        )} */}
      </div>

      {/* Efecto de sombra animada */}
      <div className={`absolute inset-0 rounded-2xl shadow-2xl transition-opacity duration-500 pointer-events-none ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}></div>
    </div>
  );
};

export default ProductCard;