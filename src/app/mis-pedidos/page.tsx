// src/app/mis-pedidos/page.tsx
"use client";

import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserOrdersPanel from '@/components/UserOrdersPanel';
import LoginModal from '@/components/LoginModal';
import { useState } from 'react';

export default function MisPedidosPage() {
  const { user, loading: authLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-cream">
        <p className="font-display text-2xl text-brand-brown animate-pulse">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        {!user ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-brand-brown mb-4">
                Acceso Requerido
              </h2>
              <p className="text-gray-600 mb-6">
                Inicia sesión para ver tu historial de pedidos
              </p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-brand-red text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-colors"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        ) : (
          <UserOrdersPanel />
        )}
      </main>

      <Footer />

      {/* Modal de Login */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}