// components/NotificationPermission.tsx - VERSIÓN CORREGIDA DEFINITIVA
"use client";

import { useState, useEffect } from 'react';

export default function NotificationPermission() {
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      console.log('🔔 Estado inicial de permisos:', Notification.permission);
    }
  }, []);

  // 🎯 MANEJADOR CORREGIDO - MÉTODO QUE SÍ FUNCIONA
  const handleActivateNotifications = () => {
    if (!isSupported || isRequesting) return;
    
    console.log('🎯 Iniciando solicitud de permisos...');
    setIsRequesting(true);
    
    // 🆕 MÉTODO DIRECTO - SIN ASYNC/AWAIT INTERNO
    const permissionPromise = Notification.requestPermission();
    
    permissionPromise
      .then((result) => {
        console.log('✅ Solicitud completada. Resultado:', result);
        setPermission(result);
        
        if (result === 'granted') {
          console.log('🎉 Notificaciones activadas correctamente!');
          // Aquí podrías registrar el token FCM si usas Firebase
        } else if (result === 'default') {
          console.log('ℹ️ Usuario cerró el popup sin decidir');
        }
      })
      .catch((error) => {
        console.error('❌ Error en la solicitud:', error);
      })
      .finally(() => {
        setIsRequesting(false);
      });
  };

  const handleManualInstructions = () => {
    alert(`🔧 ACTIVACIÓN MANUAL - Alternativa

Si el popup no aparece, puedes activar manualmente:

1. Haz clic en el CANDADO 🔒 en la barra de direcciones
2. Busca "Notificaciones" en los permisos
3. Cambia a "PERMITIR" 
4. Recarga la página

📍 ${window.location.href}`);
  };

  // No mostrar si no es compatible o ya está concedido
  if (!isSupported || permission === 'granted') {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div className="bg-gradient-to-r from-blue-100 to-green-100 border border-blue-300 px-4 py-3 rounded-lg shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔔</span>
            <strong className="text-gray-800">Notificaciones de Pedidos</strong>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            Activa para recibir alertas instantáneas cuando lleguen nuevos pedidos
          </p>
          
          <div className="space-y-2">
            <button
              onClick={handleActivateNotifications}
              disabled={isRequesting}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-medium disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-md"
            >
              {isRequesting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Solicitando...
                </span>
              ) : (
                '🚀 Activar Notificaciones'
              )}
            </button>
            
            <button
              onClick={handleManualInstructions}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors text-sm"
            >
              🔧 Instrucciones Manuales
            </button>
          </div>
          
          <div className="mt-3 text-xs text-gray-500 text-center">
            {permission === 'default' && '✅ Listo para activar'}
            {permission === 'denied' && '❌ Notificaciones bloqueadas'}
            {isRequesting && '🔄 Esperando respuesta...'}
          </div>
        </div>
      </div>
    </div>
  );
}