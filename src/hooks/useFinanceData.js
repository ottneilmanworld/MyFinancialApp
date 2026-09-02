import { useState, useEffect, useCallback } from 'react';
import { financeService } from '../services/supabaseService';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants';

export const useFinanceData = (userId) => {
  const [monthlyData, setMonthlyData] = useState({});
  const [incomeCategories, setIncomeCategories] = useState(INCOME_CATEGORIES);
  const [expenseCategories, setExpenseCategories] = useState(EXPENSE_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('synced');

  // Parsea el payload asegurando compatibilidad con estructuras previas o vacías
  const parseStoredPayload = (raw) => {
    if (!raw) {
      return {
        months: {},
        incomeCategories: INCOME_CATEGORIES,
        expenseCategories: EXPENSE_CATEGORIES,
      };
    }

    if (raw.months) {
      return {
        months: raw.months || {},
        incomeCategories: raw.incomeCategories || INCOME_CATEGORIES,
        expenseCategories: raw.expenseCategories || EXPENSE_CATEGORIES,
      };
    }

    return {
      months: raw,
      incomeCategories: INCOME_CATEGORIES,
      expenseCategories: EXPENSE_CATEGORIES,
    };
  };

  // Carga inicial de datos desde localStorage y sincronización con Supabase
  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const localRaw = localStorage.getItem(`dreamteam-data-${userId}`);
      if (localRaw) {
        try {
          const parsed = parseStoredPayload(JSON.parse(localRaw));
          setMonthlyData(parsed.months);
          setIncomeCategories(parsed.incomeCategories);
          setExpenseCategories(parsed.expenseCategories);
        } catch (err) {
          console.error('Error parseando localStorage:', err);
        }
      }

      const remoteRaw = await financeService.fetchUserData(userId);
      if (remoteRaw) {
        const parsed = parseStoredPayload(remoteRaw);
        setMonthlyData(parsed.months);
        setIncomeCategories(parsed.incomeCategories);
        setExpenseCategories(parsed.expenseCategories);
        localStorage.setItem(`dreamteam-data-${userId}`, JSON.stringify(parsed));
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

  // Persiste cambios localmente y los sube a la base de datos
  const persistAll = async (
    newMonths = monthlyData,
    newIncomeCategories = incomeCategories,
    newExpenseCategories = expenseCategories
  ) => {
    if (!userId) return;

    setMonthlyData(newMonths);
    setIncomeCategories(newIncomeCategories);
    setExpenseCategories(newExpenseCategories);

    const payload = {
      months: newMonths,
      incomeCategories: newIncomeCategories,
      expenseCategories: newExpenseCategories,
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
    await persistAll(newData, incomeCategories, expenseCategories);
  };

  // Escucha el evento online para reconectar y reintentar la sincronización pendiente
  const syncWhenOnline = useCallback(async () => {
    if (!userId) return;

    const localRaw = localStorage.getItem(`dreamteam-data-${userId}`);
    if (localRaw && syncStatus !== 'synced') {
      try {
        const parsed = parseStoredPayload(JSON.parse(localRaw));
        await persistAll(
          parsed.months,
          parsed.incomeCategories,
          parsed.expenseCategories
        );
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
    loading,
    syncStatus,
    updateMonthlyData,
    persistAll,
  };
};