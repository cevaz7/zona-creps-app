// components/NotificationInitializer.tsx
"use client";
import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationInitializer() {
  const { token, permission, isSupported } = useNotifications();

  useEffect(() => {
    console.log('🎯 NOTIFICATION HOOK INICIALIZADO:');
    console.log('📱 isSupported:', isSupported);
    console.log('🔔 permission:', permission);
    console.log('🔑 token:', token ? '✅ OBTENIDO' : '❌ NO OBTENIDO');
    
    if (token) {
      console.log('🔑 Token completo:', token);
    }
    
    if (!isSupported) {
      console.log('❌ Notificaciones no soportadas');
    }
  }, [token, permission, isSupported]);

  // Este componente no renderiza nada visualmente
  return null;
}