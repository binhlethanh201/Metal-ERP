import { Fragment } from 'react';
import Icon from '../../../../shared/components/Icon';
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

export const ProductTable = ({
  rows = [],
  sortConfig,
  getSortIcon,
  onToggleSort,
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
  const columns = [
    ['Mã hàng', 'code', 'w-[140px]'],
    ['Tên hàng', 'name', 'w-[240px]'],
    ['Đơn vị', '', 'w-[90px]'],
    ['Thương hiệu', '', 'w-[130px]'],
    ['Giá bán', 'saleprice', 'w-[110px]'],
    ['Giá vốn', 'costprice', 'w-[110px]'],
    ['Tồn kho', 'stock', 'w-[110px]'],
    ['Vị trí kho', '', 'w-[110px]'],
    ['Hoạt động', '', 'w-[90px]'],
    ['Thời gian tạo', 'createdat', 'w-[160px]'],
  ];
  return (
    <table className="w-full min-w-[1250px] table-fixed border-collapse text-left">
      <thead className="border-b border-slate-200 bg-[#e8f0fe]">
        <tr className="text-[11px] font-bold uppercase text-slate-600">
          <th className="w-[48px] px-4 py-3 text-center">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-primary focus:ring-primary"
              checked={isAllSelected}
              onChange={(e) => onSelectAll?.(e.target.checked, rows)}
            />
          </th>
          <th className="w-[40px] px-2 py-3">
            <Icon name="star_outline" className="text-slate-400" size={16} />
          </th>
          {columns.map(([label, sortKey, widthClass]) => {
            const isSorted = sortConfig?.key === sortKey;
            const isNumCol = label === 'Giá bán' || label === 'Giá vốn' || label === 'Tồn kho';
            return (
              <th
                key={label}
                className={`${widthClass} ${sortKey ? 'cursor-pointer select-none' : ''} px-4 py-3 ${isNumCol ? 'text-right' : ''}`}
                onClick={() => sortKey && onToggleSort?.(sortKey)}
              >
                <div className={`flex items-center gap-1 ${isNumCol ? 'justify-end' : ''}`}>
                  <span className="truncate">{label}</span>
                  {sortKey && (
                    <Icon
                      name={getSortIcon?.(sortKey) || 'unfold_more'}
                      size={14}
                      className={isSorted ? 'font-bold text-blue-600' : 'text-slate-400 opacity-50'}
                    />
                  )}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((row) => {
          const isExpanded = expandedId === (row.id || row.productId);
          const currentId = row.id || row.productId;
          const isSelected = selectedIds.includes(currentId);
          const rowActive = isProductActive(row);
          return (
            <Fragment key={currentId}>
              <tr
                className={`group cursor-pointer transition-colors hover:bg-blue-50 ${isExpanded || isSelected ? 'bg-blue-50' : ''}`}
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
                <td className="px-2 py-3">
                  <Icon
                    name="star_outline"
                    className="text-slate-300 transition-colors group-hover:text-amber-400"
                    size={16}
                  />
                </td>
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
                  {row.actualStock ?? row.stock ?? 0}
                </td>
                <td className="truncate whitespace-nowrap px-4 py-3 text-slate-500">
                  {row.shelfLocation || row.location || '---'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-center">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={rowActive}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleStatus?.(currentId, rowActive);
                      }}
                    />
                    <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                  </label>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                  {fmtDateTime(row.createdAt)}
                </td>
              </tr>
              {isExpanded && (
                <tr>
                  <td colSpan={12} className="border-b border-blue-200 p-0">
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
