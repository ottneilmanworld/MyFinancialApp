import React from 'react';

export const ResummarCard = ({ title, value, icon: Icon, color, bg, isHighlight = false }) => (
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