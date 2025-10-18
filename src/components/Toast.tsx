// src/components/Toast.tsx
"use client";
import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 4000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getStyles = () => {
    switch (type) {
      case 'success': 
        return {
          bg: 'bg-brand-gold',
          border: 'border-yellow-400',
          text: 'text-brand-blue',
          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      case 'error': 
        return {
          bg: 'bg-brand-red',
          border: 'border-red-600',
          text: 'text-white',
          icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      case 'info': 
      default:
        return {
          bg: 'bg-brand-blue',
          border: 'border-blue-600',
          text: 'text-brand-cream',
          icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-500 ${
      isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
    }`}>
      <div className={`${styles.bg} border ${styles.border} ${styles.text} px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 min-w-80 max-w-md backdrop-blur-sm bg-opacity-95`}>
        {/* Icono animado */}
        <div className="flex-shrink-0 animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={styles.icon} />
          </svg>
        </div>
        
        {/* Contenido */}
        <div className="flex-1">
          <p className="font-bold text-sm uppercase tracking-wide opacity-90">
            {type === 'success' && '¡Bienvenido!'}
            {type === 'error' && 'Error'}
            {type === 'info' && 'Sesión'}
          </p>
          <p className="text-sm mt-1 opacity-95">{message}</p>
        </div>
        
        {/* Botón cerrar */}
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className={`flex-shrink-0 transition-all duration-200 hover:scale-125 ${
            type === 'success' ? 'text-brand-blue hover:text-blue-800' : 'text-current hover:opacity-70'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}