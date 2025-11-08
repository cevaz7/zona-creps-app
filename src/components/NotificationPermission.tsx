// components/NotificationPermission.tsx - VERSIÓN QUE FORZA EL POPUP VISIBLE
"use client";

import { useState, useEffect } from 'react';

export default function NotificationPermission() {
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!isSupported) return;
    
    console.log('🎯 Iniciando solicitud de permisos...');
    
    // 🆕 CREAR UN ELEMENTO QUE MANTENGA EL FOCO
    const focusElement = document.createElement('button');
    focusElement.textContent = 'Manteniendo foco...';
    focusElement.style.position = 'fixed';
    focusElement.style.top = '0';
    focusElement.style.left = '0';
    focusElement.style.opacity = '0';
    focusElement.style.zIndex = '10000';
    document.body.appendChild(focusElement);
    focusElement.focus();
    
    try {
      // 🆕 AGREGAR RETRASO PARA ASEGURAR QUE EL POPUP SE VEA
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await Notification.requestPermission();
      console.log('📋 Resultado después del retraso:', result);
      setPermission(result);
      
      if (result === 'granted') {
        console.log('🎉 Notificaciones activadas!');
        alert('✅ ¡Notificaciones activadas correctamente!');
      } else if (result === 'default') {
        console.log('⚠️ Popup cerrado sin decidir');
        alert(`❌ El popup se cerró sin decidir.

PARA ACTIVAR CORRECTAMENTE:
1. Haz clic en "Activar Notificaciones"
2. ESPERA - busca el POPUP del navegador
3. NO lo cierres - busca el botón "PERMITIR"
4. Haz clic específicamente en "PERMITIR"

El popup SÍ está apareciendo, pero se cierra muy rápido.`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      // Limpiar el elemento de foco
      document.body.removeChild(focusElement);
    }
  };

  // No mostrar si no es compatible o ya está concedido
  if (!isSupported || permission === 'granted') {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔔</span>
            <strong>Notificaciones de Pedidos</strong>
          </div>
          
          <p className="text-sm mb-3">
            Activa para recibir alertas instantáneas de nuevos pedidos
          </p>
          
          <button
            onClick={handleRequestPermission}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors text-sm font-medium w-full"
          >
            Activar Notificaciones
          </button>
          
          <p className="text-xs text-gray-600 text-center mt-2">
            Estado: {permission === 'default' ? 'Listo para activar' : 'Bloqueado'}
          </p>
        </div>
      </div>
    </div>
  );
}