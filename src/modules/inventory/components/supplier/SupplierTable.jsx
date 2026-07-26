import React from 'react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '---';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

const getStatusLabel = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'inactive' || normalized === '0') return 'Ngừng hợp tác';
  return 'Đang hợp tác';
};

const getStatusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'inactive' || normalized === '0') return 'bg-slate-100 text-slate-700 dark:bg-[#272727] dark:text-[#b3b3b3]';
  return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
};

const SupplierTable = ({ suppliers, loading, onDetail }) => {
  if (loading)
    return <div className="py-10 text-center text-sm text-slate-500 dark:text-[#999999]">Đang tải dữ liệu...</div>;
  if (suppliers.length === 0)
    return (
      <div className="py-10 text-center text-sm text-slate-500 dark:text-[#999999]">
        Không tìm thấy nhà cung cấp nào.
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-left text-slate-500 dark:text-[#999999]">
            <th className="px-3 py-2 font-medium">Nhà cung cấp</th>
            <th className="px-3 py-2 font-medium">Liên hệ</th>
            <th className="px-3 py-2 font-medium">Công nợ</th>
            <th className="px-3 py-2 font-medium">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr
              key={supplier.id}
              onClick={() => onDetail(supplier)}
              className="cursor-pointer rounded-xl bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
            >
              <td className="rounded-l-xl px-3 py-3">
                <div className="font-semibold text-blue-900 dark:text-blue-400">{supplier.name}</div>
                <div className="text-xs text-slate-500 dark:text-[#999999]">{supplier.address || '---'}</div>
              </td>
              <td className="px-3 py-3">
                <div>{supplier.contactPhone || '---'}</div>
                <div className="text-xs text-slate-500 dark:text-[#999999]">{supplier.contactEmail || '---'}</div>
              </td>
              <td className="px-3 py-3">
                <div className="font-semibold text-slate-900 dark:text-[#e5e5e5]">
                  {formatCurrency(supplier.currentDebt || 0)}
                </div>
                <div className="text-xs text-slate-500 dark:text-[#999999]">
                  Đã mua: {formatCurrency(supplier.totalPurchased || 0)}
                </div>
              </td>
              <td className="rounded-r-xl px-3 py-3">
                <div
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(supplier.status)}`}
                >
                  {getStatusLabel(supplier.status)}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-[#999999]">
                  Tạo: {formatDate(supplier.createdAt)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierTable;
