import React from 'react';
import MaterialIcon from './MaterialIcon';
import { recentTransactions } from '../data/inventoryMockData';

const iconByType = {
  export: { icon: 'north_east', box: 'bg-blue-50 text-blue-600' },
  import: { icon: 'south_west', box: 'bg-green-50 text-green-600' },
  transfer: { icon: 'swap_horiz', box: 'bg-orange-50 text-orange-600' },
};

const RecentTransactions = () => {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-[#004785]">
            <MaterialIcon name="history" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase leading-none tracking-[0.05em] text-slate-500">
              GIAO DỊCH GẦN ĐÂY
            </h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Cập nhật theo thời gian thực
            </p>
          </div>
        </div>
        <button className="rounded-lg border border-blue-100 px-4 py-2 text-xs font-bold text-[#004785] transition-colors hover:bg-blue-50">
          Xem báo cáo chi tiết
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Loại
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Đối tác / Mã đơn
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Thời gian
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">
                Giá trị (VND)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentTransactions.map((transaction) => {
              const meta = iconByType[transaction.type] || iconByType.export;
              return (
                <tr key={transaction.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${meta.box}`}
                    >
                      <MaterialIcon name={meta.icon} className="text-sm" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{transaction.partner}</p>
                    <p className="text-[10px] text-slate-500">{transaction.location}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    {transaction.time}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-black text-slate-900">
                    {transaction.amount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;
