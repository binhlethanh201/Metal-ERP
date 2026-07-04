import React from 'react';
import Icon from '../../../../shared/components/Icon';

const LogFilterBar = ({ searchTerm, onSearchChange, filterLevel, onFilterChange }) => {
  return (
    <div className="flex items-center justify-between rounded-md border border-outline-variant bg-surface-container-lowest p-2 shadow-sm">
      {/* SEARCH BAR */}
      <div className="relative w-80">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
          <Icon name="search" size={14} />
        </span>
        <input
          type="text"
          placeholder="Tra cứu source, nội dung..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 pl-9 text-xs font-semibold outline-none transition-colors focus:border-primary focus:bg-surface-container-lowest"
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
                ? 'bg-on-surface text-surface-container-lowest shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
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
