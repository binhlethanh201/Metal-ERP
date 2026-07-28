import React from 'react';
import Icon from '../../../../shared/components/Icon';

const LogFilterBar = ({ searchTerm, onSearchChange, filterLevel, onFilterChange }) => {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-2 shadow-sm">
      {/* SEARCH BAR */}
      <div className="relative w-80">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#666666]">
          <Icon name="search" size={14} />
        </span>
        <input
          type="text"
          placeholder="Tra cứu source, nội dung..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] px-3 py-2 pl-9 text-xs font-semibold outline-none transition-colors focus:border-[#004785] focus:bg-white dark:bg-[#0f0f0f]"
        />
      </div>

      {/* TABS */}
      <div className="flex gap-1">
        {['ALL', 'INFO', 'WARN', 'ERROR'].map((level) => (
          <button
            key={level}
            onClick={() => onFilterChange(level)}
            className={`rounded-md px-5 py-2 text-xs font-bold transition-all ${
              filterLevel === level
                ? 'bg-[#004785] text-white shadow-sm'
                : 'text-slate-500 dark:text-[#999999] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] hover:text-slate-900 dark:hover:text-[#e5e5e5]'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LogFilterBar;

