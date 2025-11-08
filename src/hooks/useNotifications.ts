// hooks/useNotifications.ts - VERSIÓN SIMPLIFICADA
import { useState, useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getAuth } from 'firebase/auth';

export const useNotifications = () => {
  const [token, setToken] = useState<string>('');
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Verificar soporte básico
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      setIsSupported(false);
    }
  }, []);

  const saveTokenToFirestore = async (token: string) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        const tokenRef = doc(db, 'adminTokens', user.uid);
        await setDoc(tokenRef, {
          token: token,
          userId: user.uid,
          email: user.email,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('✅ Token guardado en Firestore');
      }
    } catch (error) {
      console.error('❌ Error guardando token:', error);
    }
  };

  useEffect(() => {
    if (!isSupported) return;

    try {
      const messaging = getMessaging(app);
      
      // Verificar permiso actual
      setPermission(Notification.permission);

      // Si ya tiene permiso, obtener token
      if (Notification.permission === 'granted') {
        getToken(messaging, {
          vapidKey: 'BM92kyC8cQPFwOS0gdjOKABweGe7fsomMquV8W8g0GNnNhxZ75WhzmQ-SS2oAmNYfLncboH-1CCE3KCYING5Yws'
        }).then((currentToken) => {
          if (currentToken) {
            setToken(currentToken);
            saveTokenToFirestore(currentToken);
          }
        });
      }

      // Escuchar mensajes en primer plano
      onMessage(messaging, (payload) => {
        console.log('📦 Notificación recibida:', payload);
        
        if (payload.notification && Notification.permission === 'granted') {
          const { title, body } = payload.notification;
          new Notification(title || 'Nuevo pedido', {
            body: body || 'Tienes un nuevo pedido',
            icon: '/icon-192x192.png'
          });
        }
      });

    } catch (error) {
      console.error('❌ Error en notificaciones:', error);
      setIsSupported(false);
    }
  }, [isSupported]);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        const messaging = getMessaging(app);
        const currentToken = await getToken(messaging, {
          vapidKey: 'BM92kyC8cQPFwOS0gdjOKABweGe7fsomMquV8W8g0GNnNhxZ75WhzmQ-SS2oAmNYfLncboH-1CCE3KCYING5Yws'
        });
        
        if (currentToken) {
          setToken(currentToken);
          await saveTokenToFirestore(currentToken);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error solicitando permiso:', error);
      return false;
    }
  };

  return { 
    token, 
    permission, 
    isSupported,
    requestPermission 
  };
};