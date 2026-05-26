/**
 * Bảng sản phẩm - Data table với sort, expand/collapse row, ProductDetailPanel.
 * Đã cấu hình đồng bộ bộ icon Lucide mới.
 */
import { Fragment } from 'react';
import Icon from '../../../../shared/components/Icon';
import ProductDetailPanel from './ProductDetailPanel';
import { toneClass } from '../../utils/productUtils';

const formatMoney = (v) => new Intl.NumberFormat('vi-VN').format(v);

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
  <table className="w-full min-w-[1150px] border-collapse text-left">
    <thead className="border-b border-slate-200 bg-[#e8f0fe]">
      <tr className="text-[11px] font-bold uppercase text-slate-600">
        <th className="w-10 px-4 py-3 text-center">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-primary focus:ring-primary"
          />
        </th>
        <th className="w-8 px-2 py-3">
          <Icon name="star_outline" className="text-slate-400" size={16} />
        </th>
        {[
          ['Mã hàng', 'id'],
          ['Tên hàng', 'name'],
          ['Đơn vị', null],
          ['Thương hiệu', null],
          ['Giá bán', 'salePrice'],
          ['Giá vốn', null],
          ['Tồn kho', 'stock'],
          ['Vị trí kho', null],
          ['Trạng thái', null],
          ['Thời gian tạo', null],
        ].map(([label, sortKey]) => (
          <th
            key={label}
            className={`${sortKey ? 'cursor-pointer' : ''} px-4 py-3 ${label === 'Giá bán' || label === 'Giá vốn' || label === 'Tồn kho' ? 'text-right' : ''}`}
            onClick={() => sortKey && onToggleSort?.(sortKey)}
          >
            <div
              className={`flex items-center gap-1 ${label === 'Giá bán' || label === 'Giá vốn' || label === 'Tồn kho' ? 'justify-end' : ''}`}
            >
              <span>{label}</span>
              {sortKey && <Icon name={getSortIcon?.(sortKey)} size={14} />}
            </div>
          </th>
        ))}
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
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-primary"
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
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-100">
                    {row.image ? (
                      <img src={row.image} alt={row.name} className="h-full w-full object-cover" />
                    ) : (
                      <Icon name="image" className="text-slate-400" size={20} />
                    )}
                  </div>
                  <span className="font-medium text-primary">{row.productCode || row.id}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-700">{row.name}</td>
              <td className="px-4 py-3">{row.unit}</td>
              <td className="px-4 py-3">{row.brand}</td>
              <td className="px-4 py-3 text-right font-medium">{formatMoney(row.salePrice)}</td>
              <td className="px-4 py-3 text-right text-slate-500">{formatMoney(row.costPrice)}</td>
              <td className="px-4 py-3 text-right font-bold text-slate-900">{row.stock}</td>
              <td className="px-4 py-3">{row.location}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold ${toneClass[row.statusTone]}`}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">{row.createdAt}</td>
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
