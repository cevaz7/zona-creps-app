// src/app/admin/page.tsx (actualizado)
"use client";

import { useAuth } from '@/hooks/useAuth';
import AdminLogin from '@/components/AdminLogin';
import { auth } from "../../../firebase/config";
import ProductManager from '@/components/ProductManager';
import { useUserRole } from "../../hooks/useUserRole";
import Header from "../../components/Header";
import NotificationsPanel from '@/components/NotificationsPanel'; 
import { useState } from 'react'; 
import NotificationPermission from '@/components/NotificationPermission';
import AdminNotificationToast from '@/components/AdminNotificationToast';
import WhatsAppConfigPanel from '@/components/WhatsAppConfigPanel';
import AdminDashboardPanel from '@/components/AdminDashboardPanel'; 

function AdminDashboard() {
  const [activeView, setActiveView] = useState<'products' | 'notifications' | 'config' | 'analytics'>('products'); 

  return (
    <div className="min-h-screen bg-brand-cream">
      <Header />
      <AdminNotificationToast />
      
      <div className="pt-24">

        {/* Banner de notificaciones push */}
        <div className="container mx-auto px-4 mb-6">
          <NotificationPermission />
        </div>

        {/* Navegación del Admin */}
        <div className="container mx-auto px-4">
          <div className="flex gap-2 mb-6 border-b pb-2 flex-wrap">
            <button 
              onClick={() => setActiveView('products')} 
              className={`py-2 px-4 rounded-lg font-bold transition-colors ${
                activeView === 'products' ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🍽️ Productos
            </button>
            <button 
              onClick={() => setActiveView('notifications')} 
              className={`py-2 px-4 rounded-lg font-bold transition-colors ${
                activeView === 'notifications' ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🔔 Notificaciones
            </button>
            <button 
              onClick={() => setActiveView('analytics')} 
              className={`py-2 px-4 rounded-lg font-bold transition-colors ${
                activeView === 'analytics' ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📊 Analytics
            </button>
            <button 
              onClick={() => setActiveView('config')} 
              className={`py-2 px-4 rounded-lg font-bold transition-colors ${
                activeView === 'config' ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⚙️ Configuración
            </button>
          </div>

          {/* Contenido dinámico */}
          <div className="mb-8">
            {activeView === 'products' && <ProductManager />}
            {activeView === 'notifications' && <NotificationsPanel />}
            {activeView === 'analytics' && <AdminDashboardPanel />} {/* ← NUEVA PESTAÑA */}
            {activeView === 'config' && <WhatsAppConfigPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ... el resto del código se mantiene igual
export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-cream">
        <p className="font-display text-2xl text-brand-brown animate-pulse">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  if (role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-cream">
        <p className="font-display text-2xl text-brand-brown">No tienes permiso para acceder a esta página.</p>
      </div>
    );
  }

  return <AdminDashboard />;
}