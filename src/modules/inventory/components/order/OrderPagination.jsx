import React from 'react';

const OrderPagination = ({
  page,
  totalPages,
  pageSize,
  filteredCount,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="rounded p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
        >
          &laquo;
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
        >
          &lsaquo;
        </button>
        <span className="text-xs text-slate-600">
          Trang{' '}
          <input
            type="number"
            value={page}
            onChange={(e) => {
              const p = Number(e.target.value);
              if (p >= 1 && p <= totalPages) onPageChange(p);
            }}
            className="mx-1 w-10 rounded border border-slate-200 px-1 py-0.5 text-center text-xs"
          />{' '}
          trên {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
        >
          &rsaquo;
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="rounded p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
        >
          &raquo;
        </button>
        <button
          onClick={() => onPageChange(1)}
          className="rounded p-1 text-slate-400 hover:text-[#004785]"
        >
          &#8635;
        </button>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded border border-slate-200 px-1.5 py-0.5 text-xs focus:border-[#004785] focus:outline-none"
        >
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
        </select>
        <span className="text-xs text-slate-500">
          Hiển thị {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredCount)} trên{' '}
          {filteredCount} kết quả
        </span>
      </div>
    </div>
  );
};

export default OrderPagination;
