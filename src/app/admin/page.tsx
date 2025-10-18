// src/app/admin/page.tsx
"use client";

import { useAuth } from '@/hooks/useAuth';
import AdminLogin from '@/components/AdminLogin';
import { signOut } from 'firebase/auth';
import { auth } from "../../../firebase/config";
import ProductManager from '@/components/ProductManager';
import { useUserRole } from "../../hooks/useUserRole"; // <-- Importamos el hook de rol
import Header from "../../components/Header";

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-brand-cream">
      
        
          <Header />
        

        <ProductManager />

      
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
