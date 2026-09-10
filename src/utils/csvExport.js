// Convierte los ingresos y gastos de UN mes a un archivo .csv y lo descarga.
export const exportMonthToCSV = (monthLabel, currentMonthData, currency) => {
  const rows = [['Tipo', 'Categoría', 'Descripción', 'Fecha', 'Monto', 'Moneda', 'Detalle']];

  (currentMonthData.incomes || []).forEach(inc => {
    rows.push(['Ingreso', inc.category, inc.description || '', inc.date, inc.amount, currency, '']);
  });

  (currentMonthData.expenses || []).forEach(exp => {
    const detalle = (exp.items && exp.items.length > 0)
      ? exp.items.map(it => `${it.concept}: ${it.amount}`).join(' | ')
      : '';
    rows.push(['Gasto', exp.category, exp.description || '', exp.date, exp.amount, currency, detalle]);
  });

  const csvContent = rows
    .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // El '\uFEFF' al inicio ayuda a que Excel abra bien los acentos (á, é, í, ó, ú, ñ).
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-${monthLabel.replace(/\s+/g, '-').toLowerCase()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};