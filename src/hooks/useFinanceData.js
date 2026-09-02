import { useState, useEffect, useCallback } from 'react';
import { financeService } from '../services/supabaseService';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, DEFAULT_CURRENCY } from '../utils/constants';
import { getMonthKey } from '../utils/formatters';

export const useFinanceData = (userId) => {
  const [monthlyData, setMonthlyData] = useState({});
  const [incomeCategories, setIncomeCategories] = useState(INCOME_CATEGORIES);
  const [expenseCategories, setExpenseCategories] = useState(EXPENSE_CATEGORIES);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('synced');

  // FIX: convierte etiquetas de mes viejas (ej. "2026-8", sin cero) al
  // formato nuevo y correcto ("2026-09"). Si ya está en formato nuevo,
  // la deja igual. Esto repara datos guardados antes del fix de fechas.
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
        budgets: {},
      };
    }
    if (raw.months) {
      return {
        months: raw.months || {},
        incomeCategories: raw.incomeCategories || INCOME_CATEGORIES,
        expenseCategories: raw.expenseCategories || EXPENSE_CATEGORIES,
        currency: raw.currency || DEFAULT_CURRENCY,
        budgets: raw.budgets || {},
      };
    }
    // Formato viejo: `raw` ES el objeto de meses directamente (sin wrapper)
    return {
      months: raw,
      incomeCategories: INCOME_CATEGORIES,
      expenseCategories: EXPENSE_CATEGORIES,
      currency: DEFAULT_CURRENCY,
      budgets: {},
    };
  };

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
          setBudgets(parsed.budgets);
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
        setBudgets(parsed.budgets);
        localStorage.setItem(`dreamteam-data-${userId}`, JSON.stringify(parsed));
        await financeService.saveUserData(userId, parsed);
        setSyncStatus('synced');
      } else {
        setSyncStatus('synced');
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const persistAll = async (
    newMonths = monthlyData,
    newIncomeCategories = incomeCategories,
    newExpenseCategories = expenseCategories,
    newCurrency = currency,
    newBudgets = budgets
  ) => {
    if (!userId) return;
    setMonthlyData(newMonths);
    setIncomeCategories(newIncomeCategories);
    setExpenseCategories(newExpenseCategories);
    setCurrency(newCurrency);
    setBudgets(newBudgets);

    const payload = {
      months: newMonths,
      incomeCategories: newIncomeCategories,
      expenseCategories: newExpenseCategories,
      currency: newCurrency,
      budgets: newBudgets,
    };
    localStorage.setItem(`dreamteam-data-${userId}`, JSON.stringify(payload));
    setSyncStatus('pending');

    try {
      await financeService.saveUserData(userId, payload);
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error guardando en Supabase:', err.message);
      setSyncStatus('error');
    }
  };

  const updateMonthlyData = async (newData) => {
    await persistAll(newData, incomeCategories, expenseCategories, currency, budgets);
  };

  const updateCurrency = async (newCurrency) => {
    await persistAll(monthlyData, incomeCategories, expenseCategories, newCurrency, budgets);
  };

  const updateBudgets = async (newBudgets) => {
    await persistAll(monthlyData, incomeCategories, expenseCategories, currency, newBudgets);
  };

  const syncWhenOnline = useCallback(async () => {
    if (!userId) return;
    const localRaw = localStorage.getItem(`dreamteam-data-${userId}`);
    if (localRaw && syncStatus !== 'synced') {
      try {
        const parsed = parseStoredPayload(JSON.parse(localRaw));
        await persistAll(parsed.months, parsed.incomeCategories, parsed.expenseCategories, parsed.currency, parsed.budgets);
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
    budgets,
    loading,
    syncStatus,
    updateMonthlyData,
    updateCurrency,
    updateBudgets,
    persistAll,
  };
};