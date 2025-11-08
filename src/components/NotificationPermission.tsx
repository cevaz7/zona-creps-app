// components/NotificationPermission.tsx - VERSIÓN QUE SOLO MUESTRA CUANDO FUNCIONA
"use client";

import { useState, useEffect } from 'react';

export default function NotificationPermission() {
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [popupWorks, setPopupWorks] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // 🆕 VERIFICAR SI LOS POPUPS FUNCIONAN
      checkPopupSupport();
    }
  }, []);

  const checkPopupSupport = async () => {
    try {
      // Test rápido para ver si requestPermission funciona
      const testPermission = await Promise.race([
        Notification.requestPermission(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 100))
      ]);
      
      // Si llegamos aquí, los popups SÍ funcionan
      setPopupWorks(true);
      console.log('✅ Popups de permisos funcionan');
    } catch (error) {
      // Si hay timeout o error, los popups NO funcionan
      setPopupWorks(false);
      console.log('❌ Popups de permisos no funcionan:', error);
    }
  };

  const handleSimpleRequest = async () => {
    if (!isSupported) return;
    
    console.log('🎯 Intentando solicitar permisos...');
    
    try {
      const result = await Notification.requestPermission();
      console.log('📋 Resultado:', result);
      setPermission(result);
      
      if (result === 'granted') {
        console.log('🎉 Notificaciones activadas!');
      }
    } catch (error) {
      console.log('❌ Error:', error);
    }
  };

  const handleManualConfig = () => {
    alert(`🔧 CONFIGURACIÓN MANUAL - El popup no aparece automáticamente

Para activar notificaciones manualmente:

1. Haz clic en el CANDADO 🔒 en: ${window.location.href}
2. Busca "Notificaciones" 
3. Cambia a "PERMITIR"
4. Recarga la página

O ve a:
Configuración del navegador > Privacidad > Notificaciones
y activa este sitio.`);
  };

  // 🆕 SOLO MOSTRAR SI:
  // - Es compatible
  // - No está ya concedido
  // - Los popups funcionan O estamos en producción
  const shouldShow = isSupported && 
                    permission !== 'granted' && 
                    (popupWorks || window.location.hostname !== 'localhost');

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔔</span>
            <strong>Notificaciones</strong>
          </div>
          
          <p className="text-sm mb-3">
            Activa para alertas de nuevos pedidos
          </p>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSimpleRequest}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm"
            >
              Activar Notificaciones
            </button>
            
            {!popupWorks && (
              <button
                onClick={handleManualConfig}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors text-sm"
              >
                Configurar Manualmente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}