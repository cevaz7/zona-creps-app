// hooks/useNotifications.ts - VERSIÓN SIN STORAGE ERROR
"use client";

import { useState, useEffect, useRef } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// 🆕 CONFIGURACIÓN PARA EVITAR STORAGE ERROR
const FIREBASE_SW_CONFIG = {
  scope: '/',
  updateViaCache: 'none' as ServiceWorkerUpdateViaCache
};

// 🆕 FUNCIÓN PARA OBTENER PERMISOS DE FORMA SEGURA
const getSafeNotificationPermission = (): NotificationPermission => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  return Notification.permission;
};

// 🆕 FUNCIÓN PARA OBTENER INFO DEL NAVEGADOR
const getBrowserInfo = () => {
  if (typeof window === 'undefined') {
    return { isEdge: false, isChrome: false, isFirefox: false, userAgent: '' };
  }
  
  const userAgent = navigator.userAgent;
  return {
    isEdge: /Edg\/|Edge\/\d+/i.test(userAgent),
    isChrome: /Chrome\/\d+/i.test(userAgent) && !/Edg\/|Edge\/\d+/i.test(userAgent),
    isFirefox: /Firefox\/\d+/i.test(userAgent),
    userAgent: userAgent
  };
};

export const useNotifications = () => {
  const [token, setToken] = useState<string>('');
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [user, setUser] = useState<any>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [browserInfo, setBrowserInfo] = useState<any>(null);
  const [needsUserInteraction, setNeedsUserInteraction] = useState<boolean>(false);
  
  
  const isInitializedRef = useRef<boolean>(false);
  const permissionWatchRef = useRef<any>(null);
  const lastPermissionRef = useRef<NotificationPermission>('default');

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

  
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    

    // Verificar compatibilidad básica
    const isNotificationSupported = 'Notification' in window;
    const isServiceWorkerSupported = 'serviceWorker' in navigator;
    const isPushManagerSupported = 'PushManager' in window;
    
    if (!isNotificationSupported || !isServiceWorkerSupported || !isPushManagerSupported || !vapidKey) {
      console.log('❌ Navegador no compatible o VAPID key faltante');
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    
    const browser = getBrowserInfo();
    setBrowserInfo(browser);
    
    const initialPermission = getSafeNotificationPermission();
    setPermission(initialPermission);
    lastPermissionRef.current = initialPermission;
    

  }, [vapidKey]);

  
  useEffect(() => {
    if (!isSupported || initialized) return;

    const registerServiceWorker = async () => {
      try {
       
        
        
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        
        
        if (existingRegistrations.length > 1) {
          
          for (const registration of existingRegistrations) {
            await registration.unregister();
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', FIREBASE_SW_CONFIG);
        

        setServiceWorkerRegistration(registration);
        setInitialized(true);
        
      } catch (error) {
        
        // 🆕 NO DESACTIVAR SOPORTE - intentar de nuevo más tarde
        setTimeout(() => setInitialized(false), 5000);
      }
    };

    registerServiceWorker();
  }, [isSupported, initialized]);

  const initializeMessaging = async () => {
    if (!isSupported || !vapidKey || !serviceWorkerRegistration || !initialized) return;

    const currentPermission = getSafeNotificationPermission();
    if (currentPermission !== 'granted') {
      setPermission(currentPermission);
      return;
    }

    try {
      const messaging = getMessaging(app);

      

      // 🧩 Detectar Brave y salir sin romper flujo
      const ua = navigator.userAgent.toLowerCase();
      const isBrave =
      ua.includes('brave') ||
      (typeof (navigator as any).brave !== 'undefined' &&
        (navigator as any).brave &&
        typeof (navigator as any).brave.isBrave === 'function');

      if (isBrave) {
        
        alert('⚠️ Brave bloquea las notificaciones push. Para activarlas, ve a Configuración → Escudos → Permitir servicios de Google FCM.');
        return;
      }

      // 🕐 Esperar un pequeño tiempo (soluciona el bug de Edge)
      await new Promise(r => setTimeout(r, 500));

      const currentToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration,
      });

      if (currentToken) {
        
        setToken(currentToken);
        localStorage.setItem('fcm_token_debug', currentToken);
        await saveTokenToFirestore(currentToken);
      } else {
        
      }

      // 📩 Escuchar mensajes en primer plano
      onMessage(messaging, (payload) => {
        

        if (payload.notification && getSafeNotificationPermission() === 'granted') {
          const { title, body } = payload.notification;
          new Notification(title || 'Nuevo pedido', {
            body: body || 'Tienes un nuevo pedido',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
          });
        }
      });

    } catch (error) {
      
      // Evita romper en Brave o Edge
      if (error instanceof Error && error.message.includes('messaging')) {
        alert('⚠️ No se pudo inicializar las notificaciones. Verifica los permisos del navegador.');
      }
    }
  };


  // INICIALIZAR MESSAGING CUANDO TODO ESTÉ LISTO
  useEffect(() => {
    if (isSupported && vapidKey && serviceWorkerRegistration && permission === 'granted' && initialized) {
      
      initializeMessaging();
    }
  }, [isSupported, vapidKey, serviceWorkerRegistration, permission, initialized]);

// 🆕 DETECTOR DE CAMBIOS DE PERMISOS (versión mejorada para Edge y Brave)
useEffect(() => {
  if (!isSupported) return;

    const checkPermissionChange = () => {
      const currentPermission = getSafeNotificationPermission();

      if (lastPermissionRef.current !== currentPermission) {
        

        // 🟢 Caso: usuario restauró permisos
        if (lastPermissionRef.current === 'denied' && currentPermission === 'granted') {
          
          setPermission('granted');
          setToken('');
          localStorage.removeItem('fcm_token_debug');

          // 🔄 Re-registrar el Service Worker completamente
          const reRegisterSW = async () => {
            try {
              const registrations = await navigator.serviceWorker.getRegistrations();
              for (const reg of registrations) await reg.unregister();
              await new Promise(r => setTimeout(r, 1000));

              const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', FIREBASE_SW_CONFIG);
              

              setServiceWorkerRegistration(registration);
              setTimeout(() => {
                
                initializeMessaging();
              }, 1500);
            } catch (err) {
              console.error('❌ Error al reinstalar SW:', err);
            }
          };

          reRegisterSW();
        }
        // 🔴 Caso: usuario revocó permisos
        else if (lastPermissionRef.current === 'granted' && currentPermission !== 'granted') {
          
          setPermission(currentPermission);
          setToken('');
          localStorage.removeItem('fcm_token_debug');
        }

        lastPermissionRef.current = currentPermission;
      }
    };

    // 👂 Monitorear cambios
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' })
        .then((notificationPerm) => {
          permissionWatchRef.current = notificationPerm;
          notificationPerm.onchange = checkPermissionChange;
        })
        .catch(() => {});
    }

    // Verificar periódicamente por seguridad
    const interval = setInterval(checkPermissionChange, 5000);
    return () => clearInterval(interval);
  }, [isSupported, serviceWorkerRegistration]);

   // 🔄 DETECTOR SIMPLE DE PERMISO → genera token al instante cuando cambia a "granted"
    useEffect(() => {
      if (!isSupported) return;

      const handlePermissionChange = () => {
        if (Notification.permission === "granted" && !token) {
          
          const messaging = getMessaging(app);
          getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY })
            .then((newToken) => {
              if (newToken) {
                
                setToken(newToken);
                saveTokenToFirestore(newToken);
              } else {
                console.warn("⚠️ No se pudo generar el token tras permitir notificaciones.");
              }
            })
            .catch((err) => console.error("❌ Error al regenerar token:", err));
        }
      };

      if ("permissions" in navigator && (navigator as any).permissions) {
        (navigator as any).permissions
          .query({ name: "notifications" })
          .then((permissionStatus: any) => {
            permissionStatus.onchange = handlePermissionChange;
          });
      } else {
        const interval = setInterval(() => {
          if (Notification.permission === "granted" && !token) {
            handlePermissionChange();
            clearInterval(interval);
          }
        }, 1000);
        return () => clearInterval(interval);
      }
    }, [token, isSupported]);

  const requestPermission = async () => {
    try {
      

      // 🧩 Detectar Brave
      const ua = navigator.userAgent.toLowerCase();
      const isBrave =
      ua.includes('brave') ||
      (typeof (navigator as any).brave !== 'undefined' &&
        (navigator as any).brave &&
        typeof (navigator as any).brave.isBrave === 'function');

      if (isBrave) {
        alert('⚠️ Brave bloquea las notificaciones push. Ve a Configuración → Escudos → Permitir servicios de Google FCM para activarlas.');
        return;
      }

      // 🧩 Detectar Edge (para evitar que se quede “cargando”)
      const isEdge = ua.includes('edg/');

      let permissionResult: NotificationPermission;

      // Edge y Chrome modernos
      if (Notification.requestPermission.length === 0) {
        // Algunos navegadores (Edge, Chrome nuevos) devuelven una Promise
        permissionResult = await Notification.requestPermission();
      } else {
        // Compatibilidad con Safari / Firefox
        permissionResult = await new Promise((resolve) =>
          Notification.requestPermission(resolve)
        );
      }

      
      setPermission(permissionResult);

      if (permissionResult === 'granted') {
        // ⚡️ Espera breve para permitir que se registre el permiso antes de continuar
        await new Promise((r) => setTimeout(r, isEdge ? 600 : 300));
        await initializeMessaging();
      } else if (permissionResult === 'denied') {
        alert('🚫 Has denegado las notificaciones. Puedes habilitarlas desde la configuración del navegador.');
      } else {
        console.warn('ℹ️ Permiso de notificaciones no otorgado.');
      }
    } catch (error) {
      console.error('❌ Error solicitando permiso:', error);
      alert('⚠️ Ocurrió un error al solicitar permisos. Intenta nuevamente o revisa la configuración del navegador.');
    }
  };

  // 🆕 FUNCIÓN PARA GUARDAR TOKEN
  const saveTokenToFirestore = async (token: string) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        localStorage.setItem('pending_fcm_token', token);
        return;
      }

      const tokenRef = doc(db, 'adminTokens', currentUser.uid);
      await setDoc(tokenRef, {
        token: token,
        userId: currentUser.uid,
        email: currentUser.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        userAgent: navigator.userAgent,
        browser: browserInfo?.isEdge ? 'edge' : browserInfo?.isChrome ? 'chrome' : 'other'
      }, { merge: true });
      
      
      localStorage.removeItem('pending_fcm_token');
      
    } catch (error) {
      
      localStorage.setItem('fcm_token_backup', token);
    }
  };

  // 🆕 MANEJO DE AUTENTICACIÓN
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      
      setUser(user);
      
      if (user && token) {
        saveTokenToFirestore(token);
      }
    });

    return () => unsubscribe();
  }, [token]);

  // 🆕 RESET SIMPLIFICADO
  const hardReset = async (): Promise<boolean> => {
    
    
    // Resetear estados
    setToken('');
    setPermission('default');
    setInitialized(false);
    setServiceWorkerRegistration(null);
    setIsSupported(true);
    
    // Resetear refs
    isInitializedRef.current = false;
    lastPermissionRef.current = 'default';

    try {
      // Limpiar Service Workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) await reg.unregister();
      
      // Limpiar solo items de FCM
      const fcmItems = ['fcm_token_debug', 'pending_fcm_token', 'fcm_token_backup'];
      fcmItems.forEach(key => localStorage.removeItem(key));
      
      
      setTimeout(() => window.location.reload(), 1000);
      return true;
      
    } catch (error) {
      
      return false;
    }
  };

  return { 
    token, 
    permission, 
    isSupported,
    requestPermission,
    user,
    needsUserInteraction,
    browserInfo,
    hardReset
  };
};