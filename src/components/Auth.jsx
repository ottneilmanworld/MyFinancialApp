import { useState } from 'react';
import { supabase } from '../supabase';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

// Modos: 'signin' | 'signup' | 'forgot'
export default function Auth() {
  const [mode, setMode] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'error' | 'success'

  const resetMessages = () => { setMessage(''); setMessageType(''); };

  const validate = () => {
    if (!email) return 'Ingresa tu correo electrónico.';
    if (mode === 'forgot') return null;
    if (!password) return 'Ingresa tu contraseña.';
    if (mode === 'signup') {
      if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
      if (password !== confirmPassword) return 'Las contraseñas no coinciden.';
    }
    return null;
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    setMessage('¡Cuenta creada! Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.');
    setMessageType('success');
  };

  // FIX crítico: antes no existía forma de recuperar contraseña. Sin esto,
  // cada usuario que la olvida se convierte en un ticket de soporte manual
  // que un dev solo no puede sostener a escala.
  const handleForgotPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    setMessage('Si ese correo existe en nuestro sistema, te enviamos un link para restablecer tu contraseña.');
    setMessageType('success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    const validationError = validate();
    if (validationError) {
      setMessage(validationError);
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') await handleSignIn();
      else if (mode === 'signup') await handleSignUp();
      else if (mode === 'forgot') await handleForgotPassword();
    } catch (err) {
      setMessage(traducirErrorSupabase(err.message));
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetMessages();
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black" style={{ color: '#39FF14' }}>My Finance App</h1>
          <p className="text-gray-400 text-sm mt-1">Gestor de Finanzas Personales</p>
        </div>

        {mode !== 'forgot' && (
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                mode === 'signin' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <LogIn size={16} /> Ingresar
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                mode === 'signup' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <UserPlus size={16} /> Registrarse
            </button>
          </div>
        )}

        {mode === 'forgot' && (
          <h2 className="text-lg font-bold text-center mb-4 text-cyan-400">Recuperar contraseña</h2>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Correo</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-2.5 pl-9 rounded-lg border border-gray-700 focus:border-green-500 outline-none transition-colors"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-2.5 pl-9 pr-9 rounded-lg border border-gray-700 focus:border-green-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Confirmar contraseña</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-green-500 outline-none transition-colors"
              />
            </div>
          )}

          {message && (
            <div
              className={`p-3 rounded-lg text-sm border ${
                messageType === 'error'
                  ? 'bg-red-900/30 border-red-700 text-red-300'
                  : 'bg-green-900/30 border-green-700 text-green-300'
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading
              ? 'Procesando...'
              : mode === 'signin' ? 'Iniciar Sesión'
              : mode === 'signup' ? 'Crear Cuenta'
              : 'Enviar link de recuperación'}
          </button>
        </form>

        <div className="text-center mt-5">
          {mode !== 'forgot' ? (
            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
            >
              ¿Olvidaste tu contraseña?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
            >
              ← Volver a iniciar sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Los mensajes de error de Supabase vienen en inglés y son poco claros para
// el usuario final. Traducimos los más comunes.
function traducirErrorSupabase(msg = '') {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (m.includes('email not confirmed')) return 'Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.';
  if (m.includes('user already registered')) return 'Ya existe una cuenta con ese correo. Intenta iniciar sesión.';
  if (m.includes('password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (m.includes('rate limit')) return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.';
  return msg;
}