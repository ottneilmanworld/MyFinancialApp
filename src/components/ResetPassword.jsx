import { useState } from 'react';
import { supabase } from '../supabase';
import { Lock } from 'lucide-react';

// Se muestra cuando el usuario llega desde el link del correo de
// "recuperar contraseña". Supabase ya lo autenticó temporalmente vía el
// token del link (evento PASSWORD_RECOVERY); aquí solo pedimos la nueva
// contraseña y la actualizamos.
export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres.');
      setMessageType('error');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      setMessageType('error');
      return;
    }

    setMessage('¡Contraseña actualizada! Ya puedes usar la app.');
    setMessageType('success');
    setTimeout(() => onDone?.(), 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-center mb-6 text-cyan-400">Establece tu nueva contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-3 text-gray-500" />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2.5 pl-9 rounded-lg border border-gray-700 focus:border-green-500 outline-none"
            />
          </div>
          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-green-500 outline-none"
          />

          {message && (
            <div className={`p-3 rounded-lg text-sm border ${
              messageType === 'error'
                ? 'bg-red-900/30 border-red-700 text-red-300'
                : 'bg-green-900/30 border-green-700 text-green-300'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-all"
          >
            {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}