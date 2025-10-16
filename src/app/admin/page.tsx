// src/app/admin/page.tsx
"use client";

import { useAuth } from '@/hooks/useAuth';
import AdminLogin from '@/components/AdminLogin';
import { signOut } from 'firebase/auth';
import { auth } from "../../../firebase/config"; // Usamos la ruta estandarizada
import ProductManager from '@/components/ProductManager'; // <-- 1. IMPORTAMOS el nuevo componente

// Componente para el Dashboard
function AdminDashboard() {
  return (
    <div className="p-4 sm:p-8 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-brand-gold">
          <h1 className="font-display text-3xl sm:text-4xl text-brand-brown mb-2 sm:mb-0">Dashboard de Productos</h1>
          <button 
            onClick={() => signOut(auth)}
            className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
        
        {/* 2. REEMPLAZAMOS el <p> con nuestro gestor de productos */}
        <ProductManager />

      </div>
    </div>
  );
}


// Componente principal de la página /admin
export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-cream">
        <p className="font-display text-2xl text-brand-brown animate-pulse">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}
