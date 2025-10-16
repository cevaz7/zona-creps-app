// src/components/MenuSection.tsx
"use client";

import { useState } from 'react';
import { Producto } from '@/interfaces/Product'; // Importamos nuestra interfaz
import ProductCard from './ProductCard'; // Importamos el nuevo componente

// Las categorías ahora pueden venir de los propios productos
const categories = [
  'Todos', 'Crepes de Chocolate', 'Crepes de Nutella', 'Crepes de Sal', 'Waffles', 'Milkshakes', 'Café', 'Helados'
];

interface Props {
  productos: Producto[]; // Recibimos los productos como props
}

export default function MenuSection({ productos }: Props) {
  const [activeCategory, setActiveCategory] = useState('Todos');

  const filteredItems = activeCategory === 'Todos' 
    ? productos
    : productos.filter(item => item.categoria === activeCategory);

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

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full font-bold transition-all duration-300 text-sm md:text-base ${
                activeCategory === category
                  ? 'bg-brand-brown text-white shadow-md'
                  : 'bg-white text-brand-brown hover:bg-brand-gold hover:text-brand-blue'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <ProductCard key={item.id} producto={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
