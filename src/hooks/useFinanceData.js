import { useState, useEffect, useCallback, useRef } from 'react';
import { financeService } from '../services/supabaseService';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, DEFAULT_CURRENCY } from '../utils/constants';
import { getMonthKey } from '../utils/formatters';

export const useFinanceData = (userId) => {
  const [monthlyData, setMonthlyData] = useState({});
  const [incomeCategories, setIncomeCategories] = useState(INCOME_CATEGORIES);
  const [expenseCategories, setExpenseCategories] = useState(EXPENSE_CATEGORIES);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('synced');

  // FIX (race condition): antes, cada updateMonthlyData/persistAll disparaba un
  // upsert inmediato. Si el usuario edita rápido (o hay 2 dispositivos activos),
  // varios `saveUserData` podían viajar en paralelo y el más lento en responder
  // podía sobreescribir al más rápido con datos desactualizados ("last write wins"
  // pero no necesariamente el último que el USUARIO hizo).
  // Ahora encolamos: solo dejamos correr un save a la vez y siempre guardamos
  // el payload MÁS RECIENTE pendiente, no cada intermedio.
  const savingRef = useRef(false);
  const pendingPayloadRef = useRef(null);

  const migrateMonthKeys = (months) => {
    const migrated = {};
    Object.entries(months || {}).forEach(([key, value]) => {
      const match = key.match(/^(\d{4})-(\d)$/);
      if (match) {
        const [, year, monthDigit] = match;
        const newKey = getMonthKey(Number(year), Number(monthDigit));
        if (migrated[newKey]) {
          migrated[newKey] = {
            incomes: [...(migrated[newKey].incomes || []), ...(value.incomes || [])],
            expenses: [...(migrated[newKey].expenses || []), ...(value.expenses || [])],
          };
        } else {
          migrated[newKey] = value;
        }
      } else {
        migrated[key] = value;
      }
    });
    return migrated;
  };

  const parseStoredPayload = (raw) => {
    if (!raw) {
      return {
        months: {},
        incomeCategories: INCOME_CATEGORIES,
        expenseCategories: EXPENSE_CATEGORIES,
        currency: DEFAULT_CURRENCY,
      };
    }
    if (raw.months) {
      return {
        months: raw.months || {},
        incomeCategories: raw.incomeCategories || INCOME_CATEGORIES,
        expenseCategories: raw.expenseCategories || EXPENSE_CATEGORIES,
        currency: raw.currency || DEFAULT_CURRENCY,
      };
    }
    // Formato viejo: `raw` ES el objeto de meses directamente (sin wrapper)
    return {
      months: raw,
      incomeCategories: INCOME_CATEGORIES,
      expenseCategories: EXPENSE_CATEGORIES,
      currency: DEFAULT_CURRENCY,
    };
  };

  // FIX (write redundante): loadData YA NO vuelve a guardar en Supabase lo que
  // acaba de leer. Antes hacía fetch -> save inmediato, lo cual: (a) gastaba una
  // escritura innecesaria en cada apertura de la app, y (b) abría una ventana de
  // carrera: si otro dispositivo guardaba algo justo en ese instante, este
  // "guardar lo que acabo de leer" podía pisarlo. Cargar datos ahora es una
  // operación de SOLO LECTURA.
  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const localRaw = localStorage.getItem(`dreamteam-data-${userId}`);
      if (localRaw) {
        try {
          const parsed = parseStoredPayload(JSON.parse(localRaw));
          parsed.months = migrateMonthKeys(parsed.months);
          setMonthlyData(parsed.months);
          setIncomeCategories(parsed.incomeCategories);
          setExpenseCategories(parsed.expenseCategories);
          setCurrency(parsed.currency);
        } catch (err) {
          console.error('Error parseando localStorage:', err);
        }
      }

      const remoteRaw = await financeService.fetchUserData(userId);
      if (remoteRaw) {
        const parsed = parseStoredPayload(remoteRaw);
        parsed.months = migrateMonthKeys(parsed.months);
        setMonthlyData(parsed.months);
        setIncomeCategories(parsed.incomeCategories);
        setExpenseCategories(parsed.expenseCategories);
        setCurrency(parsed.currency);
        // Solo persistimos localmente (cache), NO reescribimos Supabase.
        localStorage.setItem(`dreamteam-data-${userId}`, JSON.stringify(parsed));
      }
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error cargando datos:', err);
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Procesa la cola de guardado: si hay un save en curso, no lanza otro;
  // cuando termina, revisa si llegó un payload más nuevo mientras tanto y lo
  // guarda a continuación. Así nunca se pierden ediciones intermedias y nunca
  // hay 2 upserts corriendo en paralelo para el mismo usuario.
  const flushSave = useCallback(async () => {
    if (savingRef.current) return;
    const payload = pendingPayloadRef.current;
    if (!payload) return;

    savingRef.current = true;
    pendingPayloadRef.current = null;
    setSyncStatus('pending');

    try {
      await financeService.saveUserData(userId, payload);
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error guardando en Supabase:', err.message);
      setSyncStatus('error');
    } finally {
      savingRef.current = false;
      // Si llegó un payload nuevo mientras guardábamos, lo procesamos ahora.
      if (pendingPayloadRef.current) {
        flushSave();
      }
    }
  }, [userId]);

  const persistAll = async (
    newMonths = monthlyData,
    newIncomeCategories = incomeCategories,
    newExpenseCategories = expenseCategories,
    newCurrency = currency
  ) => {
    if (!userId) return;
    setMonthlyData(newMonths);
    setIncomeCategories(newIncomeCategories);
    setExpenseCategories(newExpenseCategories);
    setCurrency(newCurrency);

    const payload = {
      months: newMonths,
      incomeCategories: newIncomeCategories,
      expenseCategories: newExpenseCategories,
      currency: newCurrency,
    };
    localStorage.setItem(`dreamteam-data-${userId}`, JSON.stringify(payload));
    pendingPayloadRef.current = payload;
    flushSave();
  };

  const updateMonthlyData = async (newData) => {
    await persistAll(newData, incomeCategories, expenseCategories, currency);
  };

  const updateCurrency = async (newCurrency) => {
    await persistAll(monthlyData, incomeCategories, expenseCategories, newCurrency);
  };

  const syncWhenOnline = useCallback(async () => {
    if (!userId) return;
    const localRaw = localStorage.getItem(`dreamteam-data-${userId}`);
    if (localRaw && syncStatus !== 'synced') {
      try {
        const parsed = parseStoredPayload(JSON.parse(localRaw));
        await persistAll(parsed.months, parsed.incomeCategories, parsed.expenseCategories, parsed.currency);
      } catch (err) {
        console.error('Error en sincronización:', err);
      }
    }
  }, [userId, syncStatus]);

  useEffect(() => {
    if (userId) loadData();
  }, [userId, loadData]);

  useEffect(() => {
    window.addEventListener('online', syncWhenOnline);
    return () => window.removeEventListener('online', syncWhenOnline);
  }, [syncWhenOnline]);

  return {
    monthlyData,
    incomeCategories,
    expenseCategories,
    currency,
    loading,
    syncStatus,
    updateMonthlyData,
    updateCurrency,
    persistAll,
  };
};