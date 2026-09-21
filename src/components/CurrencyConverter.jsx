import React, { useState, useEffect } from 'react';
import { X, RefreshCw, ArrowDownUp } from 'lucide-react';
import { CURRENCIES } from '../utils/constants';

// Conversor de referencia: consulta tasas del día vía una función segura
// del servidor (/api/exchange-rates). Es SOLO informativo — no cambia
// los montos ya guardados en tus ingresos, gastos o presupuestos.
export const CurrencyConverter = ({ show, onClose }) => {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState('100');
  const [fromCode, setFromCode] = useState('USD');
  const [toCode, setToCode] = useState('VES');

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/exchange-rates');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRates(data);
    } catch (err) {
      setError('No se pudo obtener el tipo de cambio. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && !rates) fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  const swap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const convert = () => {
    if (!rates) return null;
    const fromRate = rates.rates[fromCode];
    const toRate = rates.rates[toCode];
    if (!fromRate || !toRate) return null;
    const usdAmount = parseFloat(amount || 0) / fromRate;
    return usdAmount * toRate;
  };

  const result = convert();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-lg border border-gray-700 p-5 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-bold text-cyan-400">Conversor de Moneda</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {loading && <p className="text-gray-400 text-sm py-6 text-center">Consultando tasas del día...</p>}
        {error && (
          <div className="text-center py-4">
            <p className="text-red-400 text-sm mb-2">{error}</p>
            <button onClick={fetchRates} className="text-cyan-400 text-sm underline">Reintentar</button>
          </div>
        )}

        {rates && !loading && (
          <>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-cyan-400 outline-none"
              />
              <select
                value={fromCode}
                onChange={e => setFromCode(e.target.value)}
                className="bg-gray-700 text-white px-2 py-2 rounded border border-gray-600"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code} disabled={rates.rates[c.code] == null}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center my-1">
              <button
                onClick={swap}
                className="text-gray-400 hover:text-cyan-400 bg-gray-700 hover:bg-gray-600 rounded-full p-1.5"
                title="Invertir monedas"
              >
                <ArrowDownUp size={14} />
              </button>
            </div>

            <div className="flex gap-2 mb-3">
              <div className="flex-1 bg-gray-900 text-cyan-300 font-bold px-3 py-2 rounded border border-gray-600 flex items-center">
                {result !== null ? result.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
              </div>
              <select
                value={toCode}
                onChange={e => setToCode(e.target.value)}
                className="bg-gray-700 text-white px-2 py-2 rounded border border-gray-600"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code} disabled={rates.rates[c.code] == null}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span>Actualizado: {new Date(rates.updatedAt).toLocaleTimeString()}</span>
              <button onClick={fetchRates} className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
                <RefreshCw size={11} /> Actualizar
              </button>
            </div>

            <p className="text-[10px] text-gray-500 mt-3 border-t border-gray-700 pt-2">
              Solo de referencia — no cambia los montos ya guardados en tus ingresos, gastos o presupuestos.
              El Bolívar (VES) usa la tasa P2P de Cotizave; las demás usan tasa oficial de mercado.
            </p>
          </>
        )}
      </div>
    </div>
  );
};