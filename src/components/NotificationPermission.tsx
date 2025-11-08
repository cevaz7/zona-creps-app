// components/NotificationPermission.tsx - VERSIÓN PARA ESTADO BLOQUEADO
"use client";

import { useState, useEffect } from 'react';

export default function NotificationPermission() {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    // Verificar el estado actual al cargar
    setPermission(Notification.permission);
  }, []);

  const handleManualUnblock = () => {
    const isLocalhost = window.location.hostname === 'localhost';
    const site = isLocalhost ? 'localhost:3000' : window.location.hostname;
    
    const instructions = `
🔧 CÓMO DESBLOQUEAR NOTIFICACIONES PARA ${site.toUpperCase()}

1. HAZ CLIC en el CANDADO 🔒 en la barra de direcciones
   (está justo a la izquierda de: ${window.location.href})

2. Busca "Notificaciones" en la lista de permisos

3. Cambia de "BLOQUEAR" a "PERMITIR"

4. RECARGA la página (F5)

📍 Si no ves el candado, ve a:
   Configuración del Navegador > Privacidad > Configuración de sitios web > Notificaciones
   Y busca "${site}" en la lista
    `;
    
    // Usar confirm para que el usuario tenga que hacer clic en OK
    if (confirm(instructions)) {
      // Recargar después de que el usuario confirme
      window.location.reload();
    }
  };

  const handleTryAnyway = async () => {
    console.log('Intentando solicitar permisos aunque esté bloqueado...');
    try {
      const result = await Notification.requestPermission();
      console.log('Resultado del intento:', result);
      setPermission(result);
    } catch (error) {
      console.log('Error al intentar:', error);
    }
  };

  // Solo mostrar si está bloqueado
  if (permission !== 'denied') {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded shadow-lg">
        <div>
          <strong>🔔 Notificaciones Bloqueadas</strong>
          <p className="text-sm mt-1 mb-3">
            Has bloqueado las notificaciones para este sitio. Para recibir alertas de nuevos pedidos, necesitas desbloquearlas manualmente.
          </p>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={handleManualUnblock}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors text-sm"
            >
              📍 Desbloquear Manualmente
            </button>
            
            <button
              onClick={handleTryAnyway}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors text-sm"
            >
              Intentar de Todos Modos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}