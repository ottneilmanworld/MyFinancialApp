import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { BUDGET_SUGGESTIONS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

// Convierte lo que ya está guardado (en $) o la sugerencia (en %) en el
// % inicial que se muestra al abrir el panel, para cada categoría.
const buildInitialPercents = (expenseCategories, budgets, totalIncome) => {
  const result = {};
  expenseCategories.forEach(cat => {
    if (budgets[cat] > 0 && totalIncome > 0) {
      result[cat] = ((budgets[cat] / totalIncome) * 100).toFixed(1);
    } else if (BUDGET_SUGGESTIONS[cat]) {
      result[cat] = (BUDGET_SUGGESTIONS[cat] * 100).toFixed(1);
    } else {
      result[cat] = '';
    }
  });
  return result;
};

// Panel para definir el límite mensual de gasto de cada categoría,
// como un % de tus ingresos del mes. El monto en $ se calcula solo.
export const BudgetManager = ({ show, expenseCategories, budgets, totalIncome, currency, onSave, onClose }) => {
  const [percents, setPercents] = useState(() =>
    buildInitialPercents(expenseCategories, budgets || {}, totalIncome)
  );

  if (!show) return null;

  const handleChange = (cat, value) => {
    setPercents({ ...percents, [cat]: value });
  };

  const amountFor = (cat) => {
    const pct = parseFloat(percents[cat]);
    if (!pct || totalIncome <= 0) return 0;
    return (pct / 100) * totalIncome;
  };

  const totalPctAssigned = expenseCategories.reduce((sum, cat) => {
    const pct = parseFloat(percents[cat]);
    return sum + (isNaN(pct) ? 0 : pct);
  }, 0);

  const totalColor =
    totalPctAssigned > 100 ? 'text-red-400' : totalPctAssigned >= 90 ? 'text-yellow-400' : 'text-green-400';

  const handleSave = () => {
    const newBudgets = {};
    expenseCategories.forEach(cat => {
      const amount = amountFor(cat);
      if (amount > 0) newBudgets[cat] = Math.round(amount);
    });
    onSave(newBudgets);
    onClose();
  };

  return (
    <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h4 className="text-lg font-bold mb-1 text-fuchsia-400 flex items-center gap-2">
        <Settings size={20} /> Presupuestos por Categoría
      </h4>

      {totalIncome > 0 ? (
        <p className="text-gray-400 text-xs mb-3">
          Define qué % de tus ingresos de este mes ({formatCurrency(totalIncome, currency)}) quieres destinar
          a cada categoría. Ya viene con una sugerencia basada en la regla 50/30/20, pero puedes cambiarla
          libremente — por ejemplo, bajarle 2% a "Telecomunicaciones" para subírselo a "Deudas y Préstamos".
        </p>
      ) : (
        <p className="text-yellow-400 text-xs mb-3">
          ⚠ Aún no registraste ingresos este mes, así que no se puede calcular el monto en {currency}.
          Puedes definir los % igual, pero agrega tus ingresos para ver los montos reales.
        </p>
      )}

      <div className="space-y-2">
        {expenseCategories.map(cat => (
          <div key={cat} className="flex items-center gap-2 p-2 bg-gray-700 rounded flex-wrap">
            <span className="flex-1 min-w-[160px] text-gray-200">{cat}</span>

            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                placeholder="0"
                value={percents[cat]}
                onChange={e => handleChange(cat, e.target.value)}
                className="w-20 bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:border-fuchsia-400 text-right"
              />
              <span className="text-gray-400 text-sm">%</span>
            </div>

            <span className="w-24 text-right text-sm text-cyan-300 font-semibold">
              {totalIncome > 0 ? `= ${formatCurrency(amountFor(cat), currency)}` : '—'}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3 px-1">
        <span className="text-xs text-gray-400">Total asignado:</span>
        <span className={`text-sm font-bold ${totalColor}`}>
          {totalPctAssigned.toFixed(1)}% de tus ingresos
          {totalPctAssigned > 100 && ' — ¡estás asignando más de lo que ganas!'}
        </span>
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