import React from 'react';
import Icon from '../../../../shared/components/Icon';

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

const isInactive = (status) => {
  const normalized = String(status || '').toLowerCase();
  return normalized === 'inactive' || normalized === '0';
};

/**
 * Hiển thị giá trị công nợ + badge phụ:
 *  - overpaid > 0 → "Trả thừa {overpaid}" (cam)
 *  - currentDebt = 0 + chưa trả gì → "Hết nợ" (xám)
 *  - currentDebt = 0 + đã trả đủ → "Hết nợ" (xám)
 *  - currentDebt > 0 → "Còn nợ" (mặc định)
 */
const DebtCell = ({ supplier }) => {
  const overpaid = Number(supplier.overpaidAmount || 0);
  const debt = Number(supplier.currentDebt || 0);

  if (overpaid > 0) {
    return (
      <div>
        <div className="font-semibold text-amber-700 dark:text-amber-400">
          {formatCurrency(0)}
        </div>
        <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <Icon name="info" size={10} />
          Trả thừa {formatCurrency(overpaid)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={`font-semibold ${debt > 0 ? 'text-slate-900 dark:text-[#e5e5e5]' : 'text-slate-500 dark:text-[#999999]'}`}>
        {formatCurrency(debt)}
      </div>
      <div className="mt-0.5 text-xs text-slate-500 dark:text-[#999999]">
        Đã mua: {formatCurrency(supplier.totalPurchased || 0)}
      </div>
    </div>
  );
};

const SupplierTable = ({ suppliers, loading, onDetail, onToggleStatus }) => {
  if (loading)
    return <div className="py-10 text-center text-sm text-slate-500 dark:text-[#999999]">Đang tải dữ liệu...</div>;
  if (suppliers.length === 0)
    return (
      <div className="py-10 text-center text-sm text-slate-500 dark:text-[#999999]">
        Không tìm thấy nhà cung cấp nào.
      </div>
    );

  const handleToggle = (e, supplier) => {
    e.stopPropagation();
    if (!onToggleStatus) return;
    const inactive = isInactive(supplier.status);
    // Kiểm tra nợ: không cho ngừng hợp tác nếu còn nợ
    if (!inactive) {
      const debt = Number(supplier.currentDebt || 0);
      if (debt > 0) {
        alert(`Không thể ngừng hợp tác với "${supplier.name}" vì vẫn còn dư nợ ${formatCurrency(debt)}. Vui lòng thanh toán hết công nợ trước.`);
        return;
      }
    }
    const target = inactive ? 'active' : 'inactive';
    const verb = inactive ? 'kích hoạt lại' : 'ngừng hợp tác';
    if (!window.confirm(`Bạn có chắc muốn ${verb} nhà cung cấp "${supplier.name}"?`)) return;
    onToggleStatus(supplier, target);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-left text-slate-500 dark:text-[#999999]">
            <th className="px-3 py-2 font-medium">Nhà cung cấp</th>
            <th className="px-3 py-2 font-medium">Liên hệ</th>
            <th className="px-3 py-2 font-medium">Công nợ</th>
            <th className="px-3 py-2 font-medium">Trạng thái</th>
            <th className="px-3 py-2 text-right font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => {
            const inactive = isInactive(supplier.status);
            return (
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
                  <DebtCell supplier={supplier} />
                </td>
                <td className="px-3 py-3">
                  <div
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(supplier.status)}`}
                  >
                    {getStatusLabel(supplier.status)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-[#999999]">
                    Tạo: {formatDate(supplier.createdAt)}
                  </div>
                </td>
                <td className="rounded-r-xl px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {onToggleStatus && (
                      <button
                        type="button"
                        onClick={(e) => handleToggle(e, supplier)}
                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          inactive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                            : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
                        }`}
                        title={inactive ? 'Kích hoạt lại nhà cung cấp' : 'Ngừng hợp tác với nhà cung cấp'}
                      >
                        <Icon name={inactive ? 'check_circle' : 'dangerous'} size={14} />
                        {inactive ? 'Kích hoạt' : 'Ngừng'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierTable;