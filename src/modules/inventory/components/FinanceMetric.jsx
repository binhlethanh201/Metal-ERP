import React from 'react';

const progressTone = {
  navy: 'bg-blue-600 text-blue-900',
  slate: 'bg-slate-400 text-slate-700',
  green: 'bg-green-500 text-green-600',
};

const FinanceMetric = ({ label, value, unit, progress, subtitle, tone = 'navy' }) => {
  const toneClass = progressTone[tone] || progressTone.navy;
  const [barClass, textClass] = toneClass.split(' ');

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-1 text-[11px] font-bold uppercase leading-none tracking-[0.05em] text-slate-500">
        {label}
      </p>
      <h2 className={`text-xl font-extrabold leading-snug ${textClass}`}>
        {value} {unit && <span className="text-sm font-medium">{unit}</span>}
      </h2>
      {progress ? (
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full ${barClass}`} style={{ width: `${progress}%` }} />
        </div>
      ) : (
        <p className="mt-2 text-xs leading-[1.4] text-blue-600">{subtitle}</p>
      )}
    </div>
  );
};

export default FinanceMetric;
