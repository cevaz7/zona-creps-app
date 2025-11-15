// src/components/NotificationsPanel.tsx
"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, where, deleteDoc } from 'firebase/firestore';
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
  orderId?: string;
  items: any[];
  total: number;
  customerName: string;
  customerEmail?: string;
  customerId?: string;
  status: string;
  createdAt: any;
}

type FilterType = 'all' | 'pending' | 'completed' | 'unread';

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('unread');
  const [markingAll, setMarkingAll] = useState(false);

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

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const updatePromises = unreadNotifications.map(notif =>
        updateDoc(doc(db, 'notifications', notif.id), { read: true })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await updateDoc(doc(db, 'orders', orderId), {
      status: newStatus
    });
  };

  const deleteNotification = async (notificationId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      await deleteDoc(doc(db, 'notifications', notificationId));
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
      await deleteDoc(doc(db, 'orders', orderId));
    }
  };

  const clearAllReadNotifications = async () => {
    const readNotifications = notifications.filter(n => n.read);
    if (readNotifications.length === 0) {
      alert('No hay notificaciones leídas para eliminar');
      return;
    }
    
    if (confirm(`¿Estás seguro de que quieres eliminar todas las notificaciones leídas? (${readNotifications.length} notificaciones)`)) {
      const deletePromises = readNotifications.map(notif =>
        deleteDoc(doc(db, 'notifications', notif.id))
      );
      await Promise.all(deletePromises);
    }
  };

  // Estadísticas
  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'completed');

  // Filtrar contenido según el filtro activo
  const filteredContent = () => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'pending':
        return orders.filter(o => o.status === 'pending');
      case 'completed':
        return orders.filter(o => o.status === 'completed');
      default:
        // 🔥 MOSTRAR SOLO PEDIDOS EN "TODOS", NO NOTIFICACIONES
        return orders.sort((a, b) => 
          new Date(b.createdAt?.toDate()).getTime() - new Date(a.createdAt?.toDate()).getTime()
        );
    }
  };

  const content = filteredContent();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header con estadísticas y filtros */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-brown mb-4">📋 Gestión de Pedidos</h2>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-brand-cream rounded-lg p-4 text-center border-2 border-brand-light">
            <div className="text-2xl font-bold text-brand-brown">{orders.length}</div>
            <div className="text-sm text-brand-brown">Total Pedidos</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center border-2 border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{pendingOrders.length}</div>
            <div className="text-sm text-orange-600">Pendientes</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-200">
            <div className="text-2xl font-bold text-green-600">{completedOrders.length}</div>
            <div className="text-sm text-green-600">Completados</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center border-2 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
            <div className="text-sm text-blue-600">Notificaciones</div>
          </div>
        </div>

        {/* Filtros y acciones */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                activeFilter === 'all'
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📦 Todos los Pedidos
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                activeFilter === 'unread'
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔔 Notificaciones {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                activeFilter === 'pending'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🕐 Pendientes {pendingOrders.length > 0 && `(${pendingOrders.length})`}
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                activeFilter === 'completed'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✅ Completados
            </button>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && activeFilter === 'unread' && (
              <button
                onClick={markAllAsRead}
                disabled={markingAll}
                className="px-4 py-2 bg-brand-blue text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {markingAll ? 'Procesando...' : '📝 Marcar todo leído'}
              </button>
            )}
            
            {/* 🔥 BOTÓN PARA LIMPIAR NOTIFICACIONES LEÍDAS */}
            {notifications.filter(n => n.read).length > 0 && activeFilter === 'unread' && (
              <button
                onClick={clearAllReadNotifications}
                className="px-4 py-2 bg-gray-500 text-white rounded-full text-sm font-semibold hover:bg-gray-600 transition-colors"
              >
                🗑️ Limpiar leídas
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {content.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {activeFilter === 'all' && '📦'}
              {activeFilter === 'unread' && '🔔'}
              {activeFilter === 'pending' && '🕐'}
              {activeFilter === 'completed' && '✅'}
            </div>
            <p className="text-gray-500 text-lg">
              {activeFilter === 'all' && 'No hay pedidos registrados'}
              {activeFilter === 'unread' && 'No hay notificaciones sin leer'}
              {activeFilter === 'pending' && 'No hay pedidos pendientes'}
              {activeFilter === 'completed' && 'No hay pedidos completados'}
            </p>
          </div>
        ) : (
          content.map((item) => {
            // Es una notificación (solo aparece en filtro "unread")
            if ('read' in item) {
              const notif = item as Notification;
              return (
                <div 
                  key={notif.id} 
                  className={`p-4 border-2 rounded-xl transition-all relative group ${
                    notif.read 
                      ? 'bg-brand-cream border-brand-light' 
                      : 'bg-blue-50 border-brand-blue shadow-md'
                  }`}
                >
                  {/* 🔥 BOTÓN ELIMINAR NOTIFICACIÓN */}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                    title="Eliminar notificación"
                  >
                    ×
                  </button>
                  
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-brand-brown text-lg">{notif.title}</h4>
                        {!notif.read && (
                          <span className="bg-brand-red text-white text-xs px-2 py-1 rounded-full font-semibold">
                            NUEVO
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3">{notif.body}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-brand-brown">
                        <span>🛒 {notif.itemsCount} items</span>
                        <span>💰 ${notif.total.toFixed(2)}</span>
                        <span>🕐 {notif.createdAt?.toDate().toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="ml-4 bg-brand-blue text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                      >
                        Marcar leído
                      </button>
                    )}
                  </div>
                </div>
              );
            }
            
            // Es una orden (aparece en filtros "all", "pending", "completed")
            const order = item as Order;
            return (
              <div 
                key={order.id} 
                className={`p-4 border-2 rounded-xl relative group ${
                  order.status === 'pending' 
                    ? 'bg-orange-50 border-orange-300' 
                    : order.status === 'completed'
                    ? 'bg-green-50 border-green-300'
                    : 'bg-brand-cream border-brand-light'
                }`}
              >
                {/* 🔥 BOTÓN ELIMINAR PEDIDO */}
                <button
                  onClick={() => deleteOrder(order.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                  title="Eliminar pedido"
                >
                  ×
                </button>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-brand-brown text-lg">
                      Pedido #{(order.orderId || order.id).slice(-8)}
                    </h4>
                    <p className="text-sm text-gray-700">
                      👤 Cliente: <span className="font-semibold">{order.customerName}</span>
                    </p>
                    {order.customerEmail && (
                      <p className="text-xs text-gray-600">
                        📧 {order.customerEmail}
                      </p>
                    )}
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'pending' 
                      ? 'bg-orange-500 text-white'
                      : order.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}>
                    {order.status === 'pending' ? '🕐 PENDIENTE' : 
                     order.status === 'completed' ? '✅ COMPLETADO' : 
                     '❓ ' + order.status}
                  </span>
                </div>

                {/* Items del pedido */}
                <div className="mb-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-800">
                        {item.quantity}x {item.name}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <span className="text-xs text-brand-brown ml-2 font-medium">
                            ({Object.values(item.selectedOptions).join(', ')})
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-brand-brown">${item.totalPrice?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                  <div className="text-sm text-gray-700">
                    <span className="font-bold text-brand-brown text-lg">Total: ${order.total.toFixed(2)}</span>
                    <span className="mx-3">•</span>
                    <span>{order.createdAt?.toDate().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors"
                      >
                        ✅ Marcar Listo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}