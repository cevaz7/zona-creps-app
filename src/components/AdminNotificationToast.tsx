"use client";

import { useState, useEffect } from 'react';

interface NotificationData {
  title: string;
  body: string;
  orderId: string;
  total: number;
}

export default function AdminNotificationToast() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    console.log('🔔 [Toast] Componente montado - escuchando notificaciones');

    const broadcastChannel = new BroadcastChannel('admin_notifications');

    const handleNewNotification = (notificationData: any) => {
      console.log('🔔 [Toast] Nueva notificación recibida:', notificationData);
      
      const newNotification: NotificationData = {
        title: notificationData.title || '¡Nuevo Pedido! 🎉',
        body: notificationData.body || 'Tienes un nuevo pedido',
        orderId: notificationData.orderId || 'unknown',
        total: notificationData.total || 0
      };

      console.log('🔔 [Toast] Mostrando notificación:', newNotification);
      
      setNotifications(prev => [...prev, newNotification]);

      // Auto-remover después de 8 segundos
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n !== newNotification));
      }, 8000);
    };

    const handleMessage = (event: any) => {
      console.log('🔔 [Toast] Mensaje recibido:', event.data);
      
      if (event.data.type === 'NEW_ORDER') {
        handleNewNotification(event.data.data);
      }
    };

    broadcastChannel.addEventListener('message', handleMessage);
    
    console.log('🔔 [Toast] Escuchando notificaciones de otras pestañas');

    return () => {
      broadcastChannel.removeEventListener('message', handleMessage);
      broadcastChannel.close();
      console.log('🔔 [Toast] Dejando de escuchar notificaciones');
    };
  }, []);

  const removeNotification = (notification: NotificationData) => {
    setNotifications(prev => prev.filter(n => n !== notification));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification, index) => (
        <div 
          key={`${notification.orderId}-${index}`}
          className="bg-green-500 text-white p-4 rounded-lg shadow-lg border-l-4 border-green-600 animate-in slide-in-from-right duration-500"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-bold text-lg">{notification.title}</h4>
              <p className="text-sm mt-1">{notification.body}</p>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span>🆔 #{notification.orderId.substring(0, 8)}</span>
                <span>💰 ${notification.total.toFixed(2)}</span>
                <span>🕐 {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <button 
              onClick={() => removeNotification(notification)}
              className="ml-2 text-white hover:text-green-200 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}