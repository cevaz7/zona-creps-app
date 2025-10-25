// src/components/MenuSection.tsx
"use client";

import { useState } from 'react';
import { Producto, Categoria } from '@/interfaces/Product';
import ProductCard from './ProductCard';
import Link from 'next/link'; // Importamos Link para la navegación

interface Props {
  productos: Producto[];
  categorias: Categoria[]; // Recibimos las categorías dinámicas
  loading: boolean;
}

export default function MenuSection({ productos, categorias, loading }: Props) {
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Filtramos por el ID de la categoría, no por el nombre
  const filteredItems = activeCategory === 'Todos' 
    ? productos 
    : productos.filter(item => item.categoriaId === activeCategory);

  // Creamos la lista completa de botones de filtro
  const allCategories = [{ id: 'Todos', nombre: 'Todos' }, ...categorias];

  return (
    <section id="menu" className="py-20 bg-brand-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-brown mb-4">
            Nuestro Menú
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto text-lg">
            Cada creación es una nueva aventura. ¿Cuál vas a elegir hoy?
          </p>
        </div>

        {/* Filtros de categorías dinámicos */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
          {allCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded-full font-bold transition-all duration-300 text-sm md:text-base ${
                activeCategory === category.id
                  ? 'bg-brand-brown text-white shadow-md'
                  : 'bg-white text-brand-brown hover:bg-brand-gold hover:text-brand-blue'
              }`}
            >
              {category.nombre}
            </button>
          ))}
        </div>

        {/* Grid de productos */}
        {loading ? (
          <p className="text-center text-brand-brown font-display text-2xl">Cargando delicias...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => (
              // Envolvemos la tarjeta en un Link que lleva a la página de detalle
              <Link href={`/producto/${item.id}`} key={item.id} className="h-full">
                <ProductCard producto={item} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}