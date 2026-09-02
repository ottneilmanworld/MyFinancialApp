// Genera un ID único para cada transacción
export const generateId = () => {
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Formatea el año y el índice del mes (0-11) a una clave 'YYYY-MM'
export const getMonthKey = (year, monthIndex) => {
  const formattedMonth = String(monthIndex + 1).padStart(2, '0');
  return `${year}-${formattedMonth}`;
};