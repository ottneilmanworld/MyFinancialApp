import React, { useState } from 'react';
import { Settings, Edit2, Trash2 } from 'lucide-react';

export const CategoryManager = ({ categories, show, onEdit, onDelete, onClose, title }) => {
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