import React from 'react';
import MaterialIcon from './MaterialIcon';
import { cashSummary } from '../data/inventoryMockData';

const CashFlowWidget = () => {
  return (
    <div className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-[11px] font-bold uppercase leading-none tracking-[0.05em] text-slate-500">
          TỔNG QUỸ TIỀN MẶT
        </h4>
        <MaterialIcon name="account_balance_wallet" className="text-slate-400" />
      </div>
      <h2 className="mb-4 text-2xl font-extrabold text-blue-900">
        {cashSummary.total} <span className="text-sm font-medium">VND</span>
      </h2>
      <div className="flex justify-between border-t border-slate-50 pt-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400">THU (THÁNG)</p>
          <p className="text-sm font-bold text-green-600">{cashSummary.income}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400">CHI (THÁNG)</p>
          <p className="text-sm font-bold text-red-600">{cashSummary.expense}</p>
        </div>
      </div>
    </div>
  );
};

export default CashFlowWidget;
