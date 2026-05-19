import React from 'react';

const ImportExportChart = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="mb-4 text-[11px] font-bold uppercase leading-none tracking-[0.05em] text-slate-500">
        NHẬP / XUẤT KHO
      </h4>
      <div className="relative flex h-48 items-center justify-center overflow-hidden">
        <svg className="h-full w-full" viewBox="0 0 400 150" preserveAspectRatio="none">
          <path
            d="M0,120 Q50,80 100,100 T200,60 T300,90 T400,30"
            fill="none"
            stroke="#22C55E"
            strokeWidth="2"
          />
          <path
            d="M0,100 Q50,130 100,70 T200,110 T300,50 T400,80"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
          />
        </svg>
        <div className="absolute bottom-2 right-2 flex gap-3">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold text-slate-500">NHẬP</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-[10px] font-bold text-slate-500">XUẤT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExportChart;
