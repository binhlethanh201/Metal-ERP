import React from 'react';
import { inventoryTrend } from '../data/inventoryMockData';

const StockTrendChart = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="mb-4 text-[11px] font-bold uppercase leading-none tracking-[0.05em] text-slate-500">
        XU HƯỚNG TỒN KHO (7 NGÀY)
      </h4>
      <div className="flex h-48 items-end justify-between gap-2 px-2">
        {inventoryTrend.map((item) => (
          <div
            key={item.day}
            className="group relative w-full cursor-pointer rounded-t-md bg-blue-100 transition-colors hover:bg-[#004785]"
            style={{ height: `${item.height}%` }}
          >
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100">
              {item.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between px-2 text-[10px] font-bold text-slate-400">
        {inventoryTrend.map((item) => (
          <span key={item.day}>{item.day}</span>
        ))}
      </div>
    </div>
  );
};

export default StockTrendChart;
