/**
 * PriceInfoGrid - Hiển thị lưới giá (giá sỉ/lẻ/MOQ hoặc giá thanh lý/gốc/tồn kho).
 */
import React from 'react';

const wholesalePrices = (product) => [
  {
    label: 'Giá sỉ',
    value: product.priceRange?.split(' - ')[1] || product.priceRange || 'Liên hệ',
    note: '',
    tone: 'text-[#004785]',
    bg: 'bg-slate-50/50',
  },
  {
    label: 'Giá lẻ',
    value: product.priceRange
      ? `${(parseInt(product.priceRange.replace(/[^0-9]/g, '').slice(0, 7)) + 150000).toLocaleString('vi-VN')}đ`
      : 'Liên hệ',
    note: '',
    tone: 'text-slate-900',
    bg: 'bg-white',
  },
];

const clearancePrices = (product) => [
  {
    label: 'Giá thanh lý',
    value: product.clearancePrice,
    note: `${product.discount} giảm`,
    tone: 'text-red-600',
    bg: 'bg-red-50/30',
    labelTone: 'text-red-500',
  },
  {
    label: 'Giá gốc',
    value: product.originalPrice,
    note: '/ kg',
    tone: 'text-slate-400 line-through',
    bg: 'bg-white',
  },
  {
    label: 'Tồn kho còn lại',
    value: product.remaining,
    note: `KV: ${product.area}`,
    tone: 'text-slate-900',
    bg: 'bg-slate-50/50',
  },
];

const PriceCard = ({ label, value, note, tone, bg, labelTone }) => (
  <div className={`flex flex-col justify-between ${bg} p-6`}>
    <div>
      <p
        className={`mb-2 text-[10px] font-bold uppercase tracking-widest ${labelTone || 'text-slate-500'}`}
      >
        {label}
      </p>
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
    </div>
    <p
      className={`mt-1 text-xs italic ${labelTone ? labelTone.replace('500', '400') : 'text-slate-400'}`}
    >
      {note}
    </p>
  </div>
);

const PriceInfoGrid = ({ type, product }) => {
  const items = type === 'clearance' ? clearancePrices(product) : wholesalePrices(product);

  return (
    <div className="mt-0 overflow-hidden rounded-b-2xl border border-t-0 border-slate-200 bg-white">
      <div className="grid grid-cols-1 divide-x divide-slate-100 md:grid-cols-2">
        {items.map((item, i) => (
          <PriceCard key={i} {...item} />
        ))}
      </div>
    </div>
  );
};

export default PriceInfoGrid;
