/**
 * ReceiptLineTable - Bảng chi tiết hàng hóa nhập kho.
 */
import Icon from '../../../../shared/components/Icon';

const fmt = (v) => (v != null ? v.toLocaleString('vi-VN') : '0');

const ReceiptLineTable = ({ p, onRequestNewProduct }) => (
  <div className="rounded-lg border border-slate-200 bg-white dark:border-[#333333] dark:bg-[#0f0f0f]">
    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-[#333333]">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-[#999999]">CHI TIẾT</h3>
        <button
          type="button"
          className="flex items-center gap-1 rounded border border-dashed border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-blue-100"
          onClick={() => onRequestNewProduct?.()}
        >
          <Icon name="add" size={14} /> Thêm sản phẩm
        </button>
      </div>
      <label className="flex cursor-pointer select-none items-center gap-2.5">
        <span className="text-xs font-semibold text-slate-500">Quét mã vạch</span>
        <button
          type="button"
          role="switch"
          aria-checked={p.barcodeMode}
          onClick={() => p.setBarcodeMode(!p.barcodeMode)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${p.barcodeMode ? 'bg-blue-600' : 'bg-slate-300'}`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${p.barcodeMode ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}
          />
        </button>
      </label>
    </div>

    {p.barcodeMode && (
      <div className="border-b border-dashed border-blue-200 bg-blue-50/40 px-5 py-3">
        <div className="flex items-center gap-3">
          <Icon name="barcode_scanner" className="text-blue-600" size={22} />
          <input
            ref={p.barcodeRef}
            type="text"
            className="flex-1 rounded-lg border border-blue-300 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-blue-500"
            placeholder="Quét mã vạch..."
            autoFocus
          />
          <span className="text-xs text-slate-500">Nhấn Enter sau khi quét</span>
        </div>
      </div>
    )}

    <div className="overflow-x-auto">
      <table className="w-full min-w-[1580px] table-fixed">
        <thead className="border-b border-slate-200 bg-slate-50 dark:border-[#333333] dark:bg-[#1a1a1a]">
          <tr>
            <th className="w-[44px] px-2 py-2.5 text-center text-[10px] font-bold text-slate-500 dark:text-[#999999]">
              #
            </th>
            <th className="w-[110px] px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 dark:text-[#999999]">
              SKU <span className="text-red-400">*</span>
            </th>
            <th className="w-[160px] px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 dark:text-[#999999]">
              Tên hàng hóa
            </th>
            <th className="w-[85px] px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 dark:text-[#999999]">
              Số lô
            </th>
            <th className="w-[90px] px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 dark:text-[#999999]">
              Hạn sử dụng
            </th>
            <th className="w-[120px] px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 dark:text-[#999999]">
              Serial/IMEI
            </th>
            <th className="w-[110px] px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 dark:text-[#999999]">
              Kho
            </th>
            <th className="w-[80px] px-2 py-2.5 text-center text-[10px] font-bold text-slate-500 dark:text-[#999999]">
              Đơn vị tính
            </th>
            <th className="w-[75px] px-2 py-2.5 text-right text-[10px] font-bold text-slate-500 dark:text-[#999999]">
              Tồn kho
            </th>
            <th className="w-[85px] px-2 py-2.5 text-right text-[10px] font-bold text-slate-500 dark:text-[#999999]">
              Số lượng
            </th>
            <th className="w-[110px] px-2 py-2.5 text-right text-[10px] font-bold text-slate-500 dark:text-[#999999]">
              Đơn giá
            </th>
            <th className="w-[120px] px-2 py-2.5 text-right text-[10px] font-bold text-slate-500 dark:text-[#999999]">
              Thành tiền
            </th>
            <th className="w-[120px] px-2 py-2.5 text-left text-[10px] font-bold text-slate-500 dark:text-[#999999]">
              Ghi chú
            </th>
            <th className="w-[44px] px-2 py-1.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
          {p.lines.map((line, idx) => {
            const isD = line.isDirty;
            const isEmpty = !isD && idx === p.lines.length - 1;
            return (
              <tr key={line.id} className={`${isD ? 'hover:bg-blue-50/30 dark:hover:bg-blue-900/20' : 'bg-slate-50/30 dark:bg-[#1a1a1a]/30'}`}>
                <td className="px-2 py-1.5 text-center text-xs text-slate-400 dark:text-[#808080]">
                  {isD ? p.dirtyLines.indexOf(line) + 1 : ''}
                </td>
                <td className="px-2 py-1.5">
                  <select
                    className={`w-full rounded border px-2 py-1.5 text-sm outline-none ${isD ? 'border-slate-200 bg-white focus:border-blue-400 dark:border-[#404040] dark:bg-[#1a1a1a]' : 'cursor-pointer border-dashed border-slate-300 bg-transparent text-slate-400 hover:border-blue-400 dark:border-[#404040] dark:text-[#808080]'}`}
                    value={line.productId}
                    onChange={(e) => {
                      const prod = p.productList.find((x) => x.id === e.target.value);
                      if (prod) p.handleProductSelect(line.id, prod);
                    }}
                  >
                    <option value="">{isEmpty ? '+ Thêm sản phẩm' : '-- Chọn --'}</option>
                    {p.productList.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.code} - {prod.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    className="w-full border border-transparent bg-transparent px-2 py-1.5 text-sm text-slate-600 outline-none"
                    value={line.productName}
                    readOnly
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    className={`w-full rounded border px-2 py-1.5 text-sm outline-none ${isD ? 'border-slate-200 bg-white focus:border-blue-400' : 'cursor-not-allowed border-transparent bg-slate-100 text-slate-400'}`}
                    value={line.lotNumber}
                    onChange={(e) => p.updateLine(line.id, { lotNumber: e.target.value })}
                    disabled={!isD}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="date"
                    className={`w-full rounded border px-2 py-1.5 text-sm outline-none ${isD ? 'border-slate-200 bg-white focus:border-blue-400' : 'cursor-not-allowed border-transparent bg-slate-100 text-slate-400'}`}
                    value={line.expiryDate}
                    onChange={(e) => p.updateLine(line.id, { expiryDate: e.target.value })}
                    disabled={!isD}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    className={`w-full rounded border px-2 py-1.5 text-sm outline-none ${isD ? 'border-slate-200 bg-white focus:border-blue-400' : 'cursor-not-allowed border-transparent bg-slate-100 text-slate-400'}`}
                    value={line.serialImei || ''}
                    onChange={(e) => p.updateLine(line.id, { serialImei: e.target.value })}
                    disabled={!isD}
                    placeholder="Nhập Serial/IMEI"
                  />
                </td>
                <td className="px-2 py-1.5">
                  {isD ? (
                    <select
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                      value={line.warehouseId}
                      onChange={(e) => {
                        const w = p.warehouseList.find((x) => x.id === e.target.value);
                        p.updateLine(line.id, {
                          warehouseId: e.target.value,
                          warehouseName: w?.name || '',
                        });
                      }}
                    >
                      {p.warehouseList.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm text-slate-400">--</span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-center">
                  <span className={`text-sm ${isD ? 'text-slate-700' : 'text-slate-400'}`}>
                    {line.unit || '--'}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right">
                  <span
                    className={`text-sm font-semibold ${(() => {
                      const prod = p.productList.find((x) => x.id === line.productId);
                      const s = prod?.stock ?? 0;
                      if (!line.productId) return 'text-slate-300';
                      return s <= 0 ? 'text-red-500' : 'text-emerald-600';
                    })()}`}
                  >
                    {line.productId
                      ? fmt(p.productList.find((x) => x.id === line.productId)?.stock ?? 0)
                      : '--'}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <input
                    ref={(el) => {
                      p.qtyRefs.current[`q_${line.id}`] = el;
                    }}
                    type="number"
                    className={`w-full rounded border px-2 py-1.5 text-right text-sm outline-none ${isD ? 'border-slate-200 bg-white focus:border-blue-500' : 'cursor-not-allowed border-transparent bg-transparent text-slate-400'}`}
                    value={isD ? line.quantity : ''}
                    min={0}
                    onChange={(e) => p.recalcLine(line.id, 'quantity', e.target.value)}
                    disabled={!isD}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    className={`w-full rounded border px-2 py-1.5 text-right text-sm outline-none ${isD ? 'border-slate-200 bg-white focus:border-blue-500' : 'cursor-not-allowed border-transparent bg-transparent text-slate-400'}`}
                    value={isD ? line.unitPrice || '' : ''}
                    min={0}
                    onChange={(e) => p.recalcLine(line.id, 'unitPrice', e.target.value)}
                    disabled={!isD}
                  />
                </td>
                <td className="px-2 py-1.5 text-right">
                  <span
                    className={`text-sm font-semibold tabular-nums ${isD ? 'text-slate-800' : 'text-slate-400'}`}
                  >
                    {isD ? fmt(line.amount) : ''}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    className={`w-full rounded border px-2 py-1.5 text-sm outline-none ${isD ? 'border-slate-200 bg-white focus:border-blue-400' : 'cursor-not-allowed border-transparent bg-slate-100 text-slate-400'}`}
                    value={line.notes || ''}
                    onChange={(e) => p.updateLine(line.id, { notes: e.target.value })}
                    disabled={!isD}
                    placeholder="Ghi chú"
                  />
                </td>
                <td className="px-2 py-1.5 text-center">
                  {isD && (
                    <button
                      type="button"
                      className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      onClick={() => p.handleRemoveLine(line.id)}
                    >
                      <Icon name="delete" size={16} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default ReceiptLineTable;
