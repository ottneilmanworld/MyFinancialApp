import React, { useState } from 'react';
import { FLUORESCENT_GREEN } from '../utils/constants';

export const DetailModal = ({ isOpen, title, items, onClose, isIncome = false }) => {
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