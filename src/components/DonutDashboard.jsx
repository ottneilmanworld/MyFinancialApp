import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

// Colores del donut — mismo orden que la landing
const SLICE_COLORS = [
  '#5B8A72', // verde salvia
  '#6E8FA6', // azul niebla
  '#D97B5B', // terracota
  '#D9A441', // ámbar suave
  '#A9C2D6', // azul claro
  '#8A8578', // gris cálido
];

const RADIUS = 50;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP_FRAC = 0.012; // pequeño espacio visual entre segmentos del aro

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

  // ── Categorías con presupuesto (hasta 6, una por color disponible) ──
  const budgetCats = expenseCategories.filter(c => budgets[c] > 0).slice(0, 6);
  const totalBudget = budgetCats.reduce((s, c) => s + budgets[c], 0);

  // ── Construir segmentos del ARO DE PRESUPUESTO ──────────────
  // Cada categoría ocupa una porción del círculo proporcional a
  // CUÁNTO dinero le asignaste (no una parte igual para todas).
  // Dentro de su porción, se rellena de color sólido según cuánto
  // llevas gastado de ese presupuesto; el resto queda "vacío"
  // (mismo color, pero muy tenue) hasta llegar al límite.
  let cumFrac = 0;
  const budgetSegments = budgetCats.map((cat, i) => {
    const limit = budgets[cat];
    const spent = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
    const weightFrac = totalBudget > 0 ? limit / totalBudget : 0;
    const drawFrac = Math.max(weightFrac - GAP_FRAC, 0.001);
    const spentPct = limit > 0 ? spent / limit : 0;
    const filledFrac = drawFrac * Math.min(spentPct, 1);
    const seg = {
      name: cat,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      startFrac: cumFrac,
      drawFrac,
      filledFrac,
      spent,
      limit,
      spentPct,
      isOver: spent > limit,
      isWarn: spent <= limit && spentPct >= 0.8,
    };
    cumFrac += weightFrac;
    return seg;
  });

  const totalSpentOnBudgeted = budgetSegments.reduce((s, seg) => s + seg.spent, 0);
  const overallPct = totalBudget > 0 ? Math.round((totalSpentOnBudgeted / totalBudget) * 100) : 0;
  const overallColor = overallPct > 100 ? '#F87171' : overallPct >= 80 ? '#FBBF24' : '#4ADE80';

  // ── Datos del donut de RESPALDO (cuando no hay presupuestos) ─
  // Muestra la distribución de gastos por categoría, como antes.
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

  const hasBudgets = budgetCats.length > 0;

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

        {/* Aro */}
        <div className="flex items-center justify-center relative">
          {hasBudgets ? (
            // ── ARO DE PRESUPUESTO: cada porción = % del dinero
            // presupuestado en esa categoría; el relleno sólido =
            // cuánto llevas gastado de ese presupuesto.
            <svg viewBox="0 0 120 120" className="w-28 h-28">
              <g transform="rotate(-90 60 60)">
                {budgetSegments.map(seg => (
                  <React.Fragment key={seg.name}>
                    <circle
                      cx="60" cy="60" r={RADIUS} fill="none"
                      stroke={seg.color}
                      strokeOpacity="0.22"
                      strokeWidth={STROKE}
                      strokeDasharray={`${seg.drawFrac * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                      strokeDashoffset={-seg.startFrac * CIRCUMFERENCE}
                    />
                    <circle
                      cx="60" cy="60" r={RADIUS} fill="none"
                      stroke={seg.color}
                      strokeWidth={STROKE}
                      strokeLinecap="round"
                      strokeDasharray={`${seg.filledFrac * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                      strokeDashoffset={-seg.startFrac * CIRCUMFERENCE}
                    />
                  </React.Fragment>
                ))}
              </g>
            </svg>
          ) : (
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
          )}
          {hasBudgets && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold" style={{ color: overallColor }}>{overallPct}%</span>
              <span className="text-[9px] text-gray-400 uppercase tracking-wide">del presupuesto</span>
            </div>
          )}
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
            {hasBudgets
              ? 'Presupuestos por categoría'
              : 'Distribución de gastos'}
          </p>

          {/* Si hay presupuestos → barras con el MISMO color que su porción del aro */}
          {hasBudgets
            ? budgetSegments.map(seg => {
                const barCls = seg.isOver ? 'bg-red-500' : seg.isWarn ? 'bg-yellow-400' : '';
                const txtCls = seg.isOver ? 'text-red-400' : seg.isWarn ? 'text-yellow-400' : 'text-gray-300';
                const pctShown = Math.min(seg.spentPct * 100, 999);

                return (
                  <div key={seg.name}>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span className="flex items-center gap-1.5 truncate max-w-[140px]">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: seg.color }}
                        />
                        {seg.name}
                      </span>
                      <span className={txtCls}>{pctShown.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-700">
                      <div
                        className={`h-full rounded-full ${barCls}`}
                        style={{
                          width: `${Math.min(seg.spentPct * 100, 100)}%`,
                          background: barCls ? undefined : seg.color,
                        }}
                      />
                    </div>
                    {seg.isOver && <p className="text-xs text-red-400 mt-0.5">⚠ Límite superado</p>}
                    {seg.isWarn && <p className="text-xs text-yellow-400 mt-0.5">⚡ Cerca del límite</p>}
                  </div>
                );
              })
            // Si no hay presupuestos → leyenda del donut de gastos
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

          {!hasBudgets && catData.length === 0 && (
            <p className="text-xs text-gray-500 italic">Sin gastos este mes</p>
          )}
        </div>
      </div>
    </div>
  );
};