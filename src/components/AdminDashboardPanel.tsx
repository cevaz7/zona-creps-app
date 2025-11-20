// src/components/AdminDashboardPanel.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

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

interface ProductStats {
  name: string;
  quantity: number;
  totalRevenue: number;
  ordersCount: number;
}

interface CustomerStats {
  name: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
  lastOrder: Date;
}

export default function AdminDashboardPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Cargar órdenes en TIEMPO REAL
  useEffect(() => {
    setLoading(true);
    
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error en tiempo real:', error);
      setLoading(false);
    });

    // Cleanup function
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

  // Filtrar órdenes
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Filtro por búsqueda
      const matchesSearch = searchTerm === '' || 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone?.includes(searchTerm);

      // Filtro por fecha
      const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);
      const now = new Date();
      let matchesDate = true;
      
      if (dateFilter === 'today') {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = orderDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = orderDate >= monthAgo;
      }

      // Filtro por estado
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [orders, searchTerm, dateFilter, statusFilter]);

  // Estadísticas de productos
  const productStats = useMemo(() => {
    const stats: { [key: string]: ProductStats } = {};
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!stats[item.name]) {
          stats[item.name] = {
            name: item.name,
            quantity: 0,
            totalRevenue: 0,
            ordersCount: 0
          };
        }
        
        stats[item.name].quantity += item.quantity;
        stats[item.name].totalRevenue += item.totalPrice || (item.quantity * item.price);
        stats[item.name].ordersCount += 1;
      });
    });

    return Object.values(stats).sort((a, b) => b.quantity - a.quantity);
  }, [filteredOrders]);

  // Estadísticas de clientes
  const customerStats = useMemo(() => {
    const stats: { [key: string]: CustomerStats } = {};
    
    filteredOrders.forEach(order => {
      const key = `${order.customerName}-${order.customerPhone || 'no-phone'}`;
      if (!stats[key]) {
        stats[key] = {
          name: order.customerName,
          email: order.customerEmail || 'No email',
          ordersCount: 0,
          totalSpent: 0,
          lastOrder: order.createdAt?.toDate?.() || new Date(order.createdAt)
        };
      }
      
      stats[key].ordersCount += 1;
      stats[key].totalSpent += order.total;
      const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);
      if (orderDate > stats[key].lastOrder) {
        stats[key].lastOrder = orderDate;
      }
    });

    return Object.values(stats).sort((a, b) => b.ordersCount - a.ordersCount);
  }, [filteredOrders]);

  // Estadísticas generales
  const generalStats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
    const completedOrders = filteredOrders.filter(order => order.status === 'completed').length;
    
    const today = new Date();
    const todayOrders = filteredOrders.filter(order => {
      const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt);
      return orderDate.toDateString() === today.toDateString();
    }).length;

    return {
      totalOrders: filteredOrders.length,
      totalRevenue,
      pendingOrders,
      completedOrders,
      todayOrders,
      avgOrderValue: filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0
    };
  }, [filteredOrders]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicador de tiempo real */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-700">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold">✅ Modo tiempo real activo</span>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Cliente, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
            >
              <option value="all">Todos los tiempos</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completados</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('all');
                setStatusFilter('all');
              }}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              🔄 Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-brand-blue">{generalStats.totalOrders}</div>
          <div className="text-sm text-gray-600">Total Pedidos</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">${generalStats.totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Ingresos Totales</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{generalStats.pendingOrders}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-brand-blue">{generalStats.todayOrders}</div>
          <div className="text-sm text-gray-600">Pedidos Hoy</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos Más Vendidos */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-brand-brown mb-4">🏆 Productos Más Vendidos</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {productStats.slice(0, 10).map((product, index) => (
              <div key={product.name} className="flex justify-between items-center p-3 border-b">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-xs text-gray-500">
                      {product.quantity} unidades en {product.ordersCount} pedidos
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">${product.totalRevenue.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">{product.quantity}x</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clientes Más Frecuentes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-brand-brown mb-4">👥 Clientes Más Frecuentes</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
            {customerStats.slice(0, 10).map((customer, index) => (
            <div 
                key={`${customer.email}-${customer.name}-${index}`} 
                className="flex justify-between items-center p-3 border-b"
            >
                <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-brand-gold text-white rounded-full flex items-center justify-center text-sm">
                    {index + 1}
                </span>
                <div>
                    <div className="font-semibold">{customer.name}</div>
                    <div className="text-xs text-gray-500">
                    {customer.email !== 'No email' ? customer.email : 'Sin email'}
                    </div>
                </div>
                </div>
                <div className="text-right">
                <div className="font-bold text-brand-blue">{customer.ordersCount} pedidos</div>
                <div className="text-xs text-gray-500">${customer.totalSpent.toFixed(2)}</div>
                </div>
            </div>
            ))}
        </div>
        </div>
      </div>

      {/* Lista de Pedidos Recientes */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-brand-brown mb-4">
          📦 Pedidos Recientes ({filteredOrders.length})
          <span className="text-sm font-normal text-green-600 ml-2">• Actualizado en tiempo real</span>
        </h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredOrders.slice(0, 20).map((order) => (
            <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">Pedido #{(order.orderId || order.id).slice(-8)}</div>
                  <div className="text-sm text-gray-600">
                    {order.customerName} • {order.customerPhone} • {order.customerEmail}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  order.status === 'pending' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                }`}>
                  {order.status === 'pending' ? 'PENDIENTE' : 'COMPLETADO'}
                </span>
              </div>
              
              <div className="text-sm mb-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${item.totalPrice?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center text-sm border-t pt-2">
                <span className="font-bold">Total: ${order.total.toFixed(2)}</span>
                <span className="text-gray-500">
                  {formatDate(order.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}