// components/NotificationPermission.tsx - SOLO PARA PRODUCCIÓN REAL
"use client";

import { useState, useEffect } from 'react';

export default function NotificationPermission() {
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // 🆕 SOLO ACTIVAR EN PRODUCCIÓN REAL
      const isProd = window.location.hostname === 'zona-creps-app.vercel.app';
      setIsProduction(isProd);
      
      console.log('🌍 Entorno:', isProd ? 'Producción REAL' : 'Desarrollo/Testing');
      console.log('🔔 Permisos:', Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!isSupported || !isProduction) return;
    
    console.log('🚀 Solicitando permisos en PRODUCCIÓN REAL...');
    
    try {
      const result = await Notification.requestPermission();
      console.log('📋 Usuario en producción respondió:', result);
      setPermission(result);
      
      if (result === 'granted') {
        console.log('🎉 Notificaciones activadas en producción!');
      } else if (result === 'default') {
        console.log('ℹ️ Usuario en producción cerró el popup');
      }
    } catch (error) {
      console.error('❌ Error en producción:', error);
    }
  };

  // 🆕 SOLO MOSTRAR EN PRODUCCIÓN REAL
  if (!isSupported || !isProduction || permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔔</span>
            <strong>Notificaciones de Pedidos</strong>
          </div>
          
          <p className="text-sm mb-3">
            Activa para recibir alertas de nuevos pedidos
          </p>
          
          <button
            onClick={handleRequestPermission}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors text-sm font-medium w-full"
          >
            Activar Notificaciones
          </button>
        </div>
      </div>
    </div>
  );
}