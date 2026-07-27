/**
 * Component hiển thị các chỉ số thống kê đơn hàng chu kỳ POS.
 */
import React from 'react';
import { CreditCard, Clock, Truck, CheckCircle } from 'lucide-react';

const OrderStats = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* Doanh thu */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#004785]/10 text-[#004785]">
          <CreditCard size={24} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#808080]">
            Tổng doanh thu tháng
          </p>
          <p className="mt-0.5 text-lg font-black text-slate-800 dark:text-[#e5e5e5]">
            1.240.500.000 <span className="font-sans text-xs font-normal opacity-70">đ</span>
          </p>
        </div>
      </div>

      {/* Chờ xử lý */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700">
          <Clock size={24} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#808080]">Đơn chờ xử lý</p>
          <p className="mt-0.5 text-lg font-black text-slate-800 dark:text-[#e5e5e5]">
            12 <span className="text-xs font-medium text-slate-400">Đơn</span>
          </p>
        </div>
      </div>

      {/* Đang vận chuyển */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
          <Truck size={24} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#808080]">
            Đang vận chuyển
          </p>
          <p className="mt-0.5 text-lg font-black text-slate-800 dark:text-[#e5e5e5]">
            8 <span className="text-xs font-medium text-slate-400">Đơn</span>
          </p>
        </div>
      </div>

      {/* Hoàn thành */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
          <CheckCircle size={24} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#808080]">
            Hoàn thành hôm nay
          </p>
          <p className="mt-0.5 text-lg font-black text-slate-800 dark:text-[#e5e5e5]">
            24 <span className="text-xs font-medium text-slate-400">Đơn</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderStats;
