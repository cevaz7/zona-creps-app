    import React, { useState, useEffect } from "react";

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

  // Validar formato de teléfono ecuatoriano
  const validatePhone = (phone: string): boolean => {
    // Eliminar espacios, guiones, paréntesis, etc.
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Validar que tenga exactamente 10 dígitos y empiece con 09
    return /^09\d{8}$/.test(cleanPhone);
  };

  // Validar formulario
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

  // Limpiar errores cuando el usuario empiece a escribir
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    
    // Limpiar error de teléfono cuando el usuario empiece a escribir
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

    // Limpiar el número para WhatsApp (solo números)
    const cleanPhone = phone.replace(/\D/g, '');

    onConfirm({
      name: name.trim(),
      phone: cleanPhone,
      paymentMethod,
      notes: notes.trim(),
    });
  };

  // 🔥 LIMPIAR ESTADOS CUANDO SE CIERRA EL MODAL
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setPhone("");
      setPaymentMethod("Transferencia");
      setNotes("");
      setErrors({});
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
        <label className="text-brand-blue text-sm">Nombre *</label>
        <input
          className={`w-full mt-1 mb-1 px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-brand-gold ${
            errors.name ? 'border-red-500' : 'border-brand-gold'
          }`}
          placeholder="Ej: Sebastián Cruz"
          value={name}
          onChange={handleNameChange}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mb-2">{errors.name}</p>
        )}

        {/* WhatsApp */}
        <label className="text-brand-blue text-sm">WhatsApp *</label>
        <input
          className={`w-full mt-1 mb-1 px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-brand-gold ${
            errors.phone ? 'border-red-500' : 'border-brand-gold'
          }`}
          placeholder="Ej: 0991234567"
          value={phone}
          onChange={handlePhoneChange}
          maxLength={10}
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mb-2">{errors.phone}</p>
        )}
        <p className="text-xs text-gray-500 mb-3">
          Formato: 09XXXXXXXX (10 dígitos)
        </p>

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