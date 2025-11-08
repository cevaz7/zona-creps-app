// src/components/NotificationsPanel.tsx
"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  orderId: string;
  total: number;
  itemsCount: number;
  read: boolean;
  createdAt: any;
  sentTo: string;
}

interface Order {
  id: string;
  items: any[];
  total: number;
  customerName: string;
  status: string;
  createdAt: any;
}

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'notifications' | 'orders'>('notifications');

  // Escuchar notificaciones en tiempo real
  useEffect(() => {
    const q = query(
      collection(db, 'notifications'), 
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, []);

  // Escuchar órdenes en tiempo real
  useEffect(() => {
    const q = query(
      collection(db, 'orders'), 
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ords = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      setOrders(ords);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (notificationId: string) => {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await updateDoc(doc(db, 'orders', orderId), {
      status: newStatus
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header con tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'notifications'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          🔔 Notificaciones
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-6 text-center">
              {unreadCount}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📋 Todos los Pedidos
          {pendingOrders.length > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-1 min-w-6 text-center">
              {pendingOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Contenido de Notificaciones */}
      {activeTab === 'notifications' && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay notificaciones
            </p>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 border rounded-lg transition-all ${
                  notif.read 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{notif.title}</h4>
                      {!notif.read && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{notif.body}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>🛒 {notif.itemsCount} items</span>
                      <span>💰 ${notif.total.toFixed(2)}</span>
                      <span>🕐 {notif.createdAt?.toDate().toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="ml-4 text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Marcar leído
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Contenido de Órdenes */}
      {activeTab === 'orders' && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {orders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay pedidos
            </p>
          ) : (
            orders.map((order) => (
              <div 
                key={order.id} 
                className={`p-4 border rounded-lg ${
                  order.status === 'pending' 
                    ? 'bg-orange-50 border-orange-200' 
                    : order.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Pedido #{order.id.substring(0, 8)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Cliente: {order.customerName || 'No especificado'}
                    </p>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'pending' 
                      ? 'bg-orange-500 text-white'
                      : order.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}>
                    {order.status === 'pending' ? '🕐 Pendiente' : 
                     order.status === 'completed' ? '✅ Completado' : 
                     '❓ ' + order.status}
                  </span>
                </div>

                {/* Items del pedido */}
                <div className="mb-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm py-1">
                      <span>
                        {item.quantity}x {item.name}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({Object.values(item.selectedOptions).join(', ')})
                          </span>
                        )}
                      </span>
                      <span className="font-semibold">${item.totalPrice?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t pt-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Total: ${order.total.toFixed(2)}</span>
                    <span className="mx-2">•</span>
                    <span>{order.createdAt?.toDate().toLocaleString()}</span>
                  </div>
                  
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      Marcar como Listo
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}