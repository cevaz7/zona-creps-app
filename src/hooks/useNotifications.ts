// hooks/useNotifications.ts
import { useState, useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getAuth } from 'firebase/auth';

export const useNotifications = () => {
  const [token, setToken] = useState<string>('');

  const saveTokenToFirestore = async (token: string) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        // Guardar token asociado al usuario admin actual
        const tokenRef = doc(db, 'adminTokens', user.uid);
        await setDoc(tokenRef, {
          token: token,
          userId: user.uid,
          email: user.email,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('Token guardado en Firestore');
      }
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  };

  useEffect(() => {
    const requestPermission = async () => {
      // Verificar si el navegador soporta Service Worker y Notifications
      if (!('serviceWorker' in navigator) || !('Notification' in window)) {
        console.log('Este navegador no soporta notificaciones');
        return;
      }

      try {
        const messaging = getMessaging(app);
        
        // Solicitar permiso
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Permiso de notificación concedido');
          
          // Obtener token - REEMPLAZA 'TU_VAPID_KEY' con tu clave real
          const currentToken = await getToken(messaging, {
            vapidKey: 'BM92kyC8cQPFwOS0gdjOKABweGe7fsomMquV8W8g0GNnNhxZ75WhzmQ-SS2oAmNYfLncboH-1CCE3KCYING5Yws' // 👈 Reemplaza esto
          });
          
          if (currentToken) {
            setToken(currentToken);
            console.log('Token FCM:', currentToken);
            
            // Guardar token en Firestore para este usuario admin
            await saveTokenToFirestore(currentToken);
          } else {
            console.log('No se pudo obtener el token');
          }
        } else {
          console.log('Permiso de notificación denegado');
        }
      } catch (error) {
        console.error('Error al solicitar permisos:', error);
      }
    };

    requestPermission();
  }, []);

  return { token };
};