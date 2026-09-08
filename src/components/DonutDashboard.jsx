import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

// Colores del donut — mismo orden que la landing
const SLICE_COLORS = [
  '#39FF14', // verde neón
  '#00FFFF', // cyan
  '#FF00FF', // magenta
  '#FF4500', // naranja rojo
  '#8A2BE2', // violeta
  '#F59E0B', // ámbar
];

/**
 * DonutDashboard
 * Replica el gráfico donut animado del hero de la landing page
 * directamente dentro de la app.
 *
 * Props:
 *  - currentMonthData : { incomes: [], expenses: [], budgets: {} }
 *  - expenseCategories: string[]
 *  - currency         : string  ('USD', 'EUR', etc.)
 *  - monthLabel       : string  ('Septiembre 2026')
 */
export const DonutDashboard = ({
  currentMonthData,
  expenseCategories,
  currency,
  monthLabel,
}) => {
  const expenses      = currentMonthData.expenses || [];
  const incomes       = currentMonthData.incomes  || [];
  const totalIncome   = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const available     = totalIncome - totalExpenses;
  const budgets       = currentMonthData.budgets || {};

  // ── Construir segmentos para el donut ─────────────────────
  const catData = expenseCategories
    .map(cat => ({
      name: cat,
      value: expenses
        .filter(e => e.category === cat)
        .reduce((s, e) => s + e.amount, 0),
    }))
    .filter(d => d.value > 0)
    .slice(0, 6);

  const total = catData.reduce((s, d) => s + d.value, 0) || 1;

  // Construir conic-gradient igual que la landing
  let cumPct = 0;
  const conicStops = catData
    .map((d, i) => {
      const pct  = (d.value / total) * 100;
      const stop = `${SLICE_COLORS[i % SLICE_COLORS.length]} ${cumPct.toFixed(1)}% ${(cumPct + pct).toFixed(1)}%`;
      cumPct += pct;
      return stop;
    })
    .join(', ');

  const conicGradient =
    catData.length > 0
      ? `conic-gradient(${conicStops})`
      : 'conic-gradient(#374151 0% 100%)';

  // ── Categorías con presupuesto (máx. 4 barras) ────────────
  const budgetCats = expenseCategories.filter(c => budgets[c] > 0).slice(0, 4);

  // ── KPIs ──────────────────────────────────────────────────
  const kpis = [
    {
      label: 'Ingresos',
      value: totalIncome,
      Icon:  TrendingUp,
      color: 'text-green-400',
      ring:  'border-green-500/40',
    },
    {
      label: 'Gastos',
      value: totalExpenses,
      Icon:  TrendingDown,
      color: 'text-red-400',
      ring:  'border-red-500/40',
    },
    {
      label: 'Disponible',
      value: available,
      Icon:  Wallet,
      color: available >= 0 ? 'text-cyan-400' : 'text-fuchsia-400',
      ring:  available >= 0 ? 'border-cyan-500/40' : 'border-fuchsia-500/40',
    },
  ];

  return (
    <div className="bg-gray-900 rounded-xl border-2 border-cyan-500 p-5 mb-6">

      {/* ── Cabecera ─────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-bold text-sm text-white">{monthLabel}</p>
          <p className="text-xs text-gray-400">Resumen mensual</p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-gray-600 px-2 py-1 text-xs text-cyan-400">
          {currency}
        </div>
      </div>

      {/* ── KPIs ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {kpis.map(({ label, value, Icon, color, ring }) => (
          <div
            key={label}
            className={`rounded-2xl border ${ring} bg-gray-800/60 p-3`}
          >
            <Icon className={`w-4 h-4 ${color}`} />
            <p className="mt-2 text-[10px] uppercase tracking-wide text-gray-400">
              {label}
            </p>
            <p className={`font-bold text-base ${color}`}>
              {formatCurrency(value, currency)}
            </p>
          </div>
        ))}
      </div>

      {/* ── Donut + Barras ───────────────────────────────── */}
      <div className="grid gap-4 rounded-2xl border border-gray-700 bg-gray-800/50 p-4 sm:grid-cols-[auto_1fr]">

        {/* Donut animado */}
        <div className="flex items-center justify-center">
          <div
            className="size-28 rounded-full"
            style={{
              background: conicGradient,
              mask:        'radial-gradient(circle, transparent 52%, black 53%)',
              WebkitMask:  'radial-gradient(circle, transparent 52%, black 53%)',
              animation:   'breathe 2.6s ease-in-out infinite',
            }}
            role="img"
            aria-label="Gráfico de distribución de gastos por categoría"
          />
          {/* Keyframe inyectado inline — no necesita CSS externo */}
          <style>{`
            @keyframes breathe {
              0%, 100% { opacity: 0.55; }
              50%       { opacity: 1;    }
            }
          `}</style>
        </div>

        {/* Leyenda o barras de presupuesto */}
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-xs text-gray-400">
            <PieChart className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            {budgetCats.length > 0
              ? 'Presupuestos por categoría'
              : 'Distribución de gastos'}
          </p>

          {/* Si hay presupuestos → barras semafóricas */}
          {budgetCats.length > 0
            ? budgetCats.map(cat => {
                const spent  = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
                const limit  = budgets[cat];
                const pct    = Math.min((spent / limit) * 100, 100);
                const isOver = spent > limit;
                const isWarn = !isOver && spent / limit >= 0.8;
                const barCls = isOver ? 'bg-red-500' : isWarn ? 'bg-yellow-400' : 'bg-green-500';
                const txtCls = isOver ? 'text-red-400' : isWarn ? 'text-yellow-400' : 'text-green-400';

                return (
                  <div key={cat}>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span className="truncate max-w-[120px]">{cat}</span>
                      <span className={txtCls}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-700">
                      <div className={`h-full rounded-full ${barCls}`} style={{ width: `${pct}%` }} />
                    </div>
                    {isOver && <p className="text-xs text-red-400 mt-0.5">⚠ Límite superado</p>}
                    {isWarn && <p className="text-xs text-yellow-400 mt-0.5">⚡ Cerca del límite</p>}
                  </div>
                );
              })
            // Si no hay presupuestos → leyenda del donut
            : catData.slice(0, 5).map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }}
                  />
                  <span className="text-gray-300 flex-1 truncate">{d.name}</span>
                  <span className="text-gray-400 font-semibold">
                    {((d.value / total) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}

          {catData.length === 0 && (
            <p className="text-xs text-gray-500 italic">Sin gastos este mes</p>
          )}
        </div>
      </div>
    </div>
  );
};