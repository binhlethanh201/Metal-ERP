/**
 * Tiện ích cho trang Quản lý Đơn hàng.
 */
import React from 'react';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { TAG_COLORS } from '../data/orderPageData';

export const getQuickDateRange = (option) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const m = {
    'Tháng này': [new Date(now.getFullYear(), now.getMonth(), 1), today],
    'Tháng trước': [
      new Date(now.getFullYear(), now.getMonth() - 1, 1),
      new Date(now.getFullYear(), now.getMonth(), 0),
    ],
    'Hôm nay': [today, today],
    'Hôm qua': [new Date(today.getTime() - 86400000), new Date(today.getTime() - 86400000)],
    '7 ngày qua': [new Date(today.getTime() - 7 * 86400000), today],
    '30 ngày qua': [new Date(today.getTime() - 30 * 86400000), today],
    'Quý này': [new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1), today],
    'Năm nay': [new Date(now.getFullYear(), 0, 1), today],
  };
  const r = m[option] || [null, null];
  return { from: r[0], to: r[1] };
};

export const formatDate = (d) => (d ? d.toISOString().split('T')[0] : '');

export const renderCellValue = (col, order) => {
  const val = order[col.key];
  switch (col.type) {
    case 'checkbox':
      return null;
    case 'number':
      return val ? formatCurrency(val) : '-';
    case 'multiline':
      if (col.key === 'packageInfo' || col.key === 'deliveryPartner') {
        if (!val) return '-';
        const lines = String(val).split('\n');
        return (
          <>
            {lines.map((line, i) => (
              <div
                key={i}
                className={col.key === 'packageInfo' && i === 1 ? 'text-[10px] text-slate-400 dark:text-[#808080]' : ''}
              >
                {line}
              </div>
            ))}
          </>
        );
      }
      return val || '-';
    case 'tags':
      return (val || []).map((t, i) => (
        <span
          key={i}
          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${TAG_COLORS[t.color] || 'bg-slate-100 text-slate-600 dark:bg-[#333] dark:text-[#b3b3b3]'}`}
        >
          {t.label}
        </span>
      ));
    case 'date':
      return val || '-';
    default:
      if (col.key === 'invoiceNo' && val)
        return (
          <span className="cursor-pointer text-xs font-medium text-[#004785] hover:underline">
            {val}
          </span>
        );
      return val || <span className="text-slate-300 dark:text-[#666]">-</span>;
  }
};

export const renderFilter = (col, value, onChange) => {
  if (col.type === 'checkbox') return <div className="h-8" />;
  if (col.type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-slate-200 px-1 py-0.5 text-[10px] focus:border-[#004785] focus:outline-none"
      >
        {(col.options || []).map((opt) => (
          <option key={opt} value={opt === 'Tất cả' ? '' : opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }
  if (col.type === 'date') {
    return (
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-slate-200 px-1 py-0.5 text-[10px] focus:border-[#004785] focus:outline-none"
      />
    );
  }
  if (col.type === 'number' || col.type === 'tags' || col.type === 'multiline')
    return <div className="h-6" />;
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Lọc..."
      className="w-full rounded border border-slate-200 px-1 py-0.5 text-[10px] focus:border-[#004785] focus:outline-none"
    />
  );
};
