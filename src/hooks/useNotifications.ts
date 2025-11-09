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
  
  // 🆕 ELIMINAR ESTADO DE ERROR DE STORAGE - NO LO NECESITAMOS
  const isInitializedRef = useRef<boolean>(false);
  const permissionWatchRef = useRef<any>(null);
  const lastPermissionRef = useRef<NotificationPermission>('default');

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

  // 🆕 INICIALIZACIÓN SIMPLIFICADA
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    console.log('🚀 Inicializando notificaciones...');

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
    
    console.log('🌐 Navegador:', browser);
    console.log('🔔 Permiso inicial:', initialPermission);

  }, [vapidKey]);

  // 🆕 REGISTRO DE SERVICE WORKER SUPER SIMPLIFICADO
  useEffect(() => {
    if (!isSupported || initialized) return;

    const registerServiceWorker = async () => {
      try {
        console.log('🔧 Registrando Service Worker...');
        
        // 🆕 ESTRATEGIA: NO LIMPIAR NADA - dejar que el navegador maneje el storage
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        
        // Solo desregistrar si hay conflictos
        if (existingRegistrations.length > 1) {
          console.log(`🧹 Encontrados ${existingRegistrations.length} SW - limpiando...`);
          for (const registration of existingRegistrations) {
            await registration.unregister();
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 🆕 REGISTRO SIMPLE SIN CONFIGURACIONES COMPLEJAS
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', FIREBASE_SW_CONFIG);
        console.log('✅ Service Worker registrado');

        setServiceWorkerRegistration(registration);
        setInitialized(true);
        
      } catch (error) {
        console.error('❌ Error registrando Service Worker:', error);
        // 🆕 NO DESACTIVAR SOPORTE - intentar de nuevo más tarde
        setTimeout(() => setInitialized(false), 5000);
      }
    };

    registerServiceWorker();
  }, [isSupported, initialized]);

  // 🆕 FUNCIÓN PARA OBTENER TOKEN SIN MANEJO DE ERRORES COMPLEJO
  const initializeMessaging = async () => {
    if (!isSupported || !vapidKey || !serviceWorkerRegistration || !initialized) return;
    
    const currentPermission = getSafeNotificationPermission();
    if (currentPermission !== 'granted') {
      setPermission(currentPermission);
      return;
    }

    try {
      const messaging = getMessaging(app);
      
      console.log('🎯 Obteniendo token FCM...');

      // 🆕 ESPERAR MÍNIMO TIEMPO NECESARIO
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (browserInfo?.userAgent?.includes('Brave')) {
        console.warn('⚠️ Brave bloquea FCM por defecto. Debes permitir los servicios de Google FCM en la configuración del navegador.');
        alert('⚠️ Brave bloquea las notificaciones push. Actívalas manualmente en Configuración → Escudos → Permitir servicios de Google FCM.');
        return;
      }

      // 🆕 OBTENER TOKEN SIN CONFIGURACIONES EXTRA
      const currentToken = await getToken(messaging, { 
        vapidKey,
        serviceWorkerRegistration
      });

      if (currentToken) {
        console.log('✅ Token FCM obtenido:', currentToken.substring(0, 20) + '...');
        setToken(currentToken);
        localStorage.setItem('fcm_token_debug', currentToken);
        await saveTokenToFirestore(currentToken);
      } else {
        console.log('❌ No se pudo obtener token FCM');
      }

      // Mensajes en primer plano
      onMessage(messaging, (payload) => {
        console.log('📨 Mensaje en primer plano:', payload);
        
        if (payload.notification && getSafeNotificationPermission() === 'granted') {
          const { title, body } = payload.notification;
          new Notification(title || 'Nuevo pedido', {
            body: body || 'Tienes un nuevo pedido',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png'
          });
        }
      });

    } catch (error) {
      // 🆕 MANEJO DE ERROR SUPER SIMPLIFICADO
      console.log('⚠️ Error obteniendo token:', error instanceof Error ? error.message : 'Error desconocido');
      
      // 🆕 NO HACER NADA - el error es probablemente temporal
      // El usuario puede intentar nuevamente solicitando permisos
    }
  };

  // INICIALIZAR MESSAGING CUANDO TODO ESTÉ LISTO
  useEffect(() => {
    if (isSupported && vapidKey && serviceWorkerRegistration && permission === 'granted' && initialized) {
      console.log('🚀 Iniciando messaging...');
      initializeMessaging();
    }
  }, [isSupported, vapidKey, serviceWorkerRegistration, permission, initialized]);

// 🆕 DETECTOR DE CAMBIOS DE PERMISOS (versión mejorada para Edge y Brave)
useEffect(() => {
  if (!isSupported) return;

    const checkPermissionChange = () => {
      const currentPermission = getSafeNotificationPermission();

      if (lastPermissionRef.current !== currentPermission) {
        console.log('🔍 Cambio de permisos detectado:', {
          anterior: lastPermissionRef.current,
          actual: currentPermission
        });

        // 🟢 Caso: usuario restauró permisos
        if (lastPermissionRef.current === 'denied' && currentPermission === 'granted') {
          console.log('🎉 Permisos restaurados — reiniciando Service Worker y token...');
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
              console.log('✅ Service Worker reinstalado después de cambio de permisos');

              setServiceWorkerRegistration(registration);
              setTimeout(() => {
                console.log('🎯 Reintentando obtener token...');
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
          console.log('🚫 Permisos revocados, eliminando token...');
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

  // 🆕 FUNCIÓN PARA SOLICITAR PERMISOS SIMPLIFICADA
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported || !vapidKey) {
      console.log('🚫 Notificaciones no disponibles');
      return false;
    }

    try {
      console.log('🔔 Solicitando permiso...');
      
      const currentPermission = getSafeNotificationPermission();
      
      if (currentPermission === 'granted') {
        console.log('✅ Permisos ya concedidos');
        setPermission('granted');
        
        if (!token && serviceWorkerRegistration) {
          console.log('🔄 Generando token...');
          await initializeMessaging();
        }
        return true;
      }
      
      const result = await Notification.requestPermission();
      console.log('📋 Resultado:', result);
      setPermission(result);
      lastPermissionRef.current = result;
      
      if (result === 'granted') {
        console.log('🎉 Permisos concedidos!');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (serviceWorkerRegistration) {
          await initializeMessaging();
        }
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.log('⚠️ Error solicitando permiso:', error);
      return false;
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
      
      console.log('✅ Token guardado en Firestore');
      localStorage.removeItem('pending_fcm_token');
      
    } catch (error) {
      console.error('❌ Error guardando token:', error);
      localStorage.setItem('fcm_token_backup', token);
    }
  };

  // 🆕 MANEJO DE AUTENTICACIÓN
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Usuario:', user ? `✅ ${user.email}` : '❌ No autenticado');
      setUser(user);
      
      if (user && token) {
        saveTokenToFirestore(token);
      }
    });

    return () => unsubscribe();
  }, [token]);

  // 🆕 RESET SIMPLIFICADO
  const hardReset = async (): Promise<boolean> => {
    console.log('🔄 Reiniciando sistema...');
    
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
      
      console.log('✅ Reset completado - recargando...');
      setTimeout(() => window.location.reload(), 1000);
      return true;
      
    } catch (error) {
      console.error('❌ Error en reset:', error);
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