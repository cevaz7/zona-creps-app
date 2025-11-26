// src/app/tienda/page.tsx
"use client";

import { db } from "../../../firebase/config";; // Ajusta la ruta si es necesario
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import Header from "@/components/Header"; // Usamos alias de ruta
import Footer from "@/components/Footer";
import MenuSection from "@/components/MenuSection";
import { Producto, Categoria } from "@/interfaces/Product";
import { useEffect, useState } from "react";

export default function TiendaPage() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para obtener productos
    const getProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("disponible", "==", true));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Producto[];
      } catch (error) {
        console.error("Error al obtener los productos:", error);
        return [];
      }
    };

    // Función para obtener categorías
    const getCategories = async () => {
      try {
        const categoriesRef = collection(db, "categories");
        const q = query(categoriesRef, orderBy("nombre", "asc"));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Categoria[];
      } catch (error) {
        console.error("Error al obtener categorías:", error);
        return [];
      }
    };

    // Cargar ambos datos en paralelo
    const loadData = async () => {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream">
      <Header />
      <main className="pt-8 md:pt-12">
        <MenuSection productos={products} categorias={categories} loading={loading} />
      </main>
      <Footer />
    </div>
  );
}