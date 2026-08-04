import React from 'react';
import Icon from '../../../../shared/components/Icon';

const LogFilterBar = ({ searchTerm, onSearchChange, filterLevel, onFilterChange }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a]">
      <div className="relative w-72">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#808080]">
          <Icon name="search" size={14} />
        </span>
        <input
          type="text"
          placeholder="Tra cứu source, nội dung..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs font-semibold outline-none transition-colors focus:border-[#004785] dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4] dark:placeholder:text-[#808080] dark:focus:border-blue-500"
        />
      </div>

      <div className="flex gap-1">
        {[
          { value: 'ALL', label: 'Tất cả' },
          { value: 'INFO', label: 'Info' },
          { value: 'WARN', label: 'Warn' },
          { value: 'ERROR', label: 'Error' },
        ].map((lvl) => (
          <button
            key={lvl.value}
            onClick={() => onFilterChange(lvl.value)}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              filterLevel === lvl.value
                ? 'bg-[#004785] text-white shadow-sm dark:bg-blue-600'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-[#999999] dark:hover:bg-[#272727] dark:hover:text-[#e5e5e5]'
            }`}
          >
            {lvl.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LogFilterBar;