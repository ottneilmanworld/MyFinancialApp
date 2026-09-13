import React, { useState } from 'react';
import { Settings, Sparkles } from 'lucide-react';
import { BUDGET_SUGGESTIONS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

// Panel para definir el límite mensual de gasto de cada categoría.
// Los presupuestos son SOLO del mes que estás viendo.
export const BudgetManager = ({ show, expenseCategories, budgets, totalIncome, currency, onSave, onClose }) => {
  const [localBudgets, setLocalBudgets] = useState(budgets || {});

  if (!show) return null;

  const handleChange = (cat, value) => {
    setLocalBudgets({ ...localBudgets, [cat]: value === '' ? 0 : parseFloat(value) });
  };

  const applySuggestion = (cat, suggestedAmount) => {
    setLocalBudgets({ ...localBudgets, [cat]: Math.round(suggestedAmount) });
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
        Pon el límite mensual de cada categoría. El "Sugerido" se calcula como un % de tus
        ingresos de este mes ({formatCurrency(totalIncome, currency)}), basado en la regla
        financiera 50/30/20. Es solo una guía — puedes ignorarla.
      </p>
      <div className="space-y-2">
        {expenseCategories.map(cat => {
          const suggestedPct = BUDGET_SUGGESTIONS[cat];
          const suggestedAmount = suggestedPct ? totalIncome * suggestedPct : null;

          return (
            <div key={cat} className="flex items-center gap-2 p-2 bg-gray-700 rounded flex-wrap">
              <span className="flex-1 min-w-[140px] text-gray-200">{cat}</span>

              {suggestedAmount > 0 && (
                <button
                  onClick={() => applySuggestion(cat, suggestedAmount)}
                  className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200 bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                  title="Usar el monto sugerido"
                >
                  <Sparkles size={11} />
                  Sugerido: {formatCurrency(suggestedAmount, currency)} ({(suggestedPct * 100).toFixed(0)}%)
                </button>
              )}

              <input
                type="number"
                min="0"
                placeholder="Sin límite"
                value={localBudgets[cat] || ''}
                onChange={e => handleChange(cat, e.target.value)}
                className="w-28 bg-gray-600 text-white px-3 py-1 rounded border border-gray-500 focus:border-fuchsia-400"
              />
            </div>
          );
        })}
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