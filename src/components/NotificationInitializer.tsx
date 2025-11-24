// components/NotificationInitializer.tsx
"use client";
import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationInitializer() {
  const { token, permission, isSupported } = useNotifications();

  useEffect(() => {
   
    
    if (token) {
      
    }
    
    if (!isSupported) {
      
    }
  }, [token, permission, isSupported]);

  // Este componente no renderiza nada visualmente
  return null;
}