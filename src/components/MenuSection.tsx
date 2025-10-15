// src/app/components/MenuSection.tsx
"use client";

import { useState } from 'react';

const categories = [
  { id: 'all', name: 'Todos' },
  { id: 'crepes', name: 'Crepes' },
  { id: 'postres', name: 'Postres' },
  { id: 'bebidas', name: 'Bebidas' },
];

const menuItems = [
  {
    id: 1,
    name: 'Crepe de Nutella',
    category: 'crepes',
    price: 8.99,
    description: 'Delicioso crepe relleno de Nutella y fresas frescas',
    image: '/images/crepe-nutella.jpg'
  },
  {
    id: 2,
    name: 'Crepe Salut',
    category: 'crepes',
    price: 7.99,
    description: 'Crepe con queso, jamón y espinacas',
    image: '/images/crepe-salut.jpg'
  },
  {
    id: 3,
    name: 'Tiramisú',
    category: 'postres',
    price: 6.50,
    description: 'Clásico postre italiano con café y cacao',
    image: '/images/tiramisu.jpg'
  },
  {
    id: 4,
    name: 'Frappé de Fresa',
    category: 'bebidas',
    price: 5.50,
    description: 'Refrescante bebida con fresas naturales',
    image: '/images/frappe-fresa.jpg'
  },
  // Agrega más items según necesites
];

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <section id="menu" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Nuestro Menú
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra variedad de crepes dulces y salados, postres exquisitos y bebidas refrescantes
          </p>
        </div>

        {/* Filtros de categorías */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-rose-100 hover:text-rose-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-r from-rose-100 to-orange-100 flex items-center justify-center">
                {/* Placeholder para imagen */}
                <div className="text-rose-400 text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Imagen de {item.name}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                  <span className="text-rose-600 font-bold text-lg">${item.price}</span>
                </div>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <button className="w-full bg-rose-500 text-white py-2 rounded-lg font-medium hover:bg-rose-600 transition-colors">
                  Agregar al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}