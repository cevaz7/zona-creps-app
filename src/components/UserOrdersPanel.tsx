// src/components/UserOrdersPanel.tsx
"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { auth } from '../../firebase/config';
import Image from 'next/image';

interface Order {
  id: string;
  orderId?: string;
  items: any[];
  total: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod?: string;
  notes?: string;
  status: string;
  createdAt: any;
}

export default function UserOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Cargar órdenes del usuario actual en tiempo real
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const ordersRef = collection(db, 'orders');
    // Filtrar solo las órdenes del usuario actual por email
    const q = query(
      ordersRef, 
      where('customerEmail', '==', currentUser.email),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error cargando pedidos:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Función para formatear fechas
  const formatDate = (date: any): string => {
    if (!date) return 'N/A';
    
    try {
      if (date.toDate && typeof date.toDate === 'function') {
        return date.toDate().toLocaleString();
      }
      if (date instanceof Date) {
        return date.toLocaleString();
      }
      return new Date(date).toLocaleString();
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };

  // Filtrar órdenes según el filtro activo
  const filteredOrders = orders.filter(order => 
    activeFilter === 'all' || order.status === activeFilter
  );

  // Estadísticas del usuario
  const userStats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(order => order.status === 'pending').length,
    completedOrders: orders.filter(order => order.status === 'completed').length,

  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const currentUser = auth.currentUser;

  if (!currentUser) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-bold text-brand-brown mb-2">Inicia sesión</h3>
        <p className="text-gray-600">Debes iniciar sesión para ver tus pedidos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-brand-brown mb-4">📦 Mis Pedidos</h2>
        
        {/* Estadísticas del usuario */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-brand-cream rounded-lg p-4 text-center border-2 border-brand-light">
            <div className="text-2xl font-bold text-brand-brown">{userStats.totalOrders}</div>
            <div className="text-sm text-brand-brown">Total Pedidos</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center border-2 border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{userStats.pendingOrders}</div>
            <div className="text-sm text-orange-600">Pendientes</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-200">
            <div className="text-2xl font-bold text-green-600">{userStats.completedOrders}</div>
            <div className="text-sm text-green-600">Completados</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
              activeFilter === 'all'
                ? 'bg-brand-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
              activeFilter === 'pending'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendientes ({userStats.pendingOrders})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
              activeFilter === 'completed'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completados ({userStats.completedOrders})
          </button>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-bold text-brand-brown mb-2">
              {orders.length === 0 ? 'Aún no tienes pedidos' : 'No hay pedidos con este filtro'}
            </h3>
            <p className="text-gray-600">
              {orders.length === 0 
                ? '¡Haz tu primer pedido y aparecerá aquí!' 
                : 'Intenta con otro filtro para ver más pedidos'
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-l-brand-blue">
              {/* Header del pedido */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-brand-brown">
                    Pedido #{(order.orderId || order.id).slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Realizado el {formatDate(order.createdAt)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.status === 'pending' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {order.status === 'pending' ? '🕐 PENDIENTE' : '✅ COMPLETADO'}
                </span>
              </div>

              {/* Información del pedido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Método de pago:</strong> {order.paymentMethod || 'No especificado'}
                  </p>
                  {order.notes && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Notas:</strong> {order.notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-red">
                    ${order.total.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} productos
                  </p>
                </div>
              </div>

              {/* Items del pedido */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-brand-brown mb-3">Productos:</h4>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      {item.imageUrl && (
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 relative rounded-lg overflow-hidden">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-semibold text-brand-blue">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-bold text-brand-brown">
                            ${item.totalPrice?.toFixed(2)}
                          </span>
                        </div>
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="text-xs text-gray-600 mt-1">
                            {Object.entries(item.selectedOptions).map(([key, value]) => (
                              <div key={key}>
                                <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : String(value)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}