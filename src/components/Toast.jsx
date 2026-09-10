import React, { useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Hook — úsalo en App.jsx:
//   const { toasts, toast, removeToast } = useToast();
// ─────────────────────────────────────────────────────────────
const genId = () => `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = 'success') => {
    const id = genId();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(
      () => setToasts(prev => prev.filter(t => t.id !== id)),
      3500
    );
  }, []);

  const removeToast = useCallback(
    id => setToasts(prev => prev.filter(t => t.id !== id)),
    []
  );

  return { toasts, toast, removeToast };
};

// ─────────────────────────────────────────────────────────────
// Componente visual — ponlo al final del return en App.jsx:
//   <Toast toasts={toasts} remove={removeToast} />
// ─────────────────────────────────────────────────────────────
export const Toast = ({ toasts, remove }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
    {toasts.map(t => (
      <div
        key={t.id}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-semibold
          transition-all animate-[slideIn_.25s_ease]
          ${t.type === 'success'
            ? 'bg-green-900 border border-green-500 text-green-300'
            : t.type === 'error'
            ? 'bg-red-900 border border-red-500 text-red-300'
            : 'bg-gray-800 border border-gray-600 text-gray-200'
          }`}
      >
        {t.type === 'success'
          ? <CheckCircle size={16} />
          : <AlertTriangle size={16} />
        }
        {t.msg}
        <button
          onClick={() => remove(t.id)}
          className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Cerrar notificación"
        >
          <X size={14} />
        </button>
      </div>
    ))}
  </div>
);