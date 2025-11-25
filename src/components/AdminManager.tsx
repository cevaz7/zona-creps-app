// src/components/AdminManager.tsx
"use client";

import { useState, useEffect } from 'react';
import { doc, getDocs, collection, updateDoc, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: string;
}

export default function AdminManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentUserUID, setCurrentUserUID] = useState<string | null>(null);

  // Obtener el usuario actual
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUserUID(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  // Cargar todos los usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Buscar usuario por email
  const searchUser = async () => {
    if (!searchEmail.trim()) return;

    try {
      setSearching(true);
      const q = query(
        collection(db, 'users'),
        where('email', '>=', searchEmail),
        where('email', '<=', searchEmail + '\uf8ff')
      );
      
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error buscando usuario:', error);
    } finally {
      setSearching(false);
    }
  };

  // Verificar si es el último admin
  const isLastAdmin = (user: User): boolean => {
    const currentAdmins = users.filter(u => u.role === 'admin');
    return currentAdmins.length === 1 && currentAdmins[0].uid === user.uid;
  };

  // Cambiar rol de usuario
  const toggleAdminRole = async (user: User, makeAdmin: boolean) => {
    try {
      // PREVENIR: No permitir quitar el último admin
      if (!makeAdmin && isLastAdmin(user)) {
        alert('❌ No puedes quitar el último administrador. Debe haber al menos un admin en el sistema.');
        return;
      }

      // PREVENIR: No permitir que un usuario se quite sus propios permisos de admin
      if (!makeAdmin && user.uid === currentUserUID) {
        alert('❌ No puedes quitarte tus propios permisos de administrador.');
        return;
      }

      setUpdating(user.uid);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        role: makeAdmin ? 'admin' : 'user'
      });

      // Actualizar estado local
      setUsers(prev => prev.map(u => 
        u.uid === user.uid ? { ...u, role: makeAdmin ? 'admin' : 'user' } : u
      ));
      
      setSearchResults(prev => prev.map(u => 
        u.uid === user.uid ? { ...u, role: makeAdmin ? 'admin' : 'user' } : u
      ));

      // Mostrar mensaje de éxito
      if (makeAdmin) {
        alert(`✅ ${user.email} ahora es administrador`);
      } else {
        alert(`✅ ${user.email} ya no es administrador`);
      }

    } catch (error) {
      console.error('Error actualizando rol:', error);
      alert('❌ Error al actualizar el rol del usuario');
    } finally {
      setUpdating(null);
    }
  };

  // Filtrar administradores actuales
  const currentAdmins = users.filter(user => user.role === 'admin');
  const regularUsers = users.filter(user => user.role === 'user');

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      

      {/* Advertencia de seguridad */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <span className="text-yellow-600 text-lg mr-2">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-800">Importante</h4>
            <p className="text-yellow-700 text-sm mt-1">
              • Debe haber al menos <strong>1 administrador</strong> en el sistema
              <br/>
              • No puedes quitarte tus propios permisos de administrador
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-brand-blue">{currentAdmins.length}</p>
          <p className="text-sm text-blue-600">Administradores</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-700">{regularUsers.length}</p>
          <p className="text-sm text-gray-600">Usuarios regulares</p>
        </div>
      </div>

      {/* Buscar usuarios para agregar como admin */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-brand-blue mb-3">Agregar Nuevo Administrador</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="email"
            placeholder="Buscar usuario por email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
          />
          <button
            onClick={searchUser}
            disabled={searching || !searchEmail.trim()}
            className="bg-brand-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Resultados de búsqueda */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Resultados:</h4>
            {searchResults.map(user => (
              <div key={user.uid} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-600">{user.displayName || 'Sin nombre'}</p>
                </div>
                <button
                  onClick={() => toggleAdminRole(user, true)}
                  disabled={updating === user.uid || user.role === 'admin'}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating === user.uid ? '...' : user.role === 'admin' ? 'Ya es Admin' : 'Hacer Admin'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de administradores actuales */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-brand-blue mb-3">
          Administradores Actuales {currentAdmins.length > 0 && `(${currentAdmins.length})`}
        </h3>
        
        {loading ? (
          <p className="text-gray-600">Cargando administradores...</p>
        ) : currentAdmins.length === 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700 font-semibold">⚠️ No hay administradores en el sistema</p>
            <p className="text-red-600 text-sm mt-1">Agrega al menos un administrador para continuar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentAdmins.map(admin => (
              <div key={admin.uid} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-blue-900">{admin.email}</p>
                    {admin.uid === currentUserUID && (
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full font-semibold">
                        Tú
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-blue-700">{admin.displayName || 'Sin nombre'}</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">
                    Administrador
                  </span>
                  {isLastAdmin(admin) && (
                    <span className="inline-block mt-1 ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-semibold">
                      Último Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={() => toggleAdminRole(admin, false)}
                  disabled={updating === admin.uid || isLastAdmin(admin) || admin.uid === currentUserUID}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
                  title={
                    admin.uid === currentUserUID 
                      ? "No puedes quitarte tus propios permisos" 
                      : isLastAdmin(admin) 
                      ? "No puedes quitar el último administrador"
                      : "Quitar permisos de administrador"
                  }
                >
                  {updating === admin.uid ? '...' : 'Quitar Admin'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de usuarios regulares (opcional) */}
      <div>
        <h3 className="text-lg font-semibold text-brand-blue mb-3">
          Usuarios Regulares {regularUsers.length > 0 && `(${regularUsers.length})`}
        </h3>
        
        {!loading && regularUsers.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {regularUsers.slice(0, 10).map(user => (
              <div key={user.uid} className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{user.email}</p>
                  <p className="text-sm text-gray-600">{user.displayName || 'Sin nombre'}</p>
                </div>
                <button
                  onClick={() => toggleAdminRole(user, true)}
                  disabled={updating === user.uid}
                  className="bg-brand-blue text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
                >
                  {updating === user.uid ? '...' : 'Hacer Admin'}
                </button>
              </div>
            ))}
            {regularUsers.length > 10 && (
              <p className="text-center text-gray-500 text-sm">
                Y {regularUsers.length - 10} usuarios más...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}