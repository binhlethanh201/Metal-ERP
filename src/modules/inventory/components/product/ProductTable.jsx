/**
 * Bảng sản phẩm - Định dạng lại cột thời gian (HH:mm:ss DD/MM/YYYY)
 * Sửa lỗi lệch hàng dữ liệu và giữ nguyên độ rộng cố định (table-fixed).
 */
import { Fragment } from 'react';
import Icon from '../../../../shared/components/Icon';
import ProductDetailPanel from './ProductDetailPanel';
import { toneClass } from '../../utils/productUtils';

// Hàm định dạng tiền tệ Việt Nam
const formatMoney = (v) => new Intl.NumberFormat('vi-VN').format(v || 0);

// Hàm định dạng thời gian từ ISO sang "HH:mm:ss DD/MM/YYYY"
const formatDateTime = (dateStr) => {
  if (!dateStr) return '---';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; // Fallback nếu chuỗi không hợp lệ

    const pad = (num) => String(num).padStart(2, '0');

    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());

    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();

    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  } catch (e) {
    return dateStr;
  }
};

const ProductTable = ({
  rows = [],
  sortConfig,
  getSortIcon,
  onToggleSort,
  expandedId,
  onToggleExpand,
  onEdit,
  onDelete,
}) => (
  <table className="w-full min-w-[1250px] table-fixed border-collapse text-left">
    <thead className="border-b border-slate-200 bg-[#e8f0fe]">
      <tr className="text-[11px] font-bold uppercase text-slate-600">
        {/* 1. Ô Chọn hàng (Thứ 1) */}
        <th className="w-[48px] px-4 py-3 text-center">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-primary focus:ring-primary"
          />
        </th>
        {/* 2. Ô Gắn sao (Thứ 2) */}
        <th className="w-[40px] px-2 py-3">
          <Icon name="star_outline" className="text-slate-400" size={16} />
        </th>
        {/* 10 Ô Nội dung tiếp theo (Thứ 3 đến Thứ 12) -> Tổng cộng 12 cột */}
        {[
          ['Mã hàng', 'id', 'w-[140px]'],
          ['Tên hàng', 'name', 'w-[240px]'],
          ['Đơn vị', 'unit', 'w-[90px]'],
          ['Thương hiệu', 'brand', 'w-[130px]'],
          ['Giá bán', 'salePrice', 'w-[110px]'],
          ['Giá vốn', 'costPrice', 'w-[110px]'],
          ['Tồn kho', 'stock', 'w-[110px]'],
          ['Vị trí kho', 'location', 'w-[110px]'],
          ['Trạng thái', 'productStatus', 'w-[125px]'],
          ['Thời gian tạo', 'createdAt', 'w-[160px]'],
        ].map(([label, sortKey, widthClass]) => {
          const isSorted = sortConfig?.key === sortKey;
          return (
            <th
              key={label}
              className={`${widthClass} ${sortKey ? 'cursor-pointer select-none' : ''} px-4 py-3 ${
                label === 'Giá bán' || label === 'Giá vốn' || label === 'Tồn kho'
                  ? 'text-right'
                  : ''
              }`}
              onClick={() => sortKey && onToggleSort?.(sortKey)}
            >
              <div
                className={`flex items-center gap-1 ${
                  label === 'Giá bán' || label === 'Giá vốn' || label === 'Tồn kho'
                    ? 'justify-end'
                    : ''
                }`}
              >
                <span className="truncate">{label}</span>
                {sortKey && (
                  <div className="flex-none">
                    <Icon
                      name={getSortIcon?.(sortKey) || 'unfold_more'}
                      size={14}
                      className={isSorted ? 'font-bold text-blue-600' : 'text-slate-400 opacity-50'}
                    />
                  </div>
                )}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-sm">
      {rows.map((row) => {
        const isExpanded = expandedId === row.id;
        return (
          <Fragment key={row.id}>
            <tr
              className={`group cursor-pointer transition-colors hover:bg-blue-50 ${isExpanded ? 'bg-blue-50' : ''}`}
              onClick={() => onToggleExpand?.(row.id)}
            >
              {/* Cột 1: Checkbox */}
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-primary"
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              {/* Cột 2: Gắn sao */}
              <td className="px-2 py-3">
                <Icon
                  name="star_outline"
                  className="text-slate-300 transition-colors group-hover:text-amber-400"
                  size={16}
                />
              </td>
              {/* Cột 3: Ảnh + Mã hàng (ĐÃ FIX: gom ảnh và mã vào 1 ô duy nhất trùng với Title Thư 1) */}
              <td className="overflow-hidden px-4 py-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-100">
                    {row.image ? (
                      <img src={row.image} alt={row.name} className="h-full w-full object-cover" />
                    ) : (
                      <Icon name="image" className="text-slate-400" size={20} />
                    )}
                  </div>
                  <span className="truncate font-medium text-primary">
                    {row.productCode || row.id}
                  </span>
                </div>
              </td>
              {/* Cột 4: Tên hàng */}
              <td className="truncate whitespace-nowrap px-4 py-3 text-slate-700">{row.name}</td>
              {/* Cột 5: Đơn vị tính */}
              <td className="truncate whitespace-nowrap px-4 py-3 text-slate-600">
                {row.unit || '---'}
              </td>
              {/* Cột 6: Thương hiệu */}
              <td className="truncate whitespace-nowrap px-4 py-3 text-slate-600">
                {row.brand || '---'}
              </td>
              {/* Cột 7: Giá bán */}
              <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-800">
                {formatMoney(row.salePrice)}
              </td>
              {/* Cột 8: Giá vốn */}
              <td className="whitespace-nowrap px-4 py-3 text-right text-slate-500">
                {formatMoney(row.costPrice)}
              </td>
              {/* Cột 9: Số lượng tồn kho */}
              <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-900">
                {row.stock}
              </td>
              {/* Cột 10: Vị trí trong kho */}
              <td className="truncate whitespace-nowrap px-4 py-3 text-slate-500">
                {row.location || '---'}
              </td>
              {/* Cột 11: Trạng thái kinh doanh */}
              <td className="whitespace-nowrap px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-1 text-[10px] font-bold ${toneClass[row.statusTone] || 'bg-slate-100 text-slate-600'}`}
                >
                  {row.status}
                </span>
              </td>
              {/* Cột 12: ĐÃ ĐỊNH DẠNG LẠI THỜI GIAN THEO FORMAT YÊU CẦU */}
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                {formatDateTime(row.createdAt)}
              </td>
            </tr>
            <tr className={isExpanded ? '' : 'hidden'}>
              <td colSpan={12} className="border-b border-blue-200 p-0">
                <ProductDetailPanel row={row} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          </Fragment>
        );
      })}
    </tbody>
  </table>
);

export default ProductTable;
