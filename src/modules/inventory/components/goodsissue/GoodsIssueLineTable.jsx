/**
 * GoodsIssueLineTable - Bảng nhập liệu động các dòng hàng hóa xuất kho.
 * Các cột: Mã HH (autocomplete) | Tên HH | Số lô | HSD | Kho | Vị trí | ĐVT | SL | Đơn giá | Thành tiền | Xóa
 */
import { useRef, useEffect, useCallback } from 'react';
import Icon from '../../../../shared/components/Icon';
import ProductAutocomplete from './ProductAutocomplete';
import { warehouseList } from '../../data/goodsIssueMockData';
import { formatMoney } from '../../utils/goodsIssueUtils';

const GoodsIssueLineTable = ({
  lines,
  barcodemode,
  autocomplete,
  onLineChange,
  onProductSelect,
  onQuantityChange,
  onPriceChange,
  onAddLine,
  onRemoveLine,
  onQuickAdd,
  onAdvancedSearch,
}) => {
  const tableRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.ctrlKey && e.key === 'Insert') {
        e.preventDefault();
        onAddLine();
      }
    },
    [onAddLine]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table ref={tableRef} className="w-full min-w-[1400px] table-fixed">
        {/* Header */}
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="w-[48px] px-2 py-2.5 text-center text-xs font-bold text-slate-500">#</th>
            <th className="w-[160px] px-2 py-2.5 text-left text-xs font-bold text-slate-500">
              Mã hàng hóa <span className="text-red-400">*</span>
            </th>
            <th className="w-[180px] px-2 py-2.5 text-left text-xs font-bold text-slate-500">
              Tên hàng hóa
            </th>
            <th className="w-[100px] px-2 py-2.5 text-left text-xs font-bold text-slate-500">
              Số lô
            </th>
            <th className="w-[100px] px-2 py-2.5 text-left text-xs font-bold text-slate-500">
              Hạn SD
            </th>
            <th className="w-[140px] px-2 py-2.5 text-left text-xs font-bold text-slate-500">
              Kho xuất
            </th>
            <th className="w-[100px] px-2 py-2.5 text-left text-xs font-bold text-slate-500">
              Vi tri
            </th>
            <th className="w-[90px] px-2 py-2.5 text-center text-xs font-bold text-slate-500">
              DVT
            </th>
            <th className="w-[100px] px-2 py-2.5 text-right text-xs font-bold text-slate-500">
              Số lượng <span className="text-red-400">*</span>
            </th>
            <th className="w-[120px] px-2 py-2.5 text-right text-xs font-bold text-slate-500">
              Đơn giá
            </th>
            <th className="w-[130px] px-2 py-2.5 text-right text-xs font-bold text-slate-500">
              Thành tiền
            </th>
            <th className="w-[48px] px-2 py-2.5 text-center text-xs font-bold text-slate-500"></th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-slate-100">
          {lines.map((line, idx) => (
            <tr key={line.id} className="transition-colors hover:bg-blue-50/30">
              {/* STT */}
              <td className="px-2 py-1.5 text-center text-xs text-slate-400">{idx + 1}</td>

              {/* Mã hàng hóa - Autocomplete */}
              <td className="px-2 py-1.5">
                {barcodemode ? (
                  <input
                    type="text"
                    className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                    placeholder="Quét mã vạch..."
                    autoFocus
                  />
                ) : (
                  <ProductAutocomplete
                    searchText={
                      autocomplete.activeLineId === line.id
                        ? autocomplete.searchText
                        : line.productCode
                    }
                    onSearchChange={(value) => {
                      autocomplete.setSearchText(value);
                    }}
                    results={autocomplete.results}
                    isOpen={autocomplete.isOpen && autocomplete.activeLineId === line.id}
                    activeIndex={autocomplete.activeIndex}
                    dropdownRef={autocomplete.dropdownRef}
                    inputRef={autocomplete.inputRef}
                    onSelect={(product) => onProductSelect(line.id, product)}
                    onClose={autocomplete.closeSearch}
                    onKeyDown={(e) =>
                      autocomplete.handleKeyDown(e, (product) => onProductSelect(line.id, product))
                    }
                    onQuickAdd={onQuickAdd}
                    onAdvancedSearch={onAdvancedSearch}
                  />
                )}
                {!barcodemode && !autocomplete.isOpen && (
                  <div
                    className="mt-0.5 cursor-pointer text-[10px] text-slate-400 hover:text-blue-600"
                    onClick={() => autocomplete.openSearch(line.id, line.productCode)}
                  >
                    Bam de Tìm kiếm (F3)
                  </div>
                )}
              </td>

              {/* Tên hàng hóa */}
              <td className="px-2 py-1.5">
                <input
                  type="text"
                  className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-200"
                  value={line.productName}
                  onChange={(e) => onLineChange(line.id, 'productName', e.target.value)}
                  readOnly={!!line.productId}
                />
              </td>

              {/* Số lô */}
              <td className="px-2 py-1.5">
                <input
                  type="text"
                  className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-200"
                  value={line.lotNumber}
                  onChange={(e) => onLineChange(line.id, 'lotNumber', e.target.value)}
                  placeholder="..."
                />
              </td>

              {/* Hạn sử dụng */}
              <td className="px-2 py-1.5">
                <input
                  type="date"
                  className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-200"
                  value={line.expiryDate}
                  onChange={(e) => onLineChange(line.id, 'expiryDate', e.target.value)}
                />
              </td>

              {/* Kho xuất */}
              <td className="px-2 py-1.5">
                <select
                  className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-200"
                  value={line.warehouseId}
                  onChange={(e) => {
                    const wh = warehouseList.find((w) => w.id === e.target.value);
                    onLineChange(line.id, 'warehouseId', e.target.value);
                    onLineChange(line.id, 'warehouseName', wh?.name || '');
                  }}
                >
                  {warehouseList.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name}
                    </option>
                  ))}
                </select>
              </td>

              {/* Vị trí */}
              <td className="px-2 py-1.5">
                <input
                  type="text"
                  className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-200"
                  value={line.location}
                  onChange={(e) => onLineChange(line.id, 'location', e.target.value)}
                  placeholder="..."
                />
              </td>

              {/* ĐVT */}
              <td className="px-2 py-1.5 text-center">
                <span className="text-sm text-slate-600">{line.unit || '-'}</span>
              </td>

              {/* Số lượng */}
              <td className="px-2 py-1.5">
                <input
                  type="number"
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-right text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  value={line.quantity}
                  min={0}
                  onChange={(e) => onQuantityChange(line.id, e.target.value)}
                />
              </td>

              {/* Đơn giá */}
              <td className="px-2 py-1.5">
                <input
                  type="number"
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-right text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  value={line.unitPrice || ''}
                  min={0}
                  onChange={(e) => onPriceChange(line.id, e.target.value)}
                />
              </td>

              {/* Thành tiền */}
              <td className="px-2 py-1.5 text-right">
                <span className="text-sm font-semibold text-slate-800">
                  {formatMoney(line.totalAmount)}
                </span>
              </td>

              {/* Xóa dòng */}
              <td className="px-2 py-1.5 text-center">
                <button
                  type="button"
                  className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  onClick={() => onRemoveLine(line.id)}
                  disabled={lines.length <= 1}
                  title="Xóa dòng"
                >
                  <Icon name="delete" size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty state: nút thêm dòng */}
      <div className="border-t border-dashed border-slate-200 px-4 py-2">
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 transition-colors hover:text-blue-900"
          onClick={onAddLine}
        >
          <span className="text-lg leading-none">+</span>
          <span>Them dòng moi (Ctrl + Insert)</span>
        </button>
      </div>
    </div>
  );
};

export default GoodsIssueLineTable;
