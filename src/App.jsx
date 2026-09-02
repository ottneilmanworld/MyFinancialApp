import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Auth from './Auth'; 
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line
} from 'recharts';
import {
  Plus, Edit2, Trash2, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Wallet,
  Calendar, ChevronLeft, ChevronRight,
  Settings, Eye, LogOut
} from 'lucide-react';
import { useFinanceData } from './hooks/useFinanceData';
import { FLUORESCENT_GREEN, FLUORESCENT_RED, VIVID_RED, INCOME_CATEGORIES, EXPENSE_CATEGORIES, monthNames, COLORS } from './utils/constants';
import { generateId, getMonthKey } from './utils/formatters';

const headerStyles = `
  .static-header {
    background: linear-gradient(90deg, #000000 0%, ${FLUORESCENT_GREEN} 50%, #000000 100%);
    background-size: 100% 100%;
  }
  .author-text-glow {
    color: white;
    text-shadow: 1px 1px 2px black, 0 0 10px ${FLUORESCENT_GREEN}, 0 0 20px ${FLUORESCENT_RED};
  }
  .subtitle-text-shadow {
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  }
`;

// ==================== COMPONENTES ====================
const ResummarCard = ({ title, value, icon: Icon, color, bg, isHighlight = false }) => (
  <div
    className={`flex-1 min-w-[220px] flex flex-col items-center justify-center gap-3 px-8 py-6 rounded-lg font-bold
      transition-all hover:scale-[1.02] hover:shadow-lg cursor-default border-2
      ${isHighlight ? 'border-cyan-400 shadow-lg shadow-cyan-400/50' : 'border-gray-700'}`}
    style={{ background: bg }}
  >
    <Icon className="w-10 h-10" style={{ color }} />
    <p className="text-xs uppercase tracking-widest text-gray-300 font-bold">{title}</p>
    <p className="text-4xl font-black" style={{ color }}>${value.toLocaleString()}</p>
  </div>
);
    
const CategoryManager = ({ categories, show, onEdit, onDelete, onClose, title }) => {
  const [editing, setEditing] = useState(null);
  const [value, setValue] = useState('');

  if (!show) return null;

  return (
    <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h4 className="text-lg font-bold mb-3 text-fuchsia-400 flex items-center gap-2">
        <Settings size={20} /> {title}
      </h4>
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
            {editing === cat ? (
              <>
                <input
                  type="text"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  className="flex-1 bg-gray-600 text-white px-3 py-1 rounded border border-gray-500 focus:border-fuchsia-400"
                />
                <button onClick={() => { onEdit(cat, value); setEditing(null); }} className="bg-lime-500 px-3 py-1 rounded text-sm text-white hover:bg-lime-600">Guardar</button>
                <button onClick={() => setEditing(null)} className="bg-gray-600 px-3 py-1 rounded text-sm text-white hover:bg-gray-700">Cancelar</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-gray-200">{cat}</span>
                <button onClick={() => { setEditing(cat); setValue(cat); }} className="text-cyan-400 hover:text-cyan-300"><Edit2 size={16} /></button>
                <button onClick={() => onDelete(cat)} className="text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
              </>
            )}
          </div>
        ))}
      </div>
      <button onClick={onClose} className="mt-3 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">Cerrar</button>
    </div>
  );
};

const DetailModal = ({ isOpen, title, items, onClose, isIncome = false }) => {
  const [expandedItem, setExpandedItem] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-cyan-500">
        <div className="sticky top-0 bg-gray-900 border-b border-cyan-500 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold" style={{ color: FLUORESCENT_GREEN }}>{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-light">×</button>
        </div>

        <div className="p-6 space-y-3">
          {items.length > 0 ? (
            items.map(item => (
              <div key={item.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <button
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  className="w-full p-4 flex justify-between items-center hover:bg-gray-750 transition-colors text-left"
                >
                  <div className="flex-1">
                    <p className="text-white font-semibold text-lg">{item.category}</p>
                    <p className="text-gray-400 text-sm">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-white font-bold text-2xl" style={{ color: FLUORESCENT_GREEN }}>
                      ${item.amount.toLocaleString()}
                    </p>
                    <ChevronDown
                      size={24}
                      className={`text-cyan-400 transition-transform ${
                        expandedItem === item.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {expandedItem === item.id && (
                  <div className="border-t border-gray-700 bg-gray-750 p-4 space-y-3">
                    {item.description && (
                      <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase">Descripción</p>
                        <p className="text-gray-200 mt-1">{item.description}</p>
                      </div>
                    )}

                    {!isIncome && item.items && item.items.length > 0 && (
                      <div className="border-t border-gray-700 pt-3">
                        <p className="text-gray-300 text-sm font-semibold mb-2">
                          Detalles ({item.items.length} {item.items.length === 1 ? 'item' : 'items'}):
                        </p>
                        <div className="space-y-2 bg-gray-800 p-3 rounded">
                          {item.items.map((subitem, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span className="text-gray-300 text-sm">{subitem.concept}</span>
                              <span className="text-cyan-400 font-semibold text-sm">
                                ${subitem.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between items-center font-bold">
                            <span className="text-gray-300">Subtotal</span>
                            <span className="text-green-400">
                              ${item.items.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isIncome && (!item.items || item.items.length === 0) && (
                      <p className="text-gray-500 text-sm italic">Sin detalles de items</p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-12 text-lg">No hay registros para este periodo</p>
          )}
        </div>
      </div>
    </div>
  );
};

const GraphsCollapsible = ({ monthlyData, currentMonthData, categories, incomeCategories }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedGraph, setSelectedGraph] = useState('expenses');

  const expensesByCategory = categories
    .map(cat => {
      const total = currentMonthData.expenses.reduce((sum, e) => sum + (e.category === cat ? e.amount : 0), 0);
      return { name: cat, value: total };
    })
    .filter(item => item.value > 0);

  const incomeByCategory = incomeCategories
    .map(cat => {
      const total = currentMonthData.incomes.reduce((sum, i) => sum + (i.category === cat ? i.amount : 0), 0);
      return { name: cat, value: total };
    })
    .filter(item => item.value > 0);

  const monthlyComparison = Object.entries(monthlyData)
    .sort(([keyA], [keyB]) => {
      const [yA, mA] = keyA.split('-').map(Number);
      const [yB, mB] = keyB.split('-').map(Number);
      if (yA !== yB) return yA - yB;
      return mA - mB;
    })
    .map(([key, data]) => {
      const [y, m] = key.split('-').map(Number);
      const ingresos = data.incomes.reduce((sum, i) => sum + i.amount, 0);
      const gastos = data.expenses.reduce((sum, e) => sum + e.amount, 0);
      return {
        month: `${monthNames[m]} ${y}`,
        ingresos,
        gastos,
        disponible: ingresos - gastos
      };
    });

  const totalIncome = currentMonthData.incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = currentMonthData.expenses.reduce((sum, e) => sum + e.amount, 0);
  const available = totalIncome - totalExpenses;

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg border-2 border-cyan-500">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center"
      >
        <h3 className="text-xl font-bold text-cyan-400">Gráficos Financieros</h3>
        {expanded ? <ChevronUp size={24} className="text-cyan-400" /> : <ChevronDown size={24} className="text-cyan-400" />}
      </button>

      {expanded && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGraph('expenses')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedGraph === 'expenses'
                  ? 'bg-fuchsia-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Gastos por Categoría
            </button>
            <button
              onClick={() => setSelectedGraph('incomes')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedGraph === 'incomes'
                  ? 'bg-lime-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Ingresos por Categoría
            </button>
            <button
              onClick={() => setSelectedGraph('summary')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedGraph === 'summary'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Resumen del Mes
            </button>
            <button
              onClick={() => setSelectedGraph('comparison')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedGraph === 'comparison'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Comparación Mensual
            </button>
          </div>

          <div className="mt-6">
            {selectedGraph === 'expenses' && (
              <div>
                <h4 className="text-lg font-bold mb-4 text-fuchsia-400">Gastos por Categoría</h4>
                {expensesByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-center py-8">No hay gastos en este período</p>
                )}
              </div>
            )}

            {selectedGraph === 'incomes' && (
              <div>
                <h4 className="text-lg font-bold mb-4 text-lime-400">Ingresos por Categoría</h4>
                {incomeByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={incomeByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {incomeByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-center py-8">No hay ingresos en este período</p>
                )}
              </div>
            )}

            {selectedGraph === 'summary' && (
              <div>
                <h4 className="text-lg font-bold mb-4 text-orange-400">Resumen del Mes</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={[
                      { name: 'Ingresos', value: totalIncome, fill: '#00FF00' },
                      { name: 'Gastos', value: totalExpenses, fill: '#FF4500' },
                      { name: 'Disponible', value: available, fill: available >= 0 ? '#00FFFF' : '#FF00FF' }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {selectedGraph === 'comparison' && (
              <div>
                <h4 className="text-lg font-bold mb-4 text-purple-400">Comparación Mensual</h4>
                {monthlyComparison.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={monthlyComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="ingresos" stroke="#00FF00" strokeWidth={3} name="Ingresos" />
                      <Line type="monotone" dataKey="gastos" stroke="#FF4500" strokeWidth={3} name="Gastos" />
                      <Line type="monotone" dataKey="disponible" stroke="#FF00FF" strokeWidth={3} name="Disponible" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-center py-8">No hay datos para comparar</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== APP PRINCIPAL ====================
const DreamTeamFinanceApp = () => {
  // 🔒 Estado de autenticación
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 🆔 ID del usuario autenticado
  const userId = session?.user?.id;

  // Estado de fecha
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Datos y sincronización: ahora vienen del hook useFinanceData
  // (antes esta lógica vivía aquí mismo, duplicada y mezclada con la UI)
  const {
    monthlyData,
    incomeCategories,
    expenseCategories,
    loading,
    syncStatus,
    updateMonthlyData,
    persistAll,
  } = useFinanceData(userId);

  // UI - Formularios
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeCategoryForm, setShowIncomeCategoryForm] = useState(false);
  const [showExpenseCategoryForm, setShowExpenseCategoryForm] = useState(false);
  const [showIncomeCategoryManager, setShowIncomeCategoryManager] = useState(false);
  const [showExpenseCategoryManager, setShowExpenseCategoryManager] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  // Modales de detalle
  const [showIncomeDetail, setShowIncomeDetail] = useState(false);
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);

  // Campos de Formulario
  const [incomeForm, setIncomeForm] = useState({ category: '', amount: '', date: '', description: '' });
  const [expenseForm, setExpenseForm] = useState({ category: '', amount: '', date: '', description: '', items: [] });
  const [newExpenseItem, setNewExpenseItem] = useState({ concept: '', amount: '' });
  const [newIncomeCategory, setNewIncomeCategory] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [editingItemIdx, setEditingItemIdx] = useState(null);

  // Datos del mes actual
  // FIX: antes era `${currentYear}-${currentMonth}` (generaba "2026-0" para Enero).
  // Ahora usamos getMonthKey, que genera "2026-01" (formato correcto y ordenable).
  const monthKey = getMonthKey(currentYear, currentMonth);
  const currentMonthData = monthlyData[monthKey] || { incomes: [], expenses: [] };

  // Totales
  const totalIncome = currentMonthData.incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = currentMonthData.expenses.reduce((sum, e) => sum + e.amount, 0);
  const available = totalIncome - totalExpenses;

  // 🔒 Verificar autenticación al iniciar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // ==================== VISTAS DE ESTADO ====================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Verificando autenticación...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Cargando datos...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  // ==================== FUNCIONES INGRESOS ====================
  const handleAddIncome = async () => {
    if (incomeForm.category && incomeForm.amount && incomeForm.date) {
      const newIncome = {
        id: generateId(),
        category: incomeForm.category,
        amount: parseFloat(incomeForm.amount),
        date: incomeForm.date,
        description: incomeForm.description || '',
        items: []
      };
      const newData = {
        ...monthlyData,
        [monthKey]: {
          ...currentMonthData,
          incomes: [...currentMonthData.incomes, newIncome]
        }
      };
      await updateMonthlyData(newData);
      setIncomeForm({ category: '', amount: '', date: '', description: '' });
      setShowIncomeForm(false);
    }
  };

  const handleEditIncome = (inc) => {
    setEditingIncome(inc.id);
    setIncomeForm({
      category: inc.category,
      amount: inc.amount.toString(),
      date: inc.date,
      description: inc.description || ''
    });
    setShowIncomeForm(true);
  };

  const handleUpdateIncome = async () => {
    if (editingIncome && incomeForm.category && incomeForm.amount && incomeForm.date) {
      const updatedIncomes = currentMonthData.incomes.map(inc =>
        inc.id === editingIncome
          ? {
              ...inc,
              category: incomeForm.category,
              amount: parseFloat(incomeForm.amount),
              date: incomeForm.date,
              description: incomeForm.description || ''
            }
          : inc
      );
      await updateMonthlyData({
        ...monthlyData,
        [monthKey]: { ...currentMonthData, incomes: updatedIncomes }
      });
      setIncomeForm({ category: '', amount: '', date: '', description: '' });
      setShowIncomeForm(false);
      setEditingIncome(null);
    }
  };

  const handleDeleteIncome = async (id) => {
    await updateMonthlyData({
      ...monthlyData,
      [monthKey]: {
        ...currentMonthData,
        incomes: currentMonthData.incomes.filter(inc => inc.id !== id)
      }
    });
  };

  // ==================== FUNCIONES GASTOS ====================
  const handleAddExpense = async () => {
    if (expenseForm.category && expenseForm.amount && expenseForm.date) {
      const newExpense = {
        id: generateId(),
        category: expenseForm.category,
        amount: parseFloat(expenseForm.amount),
        date: expenseForm.date,
        description: expenseForm.description || '',
        items: expenseForm.items || []
      };
      await updateMonthlyData({
        ...monthlyData,
        [monthKey]: {
          ...currentMonthData,
          expenses: [...currentMonthData.expenses, newExpense]
        }
      });
      setExpenseForm({ category: '', amount: '', date: '', description: '', items: [] });
      setShowExpenseForm(false);
    }
  };

  const handleEditExpense = (exp) => {
    setEditingExpense(exp.id);
    setExpenseForm({
      category: exp.category,
      amount: exp.amount.toString(),
      date: exp.date,
      description: exp.description || '',
      items: exp.items || []
    });
    setShowExpenseForm(true);
  };

  const handleUpdateExpense = async () => {
    if (editingExpense && expenseForm.category && expenseForm.amount && expenseForm.date) {
      const updatedExpenses = currentMonthData.expenses.map(exp =>
        exp.id === editingExpense
          ? {
              ...exp,
              category: expenseForm.category,
              amount: parseFloat(expenseForm.amount),
              date: expenseForm.date,
              description: expenseForm.description || '',
              items: expenseForm.items || []
            }
          : exp
      );
      await updateMonthlyData({
        ...monthlyData,
        [monthKey]: { ...currentMonthData, expenses: updatedExpenses }
      });
      setExpenseForm({ category: '', amount: '', date: '', description: '', items: [] });
      setShowExpenseForm(false);
      setEditingExpense(null);
      setEditingItemIdx(null);
    }
  };

  const handleDeleteExpense = async (id) => {
    await updateMonthlyData({
      ...monthlyData,
      [monthKey]: {
        ...currentMonthData,
        expenses: currentMonthData.expenses.filter(exp => exp.id !== id)
      }
    });
  };

  // ==================== FUNCIONES ITEMS ====================
  const addExpenseItem = () => {
    if (newExpenseItem.concept && newExpenseItem.amount) {
      if (editingItemIdx !== null) {
        const updatedItems = [...(expenseForm.items || [])];
        updatedItems[editingItemIdx] = {
          ...newExpenseItem,
          amount: parseFloat(newExpenseItem.amount)
        };
        setExpenseForm({ ...expenseForm, items: updatedItems });
        setEditingItemIdx(null);
      } else {
        setExpenseForm({
          ...expenseForm,
          items: [...(expenseForm.items || []), {
            ...newExpenseItem,
            amount: parseFloat(newExpenseItem.amount)
          }]
        });
      }
      setNewExpenseItem({ concept: '', amount: '' });
    }
  };

  const removeExpenseItem = (idx) => {
    setExpenseForm({
      ...expenseForm,
      items: expenseForm.items.filter((_, i) => i !== idx)
    });
  };

  const startEditExpenseItem = (idx) => {
    const item = expenseForm.items[idx];
    setNewExpenseItem({ concept: item.concept, amount: item.amount.toString() });
    setEditingItemIdx(idx);
  };

  const cancelEditExpenseItem = () => {
    setEditingItemIdx(null);
    setNewExpenseItem({ concept: '', amount: '' });
  };

  // ==================== FUNCIONES CATEGORÍAS ====================
  // FIX: antes estas funciones solo hacían setIncomeCategories/setExpenseCategories
  // (estado local de React) y nunca llamaban a persistAll/Supabase — por eso las
  // categorías nuevas desaparecían al recargar o cambiar de sesión. Ahora sí persisten.
  const handleAddIncomeCategory = () => {
    if (newIncomeCategory.trim() && !incomeCategories.includes(newIncomeCategory.trim())) {
      persistAll(monthlyData, [...incomeCategories, newIncomeCategory.trim()], expenseCategories);
      setNewIncomeCategory('');
      setShowIncomeCategoryForm(false);
    }
  };

  const handleEditIncomeCategory = (oldCat, newCat) => {
    const trimmed = newCat.trim();
    if (trimmed && trimmed !== oldCat && !incomeCategories.includes(trimmed)) {
      const updatedCategories = incomeCategories.map(c => (c === oldCat ? trimmed : c));
      const updatedMonths = {};
      Object.entries(monthlyData).forEach(([key, data]) => {
        updatedMonths[key] = {
          ...data,
          incomes: data.incomes.map(i => (i.category === oldCat ? { ...i, category: trimmed } : i))
        };
      });
      persistAll(updatedMonths, updatedCategories, expenseCategories);
    }
  };

  const handleDeleteIncomeCategory = (cat) => {
    const used = Object.values(monthlyData).some(data =>
      data.incomes.some(i => i.category === cat)
    );
    if (used) {
      alert('No puedes borrar una categoría con ingresos asociados.');
      return;
    }
    persistAll(monthlyData, incomeCategories.filter(c => c !== cat), expenseCategories);
  };

  const handleAddExpenseCategory = () => {
    if (newExpenseCategory.trim() && !expenseCategories.includes(newExpenseCategory.trim())) {
      persistAll(monthlyData, incomeCategories, [...expenseCategories, newExpenseCategory.trim()]);
      setNewExpenseCategory('');
      setShowExpenseCategoryForm(false);
    }
  };

  const handleEditExpenseCategory = (oldCat, newCat) => {
    const trimmed = newCat.trim();
    if (trimmed && trimmed !== oldCat && !expenseCategories.includes(trimmed)) {
      const updatedCategories = expenseCategories.map(c => (c === oldCat ? trimmed : c));
      const updatedMonths = {};
      Object.entries(monthlyData).forEach(([key, data]) => {
        updatedMonths[key] = {
          ...data,
          expenses: data.expenses.map(e => (e.category === oldCat ? { ...e, category: trimmed } : e))
        };
      });
      persistAll(updatedMonths, incomeCategories, updatedCategories);
    }
  };

  const handleDeleteExpenseCategory = (cat) => {
    const used = Object.values(monthlyData).some(data =>
      data.expenses.some(e => e.category === cat)
    );
    if (used) {
      alert('No puedes borrar una categoría con gastos asociados.');
      return;
    }
    persistAll(monthlyData, incomeCategories, expenseCategories.filter(c => c !== cat));
  };

  const navigateMonth = (dir) => {
    let m = currentMonth, y = currentYear;
    if (dir === 'prev') {
      if (m === 0) { m = 11; y--; } else m--;
    } else {
      if (m === 11) { m = 0; y++; } else m++;
    }
    setCurrentMonth(m);
    setCurrentYear(y);
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-black text-white font-inter">
      <style>{headerStyles}</style>

      {/* Indicador de sincronización */}
      <div className="fixed top-4 right-4 text-sm font-semibold z-40 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 flex items-center gap-2">
        {syncStatus === 'synced' && <span className="text-green-400">✅ Sincronizado</span>}
        {syncStatus === 'pending' && <span className="text-yellow-400">⏳ Guardando...</span>}
        {syncStatus === 'error' && <span className="text-red-400">⚠️ Offline (local)</span>}
        <button
          onClick={() => supabase.auth.signOut()}
          className="ml-2 text-gray-400 hover:text-gray-200 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
      
      {/* Header */}     
      <header className="static-header p-8 shadow-lg">
        <div className="max-w-7xl mx-auto text-center w-full">
          <h1 className="text-5xl font-black text-white tracking-wide" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}>
            My Finance App
          </h1>
          <p className="text-white text-xl mt-2 font-bold subtitle-text-shadow">
            Gestor de Finanzas Personales
          </p>
          <p className="text-lg mt-2 font-semibold author-text-glow">By Otto N. Manrique</p>
          <p className="text-gray-300 text-sm mt-2">Usuario: {session?.user?.email}</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Navegación de Meses */}
        <div className="bg-gray-900 p-3 sm:p-4 rounded-xl shadow-lg border-2" style={{ borderColor: FLUORESCENT_GREEN }}>
          <div className="flex items-center justify-between w-full gap-2 sm:gap-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="flex items-center gap-1 sm:gap-2 text-black font-bold px-2 sm:px-6 py-2 sm:py-3 rounded-lg transition-all hover:shadow-lg text-sm sm:text-base"
              style={{ backgroundColor: FLUORESCENT_GREEN }}
            >
              <ChevronLeft size={18} className="sm:block hidden" />
              <ChevronLeft size={16} className="sm:hidden block" />
              <span className="hidden sm:inline">Anterior</span>
              <span className="sm:hidden">Ant</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center">
              <Calendar style={{ color: FLUORESCENT_GREEN }} size={24} className="hidden sm:block" />
              <Calendar style={{ color: FLUORESCENT_GREEN }} size={20} className="sm:hidden block" />
              <h2
                className="text-lg sm:text-2xl font-bold text-center whitespace-nowrap"
                style={{ color: FLUORESCENT_GREEN, textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
              >
                <span className="hidden sm:inline">{monthNames[currentMonth]} {currentYear}</span>
                <span className="sm:hidden">{monthNames[currentMonth].slice(0, 3)} {currentYear}</span>
              </h2>
            </div>

            <button
              onClick={() => navigateMonth('next')}
              className="flex items-center gap-1 sm:gap-2 text-black font-bold px-2 sm:px-6 py-2 sm:py-3 rounded-lg transition-all hover:shadow-lg text-sm sm:text-base"
              style={{ backgroundColor: FLUORESCENT_GREEN }}
            >
              <span className="hidden sm:inline">Siguiente</span>
              <span className="sm:hidden">Sig</span>
              <ChevronRight size={18} className="sm:block hidden" />
              <ChevronRight size={16} className="sm:hidden block" />
            </button>
          </div>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[220px]">
          <ResummarCard
            title="Ingresos Totales"
            value={totalIncome}
            icon={TrendingUp}
            color="#00FF00"
            bg="linear-gradient(135deg, #1F3A1F, #2D5A2D)"
          />
          <ResummarCard
            title="Gastos Totales"
            value={totalExpenses}
            icon={TrendingDown}
            color="#FF073A"
            bg="linear-gradient(135deg, #3A1F1F, #5A2D2D)"
          />
          <ResummarCard
            title="Disponible"
            value={available}
            icon={Wallet}
            color={available >= 0 ? '#00FFFF' : '#FF00FF'}
            bg="linear-gradient(135deg, #1F3A3A, #2D5A5A)"
            isHighlight={true}
          />
        </div>

        {/* Acordeón de Gráficos */}
        <GraphsCollapsible
          monthlyData={monthlyData}
          currentMonthData={currentMonthData}
          categories={expenseCategories}
          incomeCategories={incomeCategories}
        />

        {/* SECCIÓN DE INGRESOS */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg border-2" style={{ borderColor: FLUORESCENT_GREEN }}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h3 className="text-2xl font-bold" style={{ color: FLUORESCENT_GREEN }}>
              Ingresos - {monthNames[currentMonth]}
            </h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowIncomeCategoryManager(!showIncomeCategoryManager)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Settings size={18} /> Gestionar
              </button>
              <button
                onClick={() => setShowIncomeCategoryForm(!showIncomeCategoryForm)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Plus size={18} /> Categoría
              </button>
              <button
                onClick={() => setShowIncomeForm(!showIncomeForm)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Plus size={18} /> Ingreso
              </button>
              <button
                onClick={() => setShowIncomeDetail(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Eye size={18} /> Ver
              </button>
            </div>
          </div>

          <CategoryManager
            categories={incomeCategories}
            show={showIncomeCategoryManager}
            onEdit={handleEditIncomeCategory}
            onDelete={handleDeleteIncomeCategory}
            onClose={() => setShowIncomeCategoryManager(false)}
            title="Gestionar Categorías de Ingresos"
          />

          {showIncomeCategoryForm && (
            <div className="mb-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex gap-4 flex-wrap">
                <input
                  type="text"
                  placeholder="Nueva categoría de ingreso"
                  value={newIncomeCategory}
                  onChange={e => setNewIncomeCategory(e.target.value)}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 min-w-[200px]"
                />
                <button onClick={handleAddIncomeCategory} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                  Agregar
                </button>
                <button
                  onClick={() => { setShowIncomeCategoryForm(false); setNewIncomeCategory(''); }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {showIncomeForm && (
            <div className="mb-4 p-4 bg-gray-800 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={incomeForm.category}
                  onChange={e => setIncomeForm({ ...incomeForm, category: e.target.value })}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
                >
                  <option value="">Selecciona Categoría</option>
                  {incomeCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Monto"
                  value={incomeForm.amount}
                  onChange={e => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
                />
                <input
                  type="date"
                  value={incomeForm.date}
                  onChange={e => setIncomeForm({ ...incomeForm, date: e.target.value })}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
                />
                <input
                  type="text"
                  placeholder="Descripción (opcional)"
                  value={incomeForm.description}
                  onChange={e => setIncomeForm({ ...incomeForm, description: e.target.value })}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
                />
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={editingIncome ? handleUpdateIncome : handleAddIncome}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  {editingIncome ? 'Actualizar' : 'Agregar'}
                </button>
                <button
                  onClick={() => {
                    setShowIncomeForm(false);
                    setEditingIncome(null);
                    setIncomeForm({ category: '', amount: '', date: '', description: '' });
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {currentMonthData.incomes.length > 0 ? (
              currentMonthData.incomes.map(inc => (
                <div key={inc.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-gray-100">{inc.category}</span>
                        <span className="text-green-400 font-bold text-lg">${inc.amount.toLocaleString()}</span>
                      </div>
                      <div className="text-gray-400 text-sm">
                        <span>{inc.date}</span>
                        {inc.description && <span className="ml-3">• {inc.description}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditIncome(inc)} 
                        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 p-2 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteIncome(inc.id)} 
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No hay ingresos registrados</p>
            )}
          </div>
        </div>

        {/* SECCIÓN DE GASTOS */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg border-2 border-red-500">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h3 className="text-2xl font-bold" style={{ color: VIVID_RED }}>
              Gastos - {monthNames[currentMonth]}
            </h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowExpenseCategoryManager(!showExpenseCategoryManager)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Settings size={18} /> Gestionar
              </button>
              <button
                onClick={() => setShowExpenseCategoryForm(!showExpenseCategoryForm)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Plus size={18} /> Categoría
              </button>
              <button
                onClick={() => setShowExpenseForm(!showExpenseForm)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Plus size={18} /> Gasto
              </button>
              <button
                onClick={() => setShowExpenseDetail(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Eye size={18} /> Ver
              </button>
            </div>
          </div>

          <CategoryManager
            categories={expenseCategories}
            show={showExpenseCategoryManager}
            onEdit={handleEditExpenseCategory}
            onDelete={handleDeleteExpenseCategory}
            onClose={() => setShowExpenseCategoryManager(false)}
            title="Gestionar Categorías de Gastos"
          />

          {showExpenseCategoryForm && (
            <div className="mb-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex gap-4 flex-wrap">
                <input
                  type="text"
                  placeholder="Nueva categoría de gasto"
                  value={newExpenseCategory}
                  onChange={e => setNewExpenseCategory(e.target.value)}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 min-w-[200px]"
                />
                <button onClick={handleAddExpenseCategory} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                  Agregar
                </button>
                <button
                  onClick={() => { setShowExpenseCategoryForm(false); setNewExpenseCategory(''); }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {showExpenseForm && (
            <div className="mb-4 p-4 bg-gray-800 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
                >
                  <option value="">Categoría</option>
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Monto Total"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
                />
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
                />
                <input
                  type="text"
                  placeholder="Descripción"
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
                />
              </div>

              <div className="border-t border-gray-700 pt-4">
                <p className="text-sm text-gray-300 font-semibold mb-3">
                  Detalles del gasto (opcional){editingItemIdx !== null && <span className="text-cyan-400"> — editando</span>}:
                </p>
                <div className="flex gap-2 flex-wrap mb-3">
                  <input
                    type="text"
                    placeholder="Concepto (ej: Leche, Pan...)"
                    value={newExpenseItem.concept}
                    onChange={e => setNewExpenseItem({ ...newExpenseItem, concept: e.target.value })}
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 min-w-[200px] text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Monto"
                    value={newExpenseItem.amount}
                    onChange={e => setNewExpenseItem({ ...newExpenseItem, amount: e.target.value })}
                    className="bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 w-32 text-sm"
                  />
                  <button
                    onClick={addExpenseItem}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
                  >
                    {editingItemIdx !== null ? 'Actualizar' : 'Agregar'}
                  </button>
                  {editingItemIdx !== null && (
                    <button
                      onClick={cancelEditExpenseItem}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-semibold"
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                {expenseForm.items && expenseForm.items.length > 0 && (
                  <div className="bg-gray-700 p-3 rounded space-y-2 mb-3 border border-gray-600">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-600">
                      <p className="text-gray-300 font-semibold text-sm">Items ({expenseForm.items.length})</p>
                      <p className="text-cyan-400 font-bold">Total: ${expenseForm.items.reduce((s, i) => s + parseFloat(i.amount || 0), 0).toLocaleString()}</p>
                    </div>
                    {expenseForm.items.map((item, idx) => (
                      <div key={idx} className={`flex justify-between items-center p-2 rounded text-sm ${editingItemIdx === idx ? 'bg-cyan-900/40 ring-1 ring-cyan-400' : 'bg-gray-800'}`}>
                        <span className="text-gray-200 font-medium flex-1">{item.concept}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-cyan-400 font-semibold">${item.amount.toLocaleString()}</span>
                          <button
                            onClick={() => startEditExpenseItem(idx)}
                            className="text-cyan-400 hover:text-cyan-300 p-1"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => removeExpenseItem(idx)}
                            className="text-red-400 hover:text-red-300 px-2 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={editingExpense ? handleUpdateExpense : handleAddExpense}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  {editingExpense ? 'Actualizar' : 'Agregar'}
                </button>
                <button
                  onClick={() => {
                    setShowExpenseForm(false);
                    setEditingExpense(null);
                    setExpenseForm({ category: '', amount: '', date: '', description: '', items: [] });
                    cancelEditExpenseItem();
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {(currentMonthData.expenses || []).length > 0 ? (
              (currentMonthData.expenses || []).map(exp => (
                <div key={exp.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="flex justify-between items-center p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-gray-100">{exp.category}</span>
                        <span className="text-red-400 font-bold text-lg">${exp.amount.toLocaleString()}</span>
                        {exp.items && exp.items.length > 0 && (
                          <span className="bg-cyan-600/30 text-cyan-400 text-xs px-2 py-1 rounded">
                            {exp.items.length} items
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm">
                        <span>{exp.date}</span>
                        {exp.description && <span className="ml-3">• {exp.description}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditExpense(exp)}
                        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 p-2 rounded"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  {exp.items && exp.items.length > 0 && (
                    <div className="bg-gray-750 px-4 py-2 border-t border-gray-700 text-sm">
                      <div className="space-y-1">
                        {exp.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-gray-300">
                            <span>{item.concept}</span>
                            <span className="text-cyan-400">${item.amount.toLocaleString()}</span>
                          </div>
                        ))}
                        {exp.items.length > 2 && (
                          <p className="text-gray-500 text-xs italic">+ {exp.items.length - 2} items más...</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No hay gastos registrados</p>
            )}
          </div>
        </div>
      </div>

      {/* MODALES */}
      <DetailModal
        isOpen={showIncomeDetail}
        title={`Ingresos - ${monthNames[currentMonth]} ${currentYear}`}
        items={currentMonthData.incomes || []}
        onClose={() => setShowIncomeDetail(false)}
        isIncome={true}
      />

      <DetailModal
        isOpen={showExpenseDetail}
        title={`Gastos - ${monthNames[currentMonth]} ${currentYear}`}
        items={currentMonthData.expenses || []}
        onClose={() => setShowExpenseDetail(false)}
        isIncome={false}
      />

      {/* Footer */}
      <footer className="bg-gray-900 p-6 text-center text-gray-500 text-sm mt-8 border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} My Finance App. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default DreamTeamFinanceApp;