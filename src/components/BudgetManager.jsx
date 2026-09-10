import React, { useState } from 'react';
import { Settings } from 'lucide-react';

// Panel para definir el límite mensual de gasto de cada categoría.
// Los presupuestos aplican TODOS los meses (no varían mes a mes).
export const BudgetManager = ({ show, expenseCategories, budgets, onSave, onClose }) => {
  const [localBudgets, setLocalBudgets] = useState(budgets || {});

  if (!show) return null;

  const handleChange = (cat, value) => {
    setLocalBudgets({ ...localBudgets, [cat]: value === '' ? 0 : parseFloat(value) });
  };

  const handleSave = () => {
    onSave(localBudgets);
    onClose();
  };

  return (
    <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h4 className="text-lg font-bold mb-1 text-fuchsia-400 flex items-center gap-2">
        <Settings size={20} /> Presupuestos por Categoría
      </h4>
      <p className="text-gray-400 text-xs mb-3">
        Pon el límite mensual de cada categoría. Déjalo en blanco o en 0 si no quieres límite.
      </p>
      <div className="space-y-2">
        {expenseCategories.map(cat => (
          <div key={cat} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
            <span className="flex-1 text-gray-200">{cat}</span>
            <input
              type="number"
              min="0"
              placeholder="Sin límite"
              value={localBudgets[cat] || ''}
              onChange={e => handleChange(cat, e.target.value)}
              className="w-32 bg-gray-600 text-white px-3 py-1 rounded border border-gray-500 focus:border-fuchsia-400"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={handleSave} className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded text-sm text-white font-semibold">
          Guardar
        </button>
        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm text-white">
          Cerrar
        </button>
      </div>
    </div>
  );
};