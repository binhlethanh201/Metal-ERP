/**
 * ProductNavBar - Thanh điều hướng nhiều sản phẩm (prev/next/add/remove).
 */
import React from 'react';
import { Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductNavBar = ({ currentIndex, total, onPrev, onNext, onAdd, onRemove }) => (
  <div className="shadow-sm/5 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2">
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onRemove}
        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50"
      >
        <Minus size={14} />
        <span>Giảm hàng</span>
      </button>

      <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
        <button
          type="button"
          onClick={onPrev}
          className="shadow-sm/5 rounded border border-slate-200 p-0.5 text-[#004785] transition-colors hover:bg-white"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-[90px] text-center">
          Sản phẩm {currentIndex + 1} / {total}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="shadow-sm/5 rounded border border-slate-200 p-0.5 text-[#004785] transition-colors hover:bg-white"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>

    <button
      type="button"
      onClick={onAdd}
      className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-[#004785] transition-all hover:bg-blue-50"
    >
      <Plus size={14} />
      <span>Thêm hàng</span>
    </button>
  </div>
);

export default ProductNavBar;
