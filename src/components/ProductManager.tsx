// src/components/ProductManager.tsx
"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from "../../firebase/config";
import { Producto } from '@/interfaces/Product';
import Image from 'next/image';

export default function ProductManager() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('nombre', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Producto[];
      setProducts(productsData);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p className="text-center mt-8">Cargando productos...</p>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tus Productos ({products.length})</h2>
        <button className="bg-brand-red text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
          + Crear Nuevo Producto
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4">Imagen</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Precio</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <Image 
                    src={product.imagenUrl || 'https://placehold.co/60x60/F5EFE6/6B240C?text=Foto'} 
                    alt={product.nombre}
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                  />
                </td>
                <td className="p-4 font-semibold text-gray-700">{product.nombre}</td>
                <td className="p-4">${Number(product.precioBase).toFixed(2)}</td>
                <td className="p-4 text-sm text-gray-600">{product.categoria}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800">Editar</button>
                    <button className="text-red-600 hover:text-red-800">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="text-center text-gray-500 py-8">No tienes productos todavía. ¡Crea el primero!</p>}
      </div>
    </div>
  );
}
