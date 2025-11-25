// src/components/WhatsAppConfigPanel.tsx
"use client";

import { useState } from 'react';
import { useWhatsAppConfig } from '../hooks/useWhatsAppConfig';
import { auth } from '../../firebase/config';
import AdminManager from '@/components/AdminManager';

// Interface actualizada para manejar Timestamp de Firestore
interface WhatsAppConfig {
  phoneNumber: string;
  lastUpdated: any; // Puede ser Date, Timestamp, o string
  updatedBy: string;
}

export default function WhatsAppConfigPanel() {
  const { config, loading, updateConfig } = useWhatsAppConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Función para formatear la fecha correctamente
  const formatDate = (date: any): string => {
    if (!date) return 'N/A';
    
    try {
      // Si es un Timestamp de Firestore
      if (date.toDate && typeof date.toDate === 'function') {
        return date.toDate().toLocaleString();
      }
      // Si ya es un Date de JavaScript
      if (date instanceof Date) {
        return date.toLocaleString();
      }
      // Si es un string
      return new Date(date).toLocaleString();
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };

  const handleEdit = () => {
    if (config) {
      setPhoneNumber(config.phoneNumber);
      setIsEditing(true);
      setMessage('');
    }
  };

  const handleSave = async () => {
    if (!phoneNumber.trim()) {
      setMessage('El número de WhatsApp es obligatorio');
      return;
    }

    // Validar formato ecuatoriano
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!/^09\d{8}$/.test(cleanPhone)) {
      setMessage('Formato inválido. Debe ser 09XXXXXXXX (10 dígitos)');
      return;
    }

    setSaving(true);
    const currentUser = auth.currentUser;
    const success = await updateConfig(cleanPhone, currentUser?.email || 'admin');
    
    if (success) {
      setMessage('✅ Número actualizado correctamente');
      setIsEditing(false);
    } else {
      setMessage('❌ Error al actualizar el número');
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage('');
    setPhoneNumber('');
  };

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
      {/* Configuración de WhatsApp */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-brand-brown mb-4">
          ⚙️ Configuración de WhatsApp
        </h3>

        {!isEditing ? (
          // MODO VISUALIZACIÓN
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Número actual de WhatsApp:</p>
                <p className="text-lg font-semibold text-brand-blue">
                  📱 {config?.phoneNumber || 'No configurado'}
                </p>
                {config?.lastUpdated && (
                  <p className="text-xs text-gray-500 mt-1">
                    Última actualización: {formatDate(config.lastUpdated)} 
                    <br />
                    por {config.updatedBy}
                  </p>
                )}
              </div>
              <button
                onClick={handleEdit}
                className="bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                ✏️ Editar
              </button>
            </div>
          </div>
        ) : (
          // MODO EDICIÓN
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de WhatsApp de la empresa:
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0991234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: 09XXXXXXXX (10 dígitos)
              </p>
            </div>

            {message && (
              <div className={`p-3 rounded-lg ${
                message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : '💾 Guardar'}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Gestión de Administradores - NUEVA SECCIÓN */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-brand-brown mb-4">
          👥 Gestión de Administradores
        </h3>
        
        {/* Aquí va el componente AdminManager */}
        <AdminManager />
      </div>
    </div>
  );
}