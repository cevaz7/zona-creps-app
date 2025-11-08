/// components/NotificationPermission.tsx - VERSIÓN CORREGIDA PARA SSR
"use client";

import { useState, useEffect } from 'react';

export default function NotificationPermission() {
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [showInstructions, setShowInstructions] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // 🆕 VERIFICAR EN EL CLIENTE SOLAMENTE
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!isSupported) return;
    
    console.log('🔔 Solicitando permisos...');
    
    try {
      const result = await Notification.requestPermission();
      console.log('📋 Usuario respondió:', result);
      setPermission(result);
      
      if (result === 'granted') {
        console.log('🎉 Notificaciones activadas!');
        setShowInstructions(false);
      } else if (result === 'default') {
        setShowInstructions(true);
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  const handleWithInstructions = () => {
    const instructions = `
🎯 CÓMO ACTIVAR NOTIFICACIONES CORRECTAMENTE:

1. Haz clic en "ACTIVAR NOTIFICACIONES" 
2. ESPERA - aparecerá un POPUP del NAVEGADOR
3. NO lo cierres - busca estos botones:

   ✅ [ PERMITIR ] [ ALLOW ] [ PERMITIR ] ✅

4. Haz clic específicamente en "PERMITIR" o "ALLOW"

⚠️  Si cierras el popup o haces clic fuera, se cancela.
    `;
    
    if (confirm(instructions)) {
      handleRequestPermission();
    }
  };

  // 🆕 NO RENDERIZAR SI NO ES COMPATIBLE O YA ESTÁ CONCEDIDO
  if (!isSupported || permission === 'granted') {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg">
        <div>
          <strong>🔔 Notificaciones de Pedidos</strong>
          <p className="text-sm mt-1 mb-3">
            Recibe alertas instantáneas cuando lleguen nuevos pedidos
          </p>
          
          {showInstructions && (
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded mb-3 text-sm">
              ⚠️ <strong>¿No viste el popup?</strong><br/>
              Busca y haz clic en <strong>"PERMITIR"</strong>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <button
              onClick={handleWithInstructions}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm"
            >
              🔔 Activar Notificaciones
            </button>
            
            {permission === 'denied' && (
              <p className="text-xs text-red-600 text-center">
                ❌ Notificaciones bloqueadas
              </p>
            )}
            
            {permission === 'default' && (
              <p className="text-xs text-gray-600 text-center">
                Estado: Esperando tu respuesta
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}