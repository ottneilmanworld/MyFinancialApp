import React, { useState } from 'react';
import { PieChart, SlidersHorizontal } from 'lucide-react';

// Colores del donut — mismo orden que la landing
const SLICE_COLORS = [
  '#5B8A72', // verde salvia
  '#6E8FA6', // azul niebla
  '#D97B5B', // terracota
  '#D9A441', // ámbar suave
  '#A9C2D6', // azul claro
  '#C46B6B', // rojo ladrillo
  '#8A6FB0', // lavanda
  '#5FA8A0', // turquesa
  '#B8925A', // ocre
  '#8A8578', // gris cálido
];

const OUTER_RADIUS = 54;
const OUTER_STROKE = 4;   // borde delgado, SIEMPRE visible con color fuerte
const INNER_RADIUS = 45;
const INNER_STROKE = 13;  // relleno grueso, crece según gastas
const OUTER_CIRC = 2 * Math.PI * OUTER_RADIUS;
const INNER_CIRC = 2 * Math.PI * INNER_RADIUS;
const GAP_FRAC = 0.012; // pequeño espacio visual entre segmentos del aro

/**
 * DonutDashboard
 * Tarjeta de resumen mensual con un aro que se puede alternar entre:
 *  - "budget"       -> cuánto llevas de cada presupuesto por categoría
 *  - "distribution" -> cómo se reparte tu gasto total entre categorías
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
  const expenses = currentMonthData.expenses || [];
  const budgets  = currentMonthData.budgets  || {};

  // ── Categorías con presupuesto (hasta 6, una por color disponible) ──
  const budgetCats  = expenseCategories.filter(c => budgets[c] > 0);
  const hasBudgets  = budgetCats.length > 0;
  const totalBudget = budgetCats.reduce((s, c) => s + budgets[c], 0);

  // Qué aro se muestra: si ya tienes presupuestos, arrancamos mostrando
  // ESE (para eso los configuraste); si no, mostramos la distribución.
  const [viewMode, setViewMode] = useState(hasBudgets ? 'budget' : 'distribution');
  const showingBudget = viewMode === 'budget' && hasBudgets;

  // ── Segmentos del ARO DE PRESUPUESTO ─────────────────────────
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
  const overallPct   = totalBudget > 0 ? Math.round((totalSpentOnBudgeted / totalBudget) * 100) : 0;
  const overallColor = overallPct > 100 ? '#F87171' : overallPct >= 80 ? '#FBBF24' : '#4ADE80';

  // ── Datos del ARO DE DISTRIBUCIÓN (gasto por categoría) ──────
  const catData = expenseCategories
    .map(cat => ({
      name: cat,
      value: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
    }))
    .filter(d => d.value > 0)
    .slice(0, 10);

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

  return (
    <div className="bg-gray-900 rounded-xl border-2 border-cyan-500 p-5 mb-6">

      {/* ── Cabecera ─────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <p className="font-bold text-sm text-white">{monthLabel}</p>
          <p className="text-xs text-gray-400">Resumen mensual</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón para alternar entre los 2 aros — solo aparece si hay presupuestos */}
          {hasBudgets && (
            <div className="flex rounded-full border border-gray-600 overflow-hidden text-[11px]">
              <button
                onClick={() => setViewMode('budget')}
                className={`px-3 py-1 flex items-center gap-1 transition-colors ${
                  viewMode === 'budget' ? 'bg-cyan-500 text-black font-semibold' : 'text-gray-400 hover:text-white'
                }`}
                title="Ver avance de presupuestos"
              >
                <SlidersHorizontal size={11} /> Presupuesto
              </button>
              <button
                onClick={() => setViewMode('distribution')}
                className={`px-3 py-1 flex items-center gap-1 transition-colors ${
                  viewMode === 'distribution' ? 'bg-cyan-500 text-black font-semibold' : 'text-gray-400 hover:text-white'
                }`}
                title="Ver distribución de gastos"
              >
                <PieChart size={11} /> Distribución
              </button>
            </div>
          )}
          <div className="flex items-center gap-1 rounded-full border border-gray-600 px-2 py-1 text-xs text-cyan-400">
            {currency}
          </div>
        </div>
      </div>

      {/* ── Donut + Barras / Leyenda ─────────────────────── */}
      <div className="grid gap-4 rounded-2xl border border-gray-700 bg-gray-800/50 p-4 sm:grid-cols-[auto_1fr]">

        {/* Aro */}
        <div className="flex items-center justify-center relative">
          {showingBudget ? (
            // ── ARO DE PRESUPUESTO: cada porción = % del dinero
            // presupuestado en esa categoría; el relleno sólido =
            // cuánto llevas gastado de ese presupuesto.
            <svg viewBox="0 0 120 120" className="w-28 h-28">
              <g transform="rotate(-90 60 60)">
                {budgetSegments.map(seg => (
                  <React.Fragment key={seg.name}>
                    {/* Borde exterior: SIEMPRE muestra el tamaño completo
                        de la categoría, en su color fuerte y vivo. */}
                    <circle
                      cx="60" cy="60" r={OUTER_RADIUS} fill="none"
                      stroke={seg.color}
                      strokeWidth={OUTER_STROKE}
                      strokeDasharray={`${seg.drawFrac * OUTER_CIRC} ${OUTER_CIRC}`}
                      strokeDashoffset={-seg.startFrac * OUTER_CIRC}
                    />
                    {/* Pista interior vacía: el "molde" apagado que se
                        va a ir rellenando según gastas. */}
                    <circle
                      cx="60" cy="60" r={INNER_RADIUS} fill="none"
                      stroke={seg.color}
                      strokeOpacity="0.18"
                      strokeWidth={INNER_STROKE}
                      strokeDasharray={`${seg.drawFrac * INNER_CIRC} ${INNER_CIRC}`}
                      strokeDashoffset={-seg.startFrac * INNER_CIRC}
                    />
                    {/* Relleno interior: crece de 0% a 100% del ancho de
                        la sección según cuánto llevas gastado. */}
                    <circle
                      cx="60" cy="60" r={INNER_RADIUS} fill="none"
                      stroke={seg.color}
                      strokeOpacity="0.75"
                      strokeWidth={INNER_STROKE}
                      strokeDasharray={`${seg.filledFrac * INNER_CIRC} ${INNER_CIRC}`}
                      strokeDashoffset={-seg.startFrac * INNER_CIRC}
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
          {showingBudget && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold" style={{ color: overallColor }}>{overallPct}%</span>
              <span className="text-[9px] text-gray-400 uppercase tracking-wide text-center px-1">del presupuesto</span>
            </div>
          )}
          <style>{`
            @keyframes breathe {
              0%, 100% { opacity: 0.55; }
              50%       { opacity: 1;    }
            }
          `}</style>
        </div>

        {/* Barras (presupuesto) o Leyenda (distribución) */}
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-xs text-gray-400">
            <PieChart className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            {showingBudget ? 'Presupuestos por categoría' : 'Distribución de gastos'}
          </p>

          {showingBudget
            ? budgetSegments.map(seg => {
                const barCls   = seg.isOver ? 'bg-red-500' : seg.isWarn ? 'bg-yellow-400' : '';
                const txtCls   = seg.isOver ? 'text-red-400' : seg.isWarn ? 'text-yellow-400' : 'text-gray-300';
                const pctShown = Math.min(seg.spentPct * 100, 999);

                return (
                  <div key={seg.name}>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span className="flex items-center gap-1.5 truncate max-w-[140px]">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: seg.color }} />
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
            : catData.slice(0, 10).map((d, i) => {
                const pct = (d.value / total) * 100;
                const color = SLICE_COLORS[i % SLICE_COLORS.length];
                return (
                  <div key={d.name}>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span className="flex items-center gap-1.5 truncate max-w-[140px]">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                        {d.name}
                      </span>
                      <span className="text-gray-300">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-700">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}

          {!showingBudget && catData.length === 0 && (
            <p className="text-xs text-gray-500 italic">Sin gastos este mes</p>
          )}
        </div>
      </div>
    </div>
  );
};