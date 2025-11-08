// src/app/admin/page.tsx
"use client";

import { useAuth } from '@/hooks/useAuth';
import AdminLogin from '@/components/AdminLogin';
import { signOut } from 'firebase/auth';
import { auth } from "../../../firebase/config";
import ProductManager from '@/components/ProductManager';
import { useUserRole } from "../../hooks/useUserRole";
import Header from "../../components/Header";
import NotificationsPanel from '@/components/NotificationsPanel'; 
import { useState } from 'react'; 
import NotificationPermission from '@/components/NotificationPermission';

// 🔽 ACTUALIZAR AdminDashboard para incluir navegación
function AdminDashboard() {
  const [activeView, setActiveView] = useState<'products' | 'notifications'>('products');

  return (
    <div className="min-h-screen bg-brand-cream">
      <Header />
      
      <div className="pt-24">

        {/* Banner de notificaciones push */}
        <div className="container mx-auto px-4 mb-6">
          <NotificationPermission />
        </div>

        {/* Navegación del Admin */}
        <div className="flex gap-2 mb-6 border-b pb-2 pl-4">
          <button 
            onClick={() => setActiveView('products')} 
            className={`py-2 px-4 rounded-lg font-bold ${
              activeView === 'products' ? 'bg-brand-blue text-white' : 'bg-gray-200'
            }`}
          >
            🍽️ Productos
          </button>
          <button 
            onClick={() => setActiveView('notifications')} 
            className={`py-2 px-4 rounded-lg font-bold ${
              activeView === 'notifications' ? 'bg-brand-blue text-white' : 'bg-gray-200'
            }`}
          >
            🔔 Notificaciones
          </button>
        </div>

        {/* Contenido dinámico */}
        {activeView === 'products' && <ProductManager />}
        {activeView === 'notifications' && <NotificationsPanel />}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

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
