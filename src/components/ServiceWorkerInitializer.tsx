// src/components/ServiceWorkerInitializer.tsx
"use client";
import { useEffect } from 'react';

export default function ServiceWorkerInitializer() {
  useEffect(() => {
    const registerSW = async () => {
      // 🆕 VERIFICAR SI ES LOCALHOST (OPCIONAL)
      if (window.location.hostname === 'localhost') {
        
        // Puedes comentar esta línea si quieres probar en localhost
        // return;
      }
      
      // Verificar compatibilidad
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('❌ Navegador no compatible con notificaciones push');
        return;
      }

      try {
        
        
        // Registrar Service Worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        
        
        
        // Verificar permisos push
        const permission = await registration.pushManager.permissionState({userVisibleOnly: true});
        
        
        if (permission === 'granted') {
          
          
          // ENVIAR CONFIGURACIÓN SEGURA A FIREBASE
          registration.active?.postMessage({
            type: 'CONFIGURAR_FIREBASE',
            config: {
              apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
              authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
              storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
              messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
              appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
            }
          });
        } else {
          
        }
        
        // Manejar actualizaciones del Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                console.log('🔄 Nueva versión del Service Worker activada');
              }
            });
          }
        });
        
      } catch (error) {
        console.error('❌ Error registrando Service Worker:', error);
      }
    };

    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      registerSW();
    }
  }, []);

  return null;
}