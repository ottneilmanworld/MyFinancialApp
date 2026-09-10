import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * ConfirmDialog
 * Muestra un modal de confirmación antes de eliminar algo.
 *
 * Props:
 *  - open      : boolean   — si se muestra o no
 *  - message   : string    — texto a mostrar
 *  - onConfirm : () => void — acción al confirmar
 *  - onCancel  : () => void — acción al cancelar
 */
export const ConfirmDialog = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-red-500 rounded-xl p-6 max-w-sm w-full text-center shadow-2xl">
        <AlertTriangle size={36} className="text-red-400 mx-auto mb-3" />
        <p className="text-white font-semibold text-base mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Eliminar
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};