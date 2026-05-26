/**
 * Pagination - Component phân trang dùng chung cho hệ thống Diễn đàn & Kết nối cung ứng.
 */
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Import trực tiếp từ thư viện lucide-react

const Pagination = () => (
  <div className="mt-8 flex items-center justify-center gap-2 font-semibold">
    {/* Nút Previous */}
    <button
      type="button"
      className="shadow-sm/5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all duration-150 hover:border-[#004785] hover:text-[#004785] active:scale-95"
    >
      <ChevronLeft size={18} />
    </button>

    {/* Trang 1 (Đang Active) */}
    <button
      type="button"
      className="flex h-10 w-10 scale-[1.02] items-center justify-center rounded-xl bg-[#004785] text-sm font-bold text-white shadow-md shadow-[#004785]/10"
    >
      1
    </button>

    {/* Trang 2 */}
    <button
      type="button"
      className="shadow-sm/5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-600 transition-all duration-150 hover:border-[#004785] hover:bg-slate-50 hover:text-[#004785] active:scale-95"
    >
      2
    </button>

    {/* Trang 3 */}
    <button
      type="button"
      className="shadow-sm/5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-600 transition-all duration-150 hover:border-[#004785] hover:bg-slate-50 hover:text-[#004785] active:scale-95"
    >
      3
    </button>

    {/* Dấu ba chấm đệm */}
    <span className="mx-1 select-none font-medium text-slate-400">...</span>

    {/* Trang cuối */}
    <button
      type="button"
      className="shadow-sm/5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-600 transition-all duration-150 hover:border-[#004785] hover:bg-slate-50 hover:text-[#004785] active:scale-95"
    >
      12
    </button>

    {/* Nút Next */}
    <button
      type="button"
      className="shadow-sm/5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all duration-150 hover:border-[#004785] hover:text-[#004785] active:scale-95"
    >
      <ChevronRight size={18} />
    </button>
  </div>
);

export default Pagination;
