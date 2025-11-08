// components/NotificationPermission.tsx
"use client";

import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationPermission() {
  const { token, permission, isSupported, requestPermission } = useNotifications();

  if (!isSupported) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        ⚠️ Tu navegador no soporta notificaciones push
      </div>
    );
  }

  if (permission === 'granted' && token) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        ✅ Notificaciones push activadas
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        ❌ Notificaciones bloqueadas. Por favor, permite las notificaciones en la configuración de tu navegador.
      </div>
    );
  }

  return (
    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
      <div className="flex justify-between items-center">
        <div>
          <strong>🔔 Notificaciones Push</strong>
          <p className="text-sm">Recibe notificaciones instantáneas cuando lleguen nuevos pedidos</p>
        </div>
        <button
          onClick={requestPermission}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Activar
        </button>
      </div>
    </div>
  );
}