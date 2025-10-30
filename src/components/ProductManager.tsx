// src/components/ProductManager.tsx
"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy,doc, deleteDoc } from 'firebase/firestore';
import { db } from "../../firebase/config";
import { Producto } from '@/interfaces/Product';
import Image from 'next/image';
import ProductForm from './ProductForm'; // Importamos el nuevo formulario
import CategoryManager from './CategoryManager'; // Importamos el gestor de categorías
import OptionGroupManager from './OptionGroupManager'; // Importamos el gestor de opciones

type View = 'list' | 'create' | 'edit' | 'categories' | 'options';

export default function ProductManager() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

  useEffect(() => {
    // Nota: orderBy() puede requerir un índice en Firestore. 
    // Si ves un error en la consola, créalo desde el enlace que te da Firebase.
    const q = query(collection(db, 'products'), orderBy('nombre', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Producto[];
      setProducts(productsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (product: Producto) => {
    setEditingProduct(product);
    setView('edit');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        console.error("Error al eliminar el producto: ", error);
      }
    }
  };

  const renderView = () => {
    switch (view) {
      case 'create':
        return <ProductForm productToEdit={null} onClose={() => setView('list')} />;
      case 'edit':
        return <ProductForm productToEdit={editingProduct} onClose={() => { setView('list'); setEditingProduct(null); }} />;
      case 'categories':
        return <CategoryManager />;
      case 'options':
        return <OptionGroupManager />;
      case 'list':
      default:
        return renderProductList();
    }
  };

  const renderProductList = () => {
    if (loading) return <p className="text-center mt-8">Cargando productos...</p>;
    
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tus Productos ({products.length})</h2>
          <button onClick={() => setView('create')} className="bg-brand-red text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
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
                    <Image src={product.imagenUrl || 'https://placehold.co/60x60/F5EFE6/6B240C?text=Foto'} alt={product.nombre} width={60} height={60} className="rounded-md object-cover" />
                  </td>
                  <td className="p-4 font-semibold text-gray-700">{product.nombre}</td>
                  <td className="p-4">
                    {product.enPromocion ? (
                      <div>
                        <span className="line-through text-gray-500">${Number(product.precioBase).toFixed(2)}</span>
                        <span className="text-brand-red font-bold ml-2">${Number(product.precioPromocional).toFixed(2)}</span>
                      </div>
                    ) : (
                      <span>${Number(product.precioBase).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{product.categoriaNombre}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800">Editar</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800">Eliminar</button>
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
  };

  return (
    <div>
      {/* --- NAVEGACIÓN PRINCIPAL DEL ADMIN --- */}
      <div className="flex gap-2 mb-6 border-b pb-2 pl-4">
        <button onClick={() => setView('list')} className={`py-2 px-4 rounded-lg font-bold ${view === 'list' ? 'bg-brand-blue text-white' : 'bg-gray-200'}`}>
          Productos
        </button>
        <button onClick={() => setView('categories')} className={`py-2 px-4 rounded-lg font-bold ${view === 'categories' ? 'bg-brand-blue text-white' : 'bg-gray-200'}`}>
          Categorías
        </button>
        <button onClick={() => setView('options')} className={`py-2 px-4 rounded-lg font-bold ${view === 'options' ? 'bg-brand-blue text-white' : 'bg-gray-200'}`}>
          Grupos de Opciones
        </button>
      </div>
      {/* --- RENDERIZADO DE LA VISTA SELECCIONADA --- */}
      {renderView()}
    </div>
  );
}
