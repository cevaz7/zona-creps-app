// src/app/admin/page.tsx
"use client";

import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from "../../hooks/useUserRole";
import Header from "../../components/Header";
import ProductManager from '@/components/ProductManager';
import NotificationsPanel from '@/components/NotificationsPanel'; 
import { useState } from 'react'; 
import NotificationPermission from '@/components/NotificationPermission';
import AdminNotificationToast from '@/components/AdminNotificationToast';
import WhatsAppConfigPanel from '@/components/WhatsAppConfigPanel';
import AdminDashboardPanel from '@/components/AdminDashboardPanel'; 
import LoginModal from '@/components/LoginModal'; 

function AdminDashboard() {
  const [activeView, setActiveView] = useState<'products' | 'notifications' | 'config' | 'analytics'>('products'); 

  return (
    <div className="min-h-screen bg-brand-cream">
      <Header />
      <AdminNotificationToast />
      
      <div className="pt-24">
        <div className="container mx-auto px-4 mb-6">
          <NotificationPermission />
        </div>

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

          <div className="mb-8">
            {activeView === 'products' && <ProductManager />}
            {activeView === 'notifications' && <NotificationsPanel />}
            {activeView === 'analytics' && <AdminDashboardPanel />}
            {activeView === 'config' && <WhatsAppConfigPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-cream">
        <p className="font-display text-2xl text-brand-brown animate-pulse">Cargando...</p>
      </div>
    );
  }

  // Si no hay usuario, mostrar modal de login
  if (!user) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen bg-brand-cream">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-brand-brown mb-4">
              Panel de Administración
            </h1>
            <p className="text-gray-600 mb-6">Inicia sesión para acceder al panel</p>
            <button 
              onClick={() => setShowLoginModal(true)}
              className="bg-brand-red text-white py-3 px-6 rounded-lg font-bold hover:bg-red-700 transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
        
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </>
    );
  }

  // Verificar si es admin
  if (role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-cream">
        <div className="text-center">
          <h1 className="font-display text-2xl text-brand-brown mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            No tienes permisos de administrador para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}