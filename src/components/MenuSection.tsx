// src/components/MenuSection.tsx - VERSIÓN CORREGIDA
"use client";

import { useState, useEffect, useRef } from 'react';
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filtramos por el ID de la categoría
  const filteredItems = activeCategory === 'Todos' 
    ? productos 
    : productos.filter(item => item.categoriaId === activeCategory);

  // Creamos la lista completa de botones de filtro
  const allCategories = [{ id: 'Todos', nombre: 'Todos' }, ...categorias];

  // Calcular cuántos slides tenemos
  const itemsPerSlide = 3; // Mostrar 3 productos por slide
  const totalSlides = Math.ceil(filteredItems.length / itemsPerSlide);

  // Función para ir a un slide específico
  const goToSlide = (slideIndex: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const slideWidth = container.clientWidth;
      const newPosition = slideIndex * slideWidth;
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setCurrentSlide(slideIndex);
    }
  };

  // Función para siguiente slide
  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      goToSlide(currentSlide + 1);
    }
  };

  // Función para slide anterior
  const prevSlide = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  // Agrupar productos en slides
  const groupedProducts = [];
  for (let i = 0; i < filteredItems.length; i += itemsPerSlide) {
    groupedProducts.push(filteredItems.slice(i, i + itemsPerSlide));
  }

  useEffect(() => {
    setIsVisible(true);
    // Resetear al primer slide cuando cambia la categoría
    setCurrentSlide(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [activeCategory]);

  // Detectar el slide actual cuando se hace scroll manual
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const slideWidth = container.clientWidth;
        const currentPosition = container.scrollLeft;
        const newSlide = Math.round(currentPosition / slideWidth);
        
        if (newSlide !== currentSlide) {
          setCurrentSlide(newSlide);
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentSlide]);

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
          /* Contenedor del carrusel */
          <div className="relative">
            {/* Botones de navegación - SOLO SI HAY MÁS DE 1 SLIDE */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl ${
                    currentSlide > 0
                      ? 'text-brand-brown hover:bg-brand-gold hover:text-white opacity-100 cursor-pointer' 
                      : 'text-gray-300 opacity-30 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={nextSlide}
                  disabled={currentSlide === totalSlides - 1}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl ${
                    currentSlide < totalSlides - 1
                      ? 'text-brand-brown hover:bg-brand-gold hover:text-white opacity-100 cursor-pointer' 
                      : 'text-gray-300 opacity-30 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Carrusel de productos */}
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                scrollBehavior: 'smooth'
              }}
            >
              {groupedProducts.map((slideProducts, slideIndex) => (
                <div 
                  key={slideIndex}
                  className="flex-shrink-0 w-full snap-start px-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {slideProducts.map((item, productIndex) => (
                      <div 
                        key={item.id}
                        className="transform transition-all duration-500 hover:scale-105"
                        style={{ 
                          animationDelay: `${(slideIndex * itemsPerSlide + productIndex) * 100}ms`
                        }}
                      >
                        <Link href={`/producto/${item.id}`} className="block h-full group">
                          <ProductCard producto={item} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Indicadores de slides (puntos) - SOLO SI HAY MÁS DE 1 SLIDE */}
            {totalSlides > 1 && (
              <div className="flex justify-center mt-8 space-x-3">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? 'bg-brand-gold scale-125'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Ir al slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
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

      {/* Estilos para ocultar scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}