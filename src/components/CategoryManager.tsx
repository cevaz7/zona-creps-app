// src/components/CategoryManager.tsx
"use client";

import { useState, useEffect } from 'react';
import { db } from "../../firebase/config";
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Categoria } from '@/interfaces/Product';

export default function CategoryManager() {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Categoria));
      setCategories(cats);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === '') return;
    try {
      await addDoc(collection(db, 'categories'), { nombre: newCategoryName });
      setNewCategoryName('');
    } catch (error) {
      console.error("Error al añadir categoría: ", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("¿Seguro que quieres eliminar esta categoría?")) {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (error) {
        console.error("Error al eliminar categoría: ", error);
      }
    }
  };

  if (loading) return <p>Cargando categorías...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestionar Categorías</h2>
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={newCategoryName} 
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nombre de la nueva categoría"
          className="flex-grow p-2 border rounded-lg"
        />
        <button onClick={handleAddCategory} className="bg-brand-red text-white font-bold py-2 px-4 rounded-lg">Añadir</button>
      </div>
      <ul className="space-y-2">
        {categories.map(cat => (
          <li key={cat.id} className="flex justify-between items-center p-2 border rounded-lg">
            <span>{cat.nombre}</span>
            <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700">Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
