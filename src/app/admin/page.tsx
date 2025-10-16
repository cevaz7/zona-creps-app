// src/app/admin/page.tsx
"use client";

import { useAuth } from '@/hooks/useAuth';
import AdminLogin from '@/components/AdminLogin';
import { signOut } from 'firebase/auth';
import { auth } from "../../../firebase/config";
import ProductManager from '@/components/ProductManager';
import { useUserRole } from "../../hooks/useUserRole"; // <-- Importamos el hook de rol

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

        <ProductManager />

      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole(); // <-- Obtenemos rol del usuario

  // Mostramos carga si alguna de las verificaciones está cargando
  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-cream">
        <p className="font-display text-2xl text-brand-brown animate-pulse">Cargando...</p>
      </div>
    );
  }

  // Si no está autenticado, mostramos login
  if (!user) {
    return <AdminLogin />;
  }

  // Si el usuario no es admin, mostramos mensaje de acceso denegado
  if (role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-cream">
        <p className="font-display text-2xl text-brand-brown">No tienes permiso para acceder a esta página.</p>
      </div>
    );
  }

  // Si pasó todas las verificaciones, mostramos el dashboard
  return <AdminDashboard />;
}
