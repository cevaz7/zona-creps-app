// components/NotificationPermission.tsx - VERSIÓN MEJORADA
"use client";

import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationPermission() {
  const { token, permission, isSupported, requestPermission } = useNotifications();

  // 🆕 MANEJAR EL CASO DE PERMISOS BLOQUEADOS
  const handleUnblockInstructions = () => {
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isEdge = /Edg/.test(navigator.userAgent);
    
    let instructions = '';
    
    if (isChrome || isEdge) {
      instructions = `
1. Haz clic en el candado 🔒 en la barra de direcciones
2. En "Notificaciones", cambia a "Permitir"
3. Recarga la página
      `;
    } else if (isFirefox) {
      instructions = `
1. Haz clic en el ícono ⓘ en la barra de direcciones
2. En "Permisos", cambia "Notificaciones" a "Permitir"
3. Recarga la página
      `;
    } else {
      instructions = `
1. Ve a Configuración > Privacidad y seguridad > Configuración de sitios web > Notificaciones
2. Encuentra este sitio y cambia a "Permitir"
3. Recarga la página
      `;
    }
    
    alert(`Para activar notificaciones:\n\n${instructions}`);
  };

  if (!isSupported) {
    return null; // Ocultar si no es compatible
  }

  if (permission === 'granted' && token) {
    return null; // Ocultar si ya está activado
  }

  if (permission === 'denied') {
    return (
      <div className="fixed top-20 right-4 z-50 max-w-sm">
        <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <strong>🔔 Notificaciones Bloqueadas</strong>
              <p className="text-sm">Debes desbloquearlas manualmente</p>
            </div>
            <button
              onClick={handleUnblockInstructions}
              className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition-colors text-sm"
            >
              ¿Cómo?
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Solo mostrar el botón si el permiso es "default" (no decidido)
  if (permission === 'default') {
    return (
      <div className="fixed top-20 right-4 z-50 max-w-sm">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <strong>🔔 Notificaciones Push</strong>
              <p className="text-sm">Recibe notificaciones de nuevos pedidos</p>
            </div>
            <button
              onClick={requestPermission}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm"
            >
              Activar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}