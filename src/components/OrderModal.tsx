import React, { useState, useEffect } from "react";
import { auth } from '../../firebase/config';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    name: string;
    phone: string;
    paymentMethod: "Transferencia" | "Efectivo";
    notes: string;
  }) => void;
}

export default function OrderModal({
  isOpen,
  onClose,
  onConfirm
}: OrderModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Transferencia" | "Efectivo">("Transferencia");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{name?: string; phone?: string}>({});
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userHasProfile, setUserHasProfile] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Obtener información del usuario al abrir el modal
  useEffect(() => {
    const currentUser = auth.currentUser;
    setIsUserLoggedIn(!!currentUser);
    
    if (currentUser) {
      checkUserProfile(currentUser.uid);
    } else {
      // Para usuarios no logueados, resetear estados
      setUserHasProfile(false);
      setIsEditingName(true);
      setIsEditingPhone(true);
    }
  }, [isOpen]);

  // Función para buscar el perfil del usuario en Firestore
  const checkUserProfile = async (userId: string) => {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../../firebase/config');
      
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Si tiene nombre guardado, usarlo
        if (userData.displayName) {
          setName(userData.displayName);
          setUserHasProfile(true);
          setIsEditingName(false);
        } else {
          setIsEditingName(true);
        }
        
        // Si tiene teléfono guardado, usarlo
        if (userData.phone) {
          setPhone(userData.phone);
          setUserHasProfile(true);
          setIsEditingPhone(false);
        } else {
          setIsEditingPhone(true);
        }
      } else {
        // Si no existe el documento, permitir edición
        setIsEditingName(true);
        setIsEditingPhone(true);
      }
    } catch (error) {
      console.error("Error al obtener perfil del usuario:", error);
      setIsEditingName(true);
      setIsEditingPhone(true);
    }
  };

  // Validaciones
  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return /^09\d{8}$/.test(cleanPhone);
  };

  const validateForm = (): boolean => {
    const newErrors: {name?: string; phone?: string} = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!phone.trim()) {
      newErrors.phone = "El WhatsApp es obligatorio";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "Ingresa un número válido de 10 dígitos (09XXXXXXXX)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // 🔥 GUARDAR NOMBRE Y TELÉFONO EN EL PERFIL DEL USUARIO SI ESTÁ LOGUEADO
    if (isUserLoggedIn && auth.currentUser) {
      saveUserProfileToFirestore(name, cleanPhone);
    }

    onConfirm({
      name: name.trim(),
      phone: cleanPhone,
      paymentMethod,
      notes: notes.trim(),
    });
  };

  // 🔥 FUNCIÓN PARA GUARDAR EL PERFIL COMPLETO EN FIRESTORE
  const saveUserProfileToFirestore = async (userName: string, userPhone: string) => {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../../firebase/config');
      
      const currentUser = auth.currentUser;
      if (currentUser) {
        const profileData: any = {
          lastLogin: new Date()
        };
        
        // Solo guardar nombre si no estaba guardado o si se editó
        if (!userHasProfile || isEditingName) {
          profileData.displayName = userName;
        }
        
        // Solo guardar teléfono si no estaba guardado o si se editó
        if (!userHasProfile || isEditingPhone) {
          profileData.phone = userPhone;
        }
        
        await setDoc(doc(db, "users", currentUser.uid), profileData, { merge: true });
        
        console.log("✅ Perfil actualizado en Firestore");
        setUserHasProfile(true);
      }
    } catch (error) {
      console.error("Error al guardar perfil:", error);
    }
  };

  // Limpiar estados cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setPaymentMethod("Transferencia");
      setNotes("");
      setErrors({});
      // NO limpiar nombre y teléfono para mantenerlos para la próxima vez
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-brand-cream w-full max-w-md rounded-2xl shadow-2xl p-6 border border-brand-gold z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-display text-brand-brown">
            Confirmar pedido
          </h2>
          <button
            className="text-brand-brown text-xl font-bold"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Nombre */}
        <div className="mb-3">
          <label className="text-brand-blue text-sm block mb-1">
            Nombre {isEditingName && "*"}
          </label>
          
          {isEditingName ? (
            // 🔥 MODO EDICIÓN: Campo de entrada
            <div className="relative">
              <input
                className={`w-full px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-brand-gold ${
                  errors.name ? 'border-red-500' : 'border-brand-gold'
                }`}
                placeholder="Ej: Sebastián Cruz"
                value={name}
                onChange={handleNameChange}
              />
              {userHasProfile && (
                <button
                  onClick={() => setIsEditingName(false)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-brand-brown text-sm"
                >
                  Cancelar
                </button>
              )}
            </div>
          ) : (
            // 🔥 MODO VISUALIZACIÓN: Texto fijo con botón editar
            <div className="p-3 bg-brand-cream border border-brand-gold rounded-lg relative">
              <p className="text-brand-brown font-semibold pr-16">
                👤 {name}
              </p>
              <button
                onClick={() => setIsEditingName(true)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-blue hover:text-brand-red text-sm font-semibold"
              >
                ✏️ Editar
              </button>
            </div>
          )}
          {errors.name && isEditingName && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div className="mb-3">
          <label className="text-brand-blue text-sm block mb-1">
            WhatsApp {isEditingPhone && "*"}
          </label>
          
          {isEditingPhone ? (
            // 🔥 MODO EDICIÓN: Campo de entrada
            <div className="relative">
              <input
                className={`w-full px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-brand-gold ${
                  errors.phone ? 'border-red-500' : 'border-brand-gold'
                }`}
                placeholder="Ej: 0991234567"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={10}
              />
              {userHasProfile && (
                <button
                  onClick={() => setIsEditingPhone(false)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-brand-brown text-sm"
                >
                  Cancelar
                </button>
              )}
            </div>
          ) : (
            // 🔥 MODO VISUALIZACIÓN: Texto fijo con botón editar
            <div className="p-3 bg-brand-cream border border-brand-gold rounded-lg relative">
              <p className="text-brand-brown font-semibold pr-16">
                📱 {phone}
              </p>
              <button
                onClick={() => setIsEditingPhone(true)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-blue hover:text-brand-red text-sm font-semibold"
              >
                ✏️ Editar
              </button>
            </div>
          )}
          {errors.phone && isEditingPhone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
          {isEditingPhone && (
            <p className="text-xs text-gray-500 mt-1">
              Formato: 09XXXXXXXX (10 dígitos)
            </p>
          )}
        </div>

        {/* Método de pago */}
        <label className="text-brand-blue text-sm">Método de pago</label>
        <div className="grid grid-cols-2 gap-3 mt-2 mb-4">
          <button
            onClick={() => setPaymentMethod("Transferencia")}
            className={`py-2 rounded-lg border ${
              paymentMethod === "Transferencia"
                ? "bg-brand-red text-white border-brand-red"
                : "bg-white border-brand-gold text-brand-blue"
            }`}
          >
            Transferencia
          </button>

          <button
            onClick={() => setPaymentMethod("Efectivo")}
            className={`py-2 rounded-lg border ${
              paymentMethod === "Efectivo"
                ? "bg-brand-red text-white border-brand-red"
                : "bg-white border-brand-gold text-brand-blue"
            }`}
          >
            Efectivo
          </button>
        </div>

        {/* Notas */}
        <label className="text-brand-blue text-sm">Notas (opcional)</label>
        <textarea
          className="w-full mt-1 mb-4 px-3 py-2 bg-white border border-brand-gold rounded-lg focus:ring-2 focus:ring-brand-gold"
          placeholder="Ej: sin cebolla, por favor"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Botones */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-brand-red text-white py-3 rounded-xl shadow-lg hover:bg-red-700 transition font-semibold"
          >
            Confirmar y abrir WhatsApp
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-brand-blue py-3 rounded-xl hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
        </div>

        <p className="text-[12px] text-gray-600 text-center mt-4">
          Al confirmar se abrirá WhatsApp.  
          Si el navegador bloquea la ventana, permite ventanas emergentes.
        </p>
      </div>
    </div>
  );
}