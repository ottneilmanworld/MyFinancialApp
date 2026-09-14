export const FLUORESCENT_GREEN = '#39FF14';
export const FLUORESCENT_RED = '#FF073A';
export const VIVID_RED = '#DC2626';

// Categorías de ingresos. "Otros Ingresos" es el "cajón general"
// para lo que no encaje en las demás.
export const INCOME_CATEGORIES = [
  'Salario',
  'Comisiones',
  'Alquiler',
  'Ingresos Pasivos de Inversiones',
  'Negocios Online',
  'Negocios Offline',
  'Otros Ingresos',
];

// Categorías de gastos, pensadas junto a un CFO para separar:
// 🔒 Fijo (no lo puedes evitar) | ⚖️ Variable necesario | 🎯 Discrecional (sí lo puedes reducir)
export const EXPENSE_CATEGORIES = [
  'Vivienda y Servicios Básicos',        // 🔒 alquiler/hipoteca, luz, agua, gas, aseo, alcaldía
  'Transporte',                          // 🔒/⚖️ gasolina, pasajes, seguro, mantenimiento
  'Alimentación (Mercado)',              // ⚖️ supermercado, comida para cocinar en casa
  'Salud',                               // ⚖️ medicinas, consultas, seguro médico
  'Educación',                           // 🔒 colegiatura, cursos
  'Deudas y Préstamos',                  // 🔒 tarjetas de crédito, préstamos
  'Comer Fuera y Antojos',               // 🎯 restaurantes, delivery, cafeterías
  'Telecomunicaciones y Suscripciones',  // 🎯 internet, cable, streaming, IA, gym
  'Entretenimiento y Ocio',              // 🎯 cine, salidas, hobbies
  'Otros Gastos',                        // catch-all
];

export const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const COLORS = ['#FF00FF', '#00FFFF', '#00FF00', '#FF4500', '#8A2BE2', '#F59E0B', '#10B981', '#3B82F6'];

// Monedas disponibles para el selector.
export const CURRENCIES = [
  { code: 'USD', label: 'Dólar estadounidense (USD)', symbol: '$' },
  { code: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  { code: 'MXN', label: 'Peso mexicano (MXN)', symbol: '$' },
  { code: 'COP', label: 'Peso colombiano (COP)', symbol: '$' },
  { code: 'VES', label: 'Bolívar venezolano (VES)', symbol: 'Bs.' },
  { code: 'ARS', label: 'Peso argentino (ARS)', symbol: '$' },
];

export const DEFAULT_CURRENCY = 'USD';

// % sugerido de tus INGRESOS del mes para cada categoría, basado en la
// regla 50/30/20 de finanzas personales (50% necesidades, 30% gustos,
// 20% libre para ahorro/deuda extra). Educación, Deudas y Otros Gastos
// no traen sugerencia porque varían demasiado persona a persona.
export const BUDGET_SUGGESTIONS = {
  'Vivienda y Servicios Básicos': 0.25,
  'Transporte': 0.10,
  'Alimentación (Mercado)': 0.10,
  'Salud': 0.05,
  'Comer Fuera y Antojos': 0.10,
  'Telecomunicaciones y Suscripciones': 0.10,
  'Telecomunicaciones y Subscripciones': 0.10, // variante de ortografía (con "b"), por si la escribiste así
  'Entretenimiento y Ocio': 0.10,
};