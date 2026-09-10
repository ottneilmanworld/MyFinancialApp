import { CURRENCIES, DEFAULT_CURRENCY } from './constants';

export const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const getMonthKey = (year, monthIndex) => {
  const formattedMonth = String(monthIndex + 1).padStart(2, '0');
  return `${year}-${formattedMonth}`;
};

// Convierte un número en texto con el símbolo de la moneda elegida.
// Ej: formatCurrency(300, 'EUR') -> "€300"
export const formatCurrency = (amount, currencyCode = DEFAULT_CURRENCY) => {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  const formatted = Number(amount || 0).toLocaleString();
  return `${currency.symbol}${formatted}`;
};