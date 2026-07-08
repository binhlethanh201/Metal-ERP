import { Fragment } from 'react';
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

  // Đã bỏ sortKey ra khỏi mảng columns
  const columns = [
    ['Mã hàng', 'w-[140px]'],
    ['Tên hàng', 'w-[240px]'],
    ['Đơn vị', 'w-[90px]'],
    ['Thương hiệu', 'w-[130px]'],
    ['Giá bán', 'w-[110px]'],
    ['Giá vốn', 'w-[110px]'],
    ['Tồn kho', 'w-[110px]'],
    ['Vị trí kho', 'w-[110px]'],
    ['Hoạt động', 'w-[90px]'],
    ['Thời gian tạo', 'w-[160px]'],
  ];

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

          {/* Đã xóa cột Star */}

          {columns.map(([label, widthClass]) => {
            const isNumCol = label === 'Giá bán' || label === 'Giá vốn' || label === 'Tồn kho';
            return (
              <th key={label} className={`${widthClass} px-4 py-3 ${isNumCol ? 'text-right' : ''}`}>
                <div className={`flex items-center gap-1 ${isNumCol ? 'justify-end' : ''}`}>
                  <span className="truncate">{label}</span>
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 text-sm">
        {rows.length === 0 && (
          <tr>
            {/* Giảm colSpan từ 12 xuống 11 do đã xóa 1 cột */}
            <td colSpan={11} className="px-6 py-8 text-center text-slate-500">
              Không có dữ liệu
            </td>
          </tr>
        )}
        {rows.map((row) => {
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
                  {row.actualStock ?? row.stock ?? 0}
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
