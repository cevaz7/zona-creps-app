// src/components/LoginModal.tsx
"use client";
import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from "../../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

interface Props {
  onClose: () => void;
}

export default function LoginModal({ onClose }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setIsAnimating(true);
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSwitchMode = () => {
    setIsSwitching(true);
    setError('');
    
    setTimeout(() => {
      setIsLogin(!isLogin);
      setTimeout(() => {
        setIsSwitching(false);
      }, 200);
    }, 300);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setError('');
      
      // Pequeño delay para evitar conflictos con animaciones
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log('✅ Usuario autenticado con Google:', user.email);

      // Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: "user",
          provider: "google",
          createdAt: new Date(),
          lastLogin: new Date()
        });
        console.log('✅ Nuevo usuario creado en Firestore');
      } else {
        await setDoc(doc(db, "users", user.uid), {
          lastLogin: new Date()
        }, { merge: true });
        console.log('✅ Usuario actualizado en Firestore');
      }

      // Esperar un poco antes de cerrar para asegurar que todo se complete
      setTimeout(() => {
        onClose();
      }, 500);

    } catch (err: any) {
      console.error("❌ Error completo Google auth:", err);
      
      // Manejo específico de errores
      if (err.code === 'auth/popup-closed-by-user') {
        console.log('Usuario cerró la ventana de Google');
        // No mostrar error si el usuario cerró la ventana
        setError('');
      } else if (err.code === 'auth/popup-blocked') {
        setError('El popup fue bloqueado. Permite popups para este sitio.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Error de conexión. Verifica tu internet.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Dominio no autorizado. Agrega localhost a dominios autorizados en Firebase.');
      } else {
        setError('Error al iniciar sesión con Google. Intenta nuevamente.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Login exitoso con email');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "user",
          provider: "email",
          createdAt: new Date(),
          lastLogin: new Date()
        });
        console.log('✅ Usuario registrado con email');
      }
      
      // Esperar antes de cerrar
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (err: any) {
      console.error("❌ Error auth:", err);
      
      if (err.code === 'auth/invalid-credential') {
        setError('Credenciales incorrectas. Si te registraste con Google, usa "Continuar con Google".');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este email ya está registrado con Google. Por favor, usa "Continuar con Google" para iniciar sesión.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este email. Regístrate primero.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta. Si te registraste con Google, usa "Continuar con Google".');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Error de conexión. Verifica tu internet.');
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
        isAnimating ? 'bg-black/60 backdrop-blur-lg' : 'bg-black/0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative w-full max-w-md transform transition-all duration-500 ${
          isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Fondo */}
        <div className="absolute inset-0 bg-[#F5EFE6] rounded-2xl shadow-2xl shadow-black/30">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F5EFE6] via-[#F9F5F0] to-[#F0E6D6] rounded-2xl"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#B39C4D]/15 via-transparent to-transparent rounded-2xl"></div>
          <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-gradient-to-br from-[#B39C4D]/10 via-transparent to-transparent rounded-tl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-[#D81E2C]/5 via-transparent to-transparent rounded-br-2xl"></div>
        </div>

        {/* Bordes */}
        <div className="absolute inset-0 rounded-2xl border border-[#B39C4D]/40"></div>
        <div className="absolute inset-1 rounded-xl border border-[#B39C4D]/20"></div>
        
        {/* Contenido - Reducir padding y márgenes */}
        <div className="relative p-3">
          {/* Header con logo más pequeño */}
          <div className="text-center mb-1">
            <div className="relative mb-1">
              <img 
                src="/logos/3d logo crepes.png" 
                alt="Zonaf Creps" 
                className="w-40 h-40 mx-auto object-contain transition-transform duration-500 hover:scale-105 drop-shadow-xl animate-float"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#B39C4D]/15 to-[#B39C4D]/5 blur-xl rounded-full pointer-events-none"></div>
            </div>
            
            <div className="relative h-12 overflow-hidden">
              <div className={`transform transition-all duration-500 ${
                isSwitching ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
              }`}>
                <h2 className="font-display text-xl font-bold text-[#D81E2C] mb-1 tracking-tight">
                  Zonaf Creps
                </h2>
                <p className="text-[#B39C4D] text-xs font-medium">
                  {isLogin ? 'BIENVENIDO DE NUEVO' : 'CREA TU CUENTA'}
                </p>
              </div>
            </div>
          </div>

          {/* Botón de Google */}
          <div className={`mb-4 transform transition-all duration-500 ${
            isSwitching ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
          }`}>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading || isSwitching}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </>
              )}
              <span className="text-sm">
                {isGoogleLoading ? 'Procesando...' : `Continuar con Google`}
              </span>
            </button>
          </div>

          {/* Separador */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#B39C4D]/30"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#F5EFE6] text-[#8B6B3D]">o</span>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className={`transform transition-all duration-500 ${
              isSwitching ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
            }`}>
              {/* Campo Email */}
              <div className="relative mb-3 group">
                <label className="block text-xs font-semibold text-[#8B6B3D] mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="tu@email.com"
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    className="w-full px-10 py-2.5 bg-white/90 border border-[#B39C4D]/40 rounded-lg focus:border-[#B39C4D] focus:outline-none focus:ring-1 focus:ring-[#B39C4D]/20 transition-all duration-300 placeholder-[#8B6B3D]/60 text-[#5A4A30] text-sm"
                    required 
                    disabled={isLoading}
                  />
                  
                  {/* Icono de persona más pequeño */}
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B39C4D]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="relative mb-3 group">
                <label className="block text-xs font-semibold text-[#8B6B3D] mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    className="w-full px-10 py-2.5 pr-10 bg-white/90 border border-[#B39C4D]/40 rounded-lg focus:border-[#B39C4D] focus:outline-none focus:ring-1 focus:ring-[#B39C4D]/20 transition-all duration-300 placeholder-[#8B6B3D]/60 text-[#5A4A30] text-sm"
                    required 
                    disabled={isLoading}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  
                  {/* Icono de candado más pequeño */}
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B39C4D]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  
                  {/* Icono de ojo más pequeño */}
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#B39C4D] hover:text-[#8B6B3D] transition-colors duration-300 focus:outline-none disabled:opacity-30"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878l-3.59-3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L9.878 9.878" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-2 mb-2 transform transition-all duration-300 animate-shake">
                <p className="text-red-700 text-xs text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Botón principal */}
            <div className={`transform transition-all duration-500 ${
              isSwitching ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
            }`}>
              <button 
                type="submit" 
                disabled={isLoading || isSwitching}
                className="w-full bg-gradient-to-r from-[#B39C4D] to-[#C9B263] text-white py-2.5 rounded-lg font-bold text-sm hover:from-[#C9B263] hover:to-[#D4C17A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-white font-semibold text-sm">Procesando...</span>
                  </div>
                ) : (
                  <span>
                    {isLogin ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
                  </span>
                )}
              </button>
            </div>

            {/* Switch entre login/registro */}
            <div className={`text-center pt-3 border-t border-[#B39C4D]/30 transform transition-all duration-500 ${
              isSwitching ? 'opacity-50' : 'opacity-100'
            }`}>
              <p className="text-[#8B6B3D] text-xs">
                <span className={`inline-block transition-all duration-500 ${
                  isSwitching ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}>
                  {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                </span>
                {' '}
                <button 
                  type="button" 
                  onClick={handleSwitchMode}
                  disabled={isLoading || isSwitching}
                  className="text-[#D81E2C] hover:text-[#B39C4D] font-semibold underline disabled:opacity-50 transition-all duration-300"
                >
                  <span className="relative">
                    <span className={`inline-block transition-all duration-500 ${
                      isSwitching ? 'opacity-0 -translate-x-2' : 'opacity-100 translate-x-0'
                    }`}>
                      {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
                    </span>
                  </span>
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Botón cerrar - Asegurar que sea visible */}
        <button 
          onClick={handleClose}
          disabled={isSwitching}
          className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-gradient-to-br from-[#B39C4D] to-[#C9B263] text-white rounded-full shadow-lg shadow-[#B39C4D]/40 hover:shadow-[#B39C4D]/60 transition-all duration-300 hover:scale-110 hover:rotate-90 border border-[#B39C4D] disabled:opacity-50 font-bold text-xs"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
