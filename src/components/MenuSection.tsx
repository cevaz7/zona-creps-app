// src/components/MenuSection.tsx - VERSIÓN MEJORADA
"use client";

import { useState, useEffect } from 'react';
import { Producto, Categoria } from '@/interfaces/Product';
import ProductCard from './ProductCard';
import Link from 'next/link';

interface Props {
  productos: Producto[];
  categorias: Categoria[];
  loading: boolean;
}

export default function MenuSection({ productos, categorias, loading }: Props) {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isVisible, setIsVisible] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);

  // Filtramos por el ID de la categoría
  const filteredItems = activeCategory === 'Todos' 
    ? productos 
    : productos.filter(item => item.categoriaId === activeCategory);

  // Creamos la lista completa de botones de filtro
  const allCategories = [{ id: 'Todos', nombre: 'Todos' }, ...categorias];

  useEffect(() => {
    setIsVisible(true);
    
    // Pequeño delay para la animación de las cards
    const timer = setTimeout(() => {
      setAnimateCards(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Reiniciar animaciones cuando cambia la categoría
  useEffect(() => {
    setAnimateCards(false);
    const timer = setTimeout(() => {
      setAnimateCards(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [activeCategory]);

  return (
    <section id="menu" className="py-20 bg-brand-cream relative overflow-hidden">
      
      {/* Fondos decorativos sutiles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-brand-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header de la sección con animación */}
        <div className={`text-center mb-12 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-brown mb-4">
            Nuestro Menú
          </h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto mb-6"></div>
          <p className="text-gray-700 max-w-2xl mx-auto text-lg">
            Cada creación es una nueva aventura. ¿Cuál vas a elegir hoy?
          </p>
        </div>

        {/* Filtros de categorías elegantes */}
        <div className={`flex flex-wrap justify-center gap-3 md:gap-4 mb-12 transform transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          {allCategories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-500 transform hover:scale-105 hover:shadow-lg ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-brand-brown to-brown-800 text-white shadow-lg shadow-brown-500/30 scale-105'
                  : 'bg-white text-brand-brown border border-gray-200 hover:border-brand-gold hover:text-brand-gold hover:shadow-md'
              } ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'forwards'
              }}
            >
               {/* Efecto de brillo MUY SUTIL - solo en active */}
              {activeCategory === category.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-20 "></div>
              )}
              
              <span className="relative z-10">
                {category.nombre}
              </span>
            </button>
          ))}
        </div>

        {/* Estado de carga mejorado */}
        {loading ? (
          <div className={`text-center transform transition-all duration-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="text-brand-brown font-display text-2xl animate-pulse">
                Cargando delicias...
              </p>
            </div>
          </div>
        ) : (
          /* Grid de productos animado */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <Link 
                href={`/producto/${item.id}`} 
                key={item.id} 
                className={`block h-full transform transition-all duration-500 ${
                  animateCards 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-8 opacity-0 scale-95'
                } hover:scale-105 hover:z-10`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <div className="h-full group">
                  <ProductCard producto={item} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Mensaje cuando no hay productos */}
        {!loading && filteredItems.length === 0 && (
          <div className={`text-center py-12 transform transition-all duration-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-gray-200">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-bold text-brand-brown mb-2">
                ¡Próximamente!
              </h3>
              <p className="text-gray-600">
                Estamos preparando nuevas delicias para ti.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}