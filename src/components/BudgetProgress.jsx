import React from 'react';
import { formatCurrency } from '../utils/formatters';

// Muestra una barra de progreso por cada categoría que tenga un
// presupuesto definido (> 0). Si ninguna categoría tiene presupuesto,
// no muestra nada.
export const BudgetProgress = ({ expenses, expenseCategories, budgets, currency }) => {
  const categoriesWithBudget = expenseCategories.filter(cat => budgets && budgets[cat] > 0);
  if (categoriesWithBudget.length === 0) return null;

  return (
    <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
      <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Presupuestos del mes</h4>
      {categoriesWithBudget.map(cat => {
        const spent = (expenses || [])
          .filter(e => e.category === cat)
          .reduce((sum, e) => sum + e.amount, 0);
        const limit = budgets[cat];
        const pct = Math.min((spent / limit) * 100, 100);
        const isOver = spent > limit;
        const isWarning = !isOver && spent / limit >= 0.8;
        const barColor = isOver ? 'bg-red-500' : isWarning ? 'bg-yellow-400' : 'bg-green-500';
        const textColor = isOver ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-green-400';

        return (
          <div key={cat}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-200">{cat}</span>
              <span className={`font-semibold ${textColor}`}>
                {formatCurrency(spent, currency)} / {formatCurrency(limit, currency)}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }}></div>
            </div>
            {isOver && <p className="text-xs text-red-400 mt-1">Superaste el límite</p>}
            {isWarning && <p className="text-xs text-yellow-400 mt-1">Cerca del límite</p>}
          </div>
        );
      })}
    </div>
  );
};