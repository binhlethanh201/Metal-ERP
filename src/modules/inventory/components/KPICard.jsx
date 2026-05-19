import React from 'react';
import MaterialIcon from './MaterialIcon';

const toneMap = {
  navy: { iconBox: 'bg-blue-50 text-blue-900 group-hover:bg-[#004785]', value: 'text-blue-900' },
  orange: {
    iconBox: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600',
    value: 'text-orange-600',
  },
  red: { iconBox: 'bg-red-50 text-red-600 group-hover:bg-red-600', value: 'text-red-600' },
  green: {
    iconBox: 'bg-green-50 text-green-600 group-hover:bg-green-600',
    value: 'text-green-600',
  },
};

const KPICard = ({ icon, label, value, unit, change, tone = 'navy' }) => {
  const colors = toneMap[tone] || toneMap.navy;

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-[#004785]">
      <div className="mb-4 flex items-start justify-between">
        <div
          className={`rounded-lg p-2 transition-colors group-hover:text-white ${colors.iconBox}`}
        >
          <MaterialIcon name={icon} />
        </div>
        {change && (
          <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-600">
            {change}
          </span>
        )}
      </div>
      <p className="mb-1 text-[11px] font-bold uppercase leading-none tracking-[0.05em] text-slate-500">
        {label}
      </p>
      <h2 className={`text-2xl font-extrabold leading-tight ${colors.value}`}>{value}</h2>
      <p className="mt-2 text-xs leading-[1.4] text-slate-400">{unit}</p>
    </div>
  );
};

export default KPICard;
