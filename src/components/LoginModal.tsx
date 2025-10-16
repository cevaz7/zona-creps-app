// src/components/LoginModal.tsx
"use client";
import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from "../../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

interface Props {
  onClose: () => void;
}

export default function LoginModal({ onClose }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Aquí podrías añadir lógica para crear un documento de usuario en Firestore
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Guardar el documento del usuario en Firestore
        await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "user", // por defecto todos son usuarios normales
        createdAt: new Date()
        });
      }
      onClose(); // Cierra el modal al tener éxito
    } catch (err: any) {
      console.error("Error al registrar o iniciar sesión:", err);
      setError(err.message.includes('auth/invalid-credential')
        ? 'Credenciales incorrectas.'
        : err.message.includes('auth/email-already-in-use')
          ? 'El correo ya está registrado.'
          : 'Ocurrió un error inesperado.'
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-cream rounded-2xl shadow-2xl w-full max-w-md p-8 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>
        <div className="text-center mb-6">
          {/* Icono inspirado en la Torre Eiffel */}
          <svg className="w-16 h-16 mx-auto text-brand-gold" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M88 128H76V88H52V128H40V88C40 82.4772 44.4772 78 50 78H78C83.5228 78 88 82.4772 88 88V128ZM82 68H46C38.268 68 32 61.732 32 54V40H96V54C96 61.732 89.732 68 82 68ZM64 30C66.2091 30 68 28.2091 68 26V2C68 0.895431 67.1046 0 66 0H62C60.8954 0 60 0.895431 60 2V26C60 28.2091 61.7909 30 64 30Z" fill="currentColor"/></svg>
          <h2 className="font-display text-3xl font-bold text-brand-brown mt-2">Zonaf Creps</h2>
          <p className="text-gray-600">Un viaje de sabores te espera.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold" required />
          </div>
          <div>
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold" required />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full bg-brand-red text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
          <p className="text-center text-sm text-gray-600">
            {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="font-bold text-brand-blue hover:underline ml-1">
              {isLogin ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
