import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line
} from 'recharts';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { COLORS, monthNames } from '../utils/constants';

export const GraphsCollapsible = ({ monthlyData, currentMonthData, categories, incomeCategories }) => {
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
        month: `${monthNames[m - 1]} ${y}`,
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