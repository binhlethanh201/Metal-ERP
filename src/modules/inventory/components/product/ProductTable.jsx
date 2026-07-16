import { Fragment, useState, useMemo } from 'react';
import Icon from '../../../../shared/components/Icon';
import Toggle from '../../../../shared/components/Toggle';
import { formatMoney, isProductActive } from '../../utils/productUtils';
import { ProductDetailPanel } from './ProductDetailPanel';

const fmtMoney = (v) => formatMoney(v);
const fmtDateTime = (dateStr) => {
  if (!dateStr) return '---';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

const COLUMNS = [
  { label: 'Mã hàng', width: 'w-[140px]', sortKey: 'productCode', align: '' },
  { label: 'Tên hàng', width: 'w-[240px]', sortKey: 'productName', align: '' },
  { label: 'Đơn vị', width: 'w-[90px]', sortKey: 'unit', align: '' },
  { label: 'Thương hiệu', width: 'w-[130px]', sortKey: 'brand', align: '' },
  { label: 'Giá bán', width: 'w-[110px]', sortKey: 'salePrice', align: 'right' },
  { label: 'Giá vốn', width: 'w-[110px]', sortKey: 'costPrice', align: 'right' },
  { label: 'Tồn kho', width: 'w-[110px]', sortKey: 'stock', align: 'right' },
  { label: 'Vị trí kho', width: 'w-[110px]', sortKey: 'location', align: '' },
  { label: 'Hoạt động', width: 'w-[90px]', sortKey: '', align: '' },
  { label: 'Thời gian tạo', width: 'w-[160px]', sortKey: 'createdAt', align: '' },
];

const getValue = (row, sortKey) => {
  if (!sortKey) return '';
  switch (sortKey) {
    case 'productCode':
      return row.productCode || '';
    case 'productName':
      return (row.productName || row.name || '').toLowerCase();
    case 'unit':
      return row.unit || '';
    case 'brand':
      return row.brandName || row.brand || '';
    case 'salePrice':
      return row.salePrice ?? 0;
    case 'costPrice':
      return row.costPrice ?? 0;
    case 'stock':
      return row.actualStock ?? row.stock ?? 0;
    case 'location':
      return row.shelfLocation || row.location || '';
    case 'createdAt':
      return row.createdAt || '';
    default:
      return '';
  }
};

export const ProductTable = ({
  rows = [],
  onToggleStatus,
  expandedId,
  onToggleExpand,
  onEdit,
  onDelete,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
}) => {
  const isAllSelected = rows.length > 0 && selectedIds.length === rows.length;
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const va = getValue(a, sortKey);
      const vb = getValue(b, sortKey);
      let cmp = 0;
      if (typeof va === 'string' && typeof vb === 'string') {
        cmp = va.localeCompare(vb, 'vi');
      } else {
        cmp = va < vb ? -1 : va > vb ? 1 : 0;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  return (
    <table className="w-full min-w-[1250px] table-fixed border-collapse text-left">
      <thead className="border-b border-slate-200 bg-gray-50">
        <tr className="text-xs font-semibold text-slate-900">
          <th className="w-[48px] px-4 py-3 text-center">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-primary focus:ring-primary"
              checked={isAllSelected}
              onChange={(e) => onSelectAll?.(e.target.checked, rows)}
            />
          </th>

          {COLUMNS.map((col) => {
            const isActive = sortKey === col.sortKey && col.sortKey;
            return (
              <th
                key={col.label}
                className={`${col.width} px-4 py-3 ${col.align === 'right' ? 'text-right' : ''} ${col.sortKey ? 'cursor-pointer select-none hover:bg-slate-100' : ''}`}
                onClick={() => handleSort(col.sortKey)}
              >
                <div
                  className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}
                >
                  <span className="truncate">{col.label}</span>
                  {col.sortKey && (
                    <span className="inline-flex flex-none flex-col leading-none text-slate-400">
                      <Icon
                        name="expand_less"
                        size={14}
                        className={`-mb-1 ${isActive && sortDir === 'asc' ? 'font-bold text-[#004785]' : ''}`}
                      />
                      <Icon
                        name="expand_more"
                        size={14}
                        className={`-mt-1 ${isActive && sortDir === 'desc' ? 'font-bold text-[#004785]' : ''}`}
                      />
                    </span>
                  )}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 text-sm">
        {sortedRows.length === 0 && (
          <tr>
            <td colSpan={11} className="px-6 py-8 text-center text-slate-500">
              Không có dữ liệu
            </td>
          </tr>
        )}
        {sortedRows.map((row) => {
          const isExpanded = expandedId === (row.id || row.productId);
          const currentId = row.id || row.productId;
          const isSelected = selectedIds.includes(currentId);
          const rowActive = isProductActive(row);
          return (
            <Fragment key={currentId}>
              <tr
                className={`group cursor-pointer transition-colors hover:bg-gray-50 ${isExpanded || isSelected ? 'bg-blue-50' : ''}`}
                onClick={() => onToggleExpand?.(currentId)}
              >
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-primary"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelectRow?.(currentId, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>

                {/* Đã xóa cột Star */}

                <td className="overflow-hidden px-4 py-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-100">
                      {row.imageUrl || row.image ? (
                        <img
                          src={row.imageUrl || row.image}
                          alt={row.productName || row.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Icon name="image" className="text-slate-400" size={20} />
                      )}
                    </div>
                    <span className="truncate font-medium text-primary">
                      {row.productCode || row.id}
                    </span>
                  </div>
                </td>
                <td className="truncate whitespace-nowrap px-4 py-3 text-slate-700">
                  {row.productName || row.name}
                </td>
                <td className="truncate whitespace-nowrap px-4 py-3 text-slate-600">
                  {row.unit || '---'}
                </td>
                <td className="truncate whitespace-nowrap px-4 py-3 text-slate-600">
                  {row.brandName || row.brand || '---'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-800">
                  {fmtMoney(row.salePrice)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-slate-500">
                  {fmtMoney(row.costPrice)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-900">
                  <div className="inline-flex items-center gap-1.5">
                    {(row.actualStock ?? row.stock ?? 0).toLocaleString('vi-VN')}
                    {row.minimumStock > 0 &&
                      (row.actualStock ?? row.stock ?? 0) <= row.minimumStock && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600"
                          title={`Tồn kho thấp hơn ngưỡng tối thiểu (${row.minimumStock})`}
                        >
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                            />
                          </svg>
                          Thấp
                        </span>
                      )}
                  </div>
                </td>
                <td className="truncate whitespace-nowrap px-4 py-3 text-slate-500">
                  {row.shelfLocation || row.location || '---'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-center">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Toggle
                      checked={rowActive}
                      onChange={() => onToggleStatus?.(currentId, rowActive)}
                    />
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                  {fmtDateTime(row.createdAt)}
                </td>
              </tr>
              {isExpanded && (
                <tr>
                  {/* Giảm colSpan từ 12 xuống 11 */}
                  <td colSpan={11} className="border-b border-blue-200 p-0">
                    <ProductDetailPanel
                      row={row}
                      onEdit={(r, tab) => onEdit?.(r, tab)}
                      onDelete={onDelete}
                      onToggleStatus={onToggleStatus}
                    />
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

export default ProductTable;
