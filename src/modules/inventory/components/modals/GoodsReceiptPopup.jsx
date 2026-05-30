/**
 * GoodsReceiptPopup - Popup Thêm mới Phiếu Nhập Kho (Spec đầy đủ).
 * 2 chế độ: Mua hàng / Khác. Có discount, VAT, file đính kèm.
 */
import { useEffect, useRef } from 'react';
import Icon from '../../../../shared/components/Icon';
import { useGoodsReceiptPopup } from '../../hooks/useGoodsReceiptPopup';

const fmt = (v) => (v != null ? v.toLocaleString('vi-VN') : '0');

const GoodsReceiptPopup = ({ isOpen, onClose }) => {
  const p = useGoodsReceiptPopup(onClose);
  const overlayRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  const closeFn = p.requestClose;
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') closeFn();
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [closeFn]);

  if (!isOpen) return null;

  const activeWh =
    p.warehouseList.find((w) => {
      const dl = p.dirtyLines[0];
      return w.id === (dl?.warehouseId || 'KHO_CHINH');
    }) || p.warehouseList[0];

  return (
    <div className="fixed inset-0 z-[250] flex items-start justify-center overflow-y-auto py-4">
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60"
        onClick={(e) => {
          if (e.target === overlayRef.current) p.requestClose();
        }}
      />

      <div className="relative z-10 w-full max-w-[1500px] rounded-xl bg-white shadow-2xl">
        {/* ===== HEADER ===== */}
        <div className="sticky top-0 z-20 flex items-center justify-between rounded-t-xl border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900">THÊM MỚI PHIẾU NHẬP KHO</h1>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
              value={p.receiptType}
              onChange={(e) => p.setReceiptType(e.target.value)}
            >
              <option value="purchase">Mua hàng</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={p.requestClose}
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* ===== THÔNG TIN CHUNG (2 cột) ===== */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-5">
            <div className="grid grid-cols-2 gap-6">
              {/* Cột Trái */}
              <div className="space-y-4">
                {p.isPurchase ? (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                        Nhà cung cấp <span className="text-red-400">*</span>
                      </label>
                      <div className="flex gap-1.5">
                        <select
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                          value={p.header.supplierId}
                          onChange={(e) => {
                            const s = p.supplierList.find((x) => x.id === e.target.value);
                            p.handleHeader('supplierId', e.target.value);
                            p.handleHeader('supplierName', s?.name || '');
                          }}
                        >
                          <option value="">-- Chọn nhà cung cấp --</option>
                          {p.supplierList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.code} - {s.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                        Trạng thái thanh toán
                      </label>
                      <div className="flex gap-4">
                        {[
                          { v: 'unpaid', l: 'Chưa thanh toán' },
                          { v: 'paid', l: 'Đã thanh toán' },
                        ].map((o) => (
                          <label key={o.v} className="flex cursor-pointer items-center gap-2">
                            <input
                              type="radio"
                              name="payStatus"
                              className="h-4 w-4 text-blue-600"
                              checked={p.header.paymentStatus === o.v}
                              onChange={() => p.handleHeader('paymentStatus', o.v)}
                            />
                            <span className="text-sm text-slate-700">{o.l}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {p.header.paymentStatus === 'paid' && (
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                          Phương thức thanh toán
                        </label>
                        <select
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                          value={p.header.paymentMethod}
                          onChange={(e) => p.handleHeader('paymentMethod', e.target.value)}
                        >
                          <option>Tiền mặt</option>
                          <option>Chuyển khoản</option>
                          <option>Ví điện tử</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                        Chọn hóa đơn mua hàng
                      </label>
                      <select
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        value=""
                        onChange={() => {}}
                      >
                        <option value="">-- Nhập hóa đơn --</option>
                        <option value="HD001">HD001 - Hòa Phát (25/05/2026)</option>
                        <option value="HD002">HD002 - Thép Việt Nhật (20/05/2026)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                          Ký hiệu
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                          placeholder="VD: 1C24TYY"
                          value={p.header.invoiceCode}
                          onChange={(e) => p.handleHeader('invoiceCode', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                          Số hóa đơn
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                          placeholder="Nhập số hóa đơn"
                          value={p.header.invoiceNumber}
                          onChange={(e) => p.handleHeader('invoiceNumber', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                          Ngày hóa đơn
                        </label>
                        <input
                          type="datetime-local"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                          value={p.header.invoiceDate}
                          onChange={(e) => p.handleHeader('invoiceDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                        Đối tượng <span className="text-red-400">*</span>
                      </label>
                      <div className="flex gap-1.5">
                        <select
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                          value={p.header.partnerId}
                          onChange={(e) => {
                            const pt = p.partnerList.find((x) => x.id === e.target.value);
                            p.handleHeader('partnerId', e.target.value);
                            p.handleHeader('partnerName', pt?.name || '');
                          }}
                        >
                          <option value="">-- Chọn đối tượng --</option>
                          {p.partnerList.map((pt) => (
                            <option key={pt.id} value={pt.id}>
                              {pt.code} - {pt.name} ({pt.type})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                        Diễn giải
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        rows={3}
                        placeholder="Nhập ghi chú..."
                        value={p.header.description}
                        onChange={(e) => p.handleHeader('description', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Cột Phải */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Số phiếu
                  </label>
                  <input
                    type="text"
                    className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 font-mono text-sm text-slate-500 outline-none"
                    value={p.header.receiptNumber}
                    readOnly
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Thời gian
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={p.header.date}
                    onChange={(e) => p.handleHeader('date', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Người lập phiếu
                  </label>
                  <input
                    type="text"
                    className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 outline-none"
                    value={p.header.createdBy}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ===== CHI TIẾT HÀNG HÓA ===== */}
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">CHI TIẾT</h3>
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        /* handle barcode */
                      }
                    }}
                  />
                  <span className="text-xs text-slate-500">Nhấn Enter sau khi quét</span>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1800px] table-fixed">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="w-[44px] px-2 py-2.5 text-center text-[10px] font-bold text-slate-500">
                      #
                    </th>
                    <th className="w-[130px] px-2 py-2.5 text-left text-[10px] font-bold text-slate-500">
                      Mã HH <span className="text-red-400">*</span>
                    </th>
                    <th className="w-[160px] px-2 py-2.5 text-left text-[10px] font-bold text-slate-500">
                      Tên HH
                    </th>
                    <th className="w-[85px] px-2 py-2.5 text-left text-[10px] font-bold text-slate-500">
                      Số lô
                    </th>
                    <th className="w-[90px] px-2 py-2.5 text-left text-[10px] font-bold text-slate-500">
                      Hạn SD
                    </th>
                    <th className="w-[110px] px-2 py-2.5 text-left text-[10px] font-bold text-slate-500">
                      Kho
                    </th>
                    <th className="w-[85px] px-2 py-2.5 text-left text-[10px] font-bold text-slate-500">
                      Vị trí
                    </th>
                    <th className="w-[65px] px-2 py-2.5 text-center text-[10px] font-bold text-slate-500">
                      ĐVT
                    </th>
                    <th className="w-[80px] px-2 py-2.5 text-right text-[10px] font-bold text-slate-500">
                      SL
                    </th>
                    <th className="w-[100px] px-2 py-2.5 text-right text-[10px] font-bold text-slate-500">
                      Đơn giá
                    </th>
                    <th className="w-[110px] px-2 py-2.5 text-right text-[10px] font-bold text-slate-500">
                      Thành tiền
                    </th>
                    <th className="w-[70px] px-2 py-2.5 text-right text-[10px] font-bold text-slate-500">
                      % CK
                    </th>
                    <th className="w-[90px] px-2 py-2.5 text-right text-[10px] font-bold text-slate-500">
                      Tiền CK
                    </th>
                    <th className="w-[65px] px-2 py-2.5 text-right text-[10px] font-bold text-slate-500">
                      % VAT
                    </th>
                    <th className="w-[90px] px-2 py-2.5 text-right text-[10px] font-bold text-slate-500">
                      Tiền thuế
                    </th>
                    <th className="w-[44px] px-2 py-1.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {p.lines.map((line, idx) => {
                    const isD = line.isDirty;
                    const isEmpty = !isD && idx === p.lines.length - 1;
                    return (
                      <tr
                        key={line.id}
                        className={`${isD ? 'hover:bg-blue-50/30' : 'bg-slate-50/30'}`}
                      >
                        <td className="px-2 py-1.5 text-center text-xs text-slate-400">
                          {isD ? p.dirtyLines.indexOf(line) + 1 : ''}
                        </td>
                        <td className="relative px-2 py-1.5">
                          <select
                            className={`w-full rounded border px-2 py-1.5 text-sm outline-none ${isD ? 'border-slate-200 bg-white focus:border-blue-400' : 'cursor-pointer border-dashed border-slate-300 bg-transparent text-slate-400 hover:border-blue-400'}`}
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
                          {isD ? (
                            <select
                              className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                              value={line.warehouseId}
                              onChange={(e) => {
                                const w = p.warehouseList.find((x) => x.id === e.target.value);
                                p.updateLine(line.id, {
                                  warehouseId: e.target.value,
                                  warehouseName: w?.name || '',
                                  locationId: '',
                                  locationName: '',
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
                        <td className="px-2 py-1.5">
                          {isD ? (
                            <select
                              className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                              value={line.locationId}
                              onChange={(e) => {
                                const loc = activeWh?.locations?.find(
                                  (l) => l.id === e.target.value
                                );
                                p.updateLine(line.id, {
                                  locationId: e.target.value,
                                  locationName: loc?.name || '',
                                });
                              }}
                            >
                              <option value="">--</option>
                              {activeWh?.locations?.map((l) => (
                                <option key={l.id} value={l.id}>
                                  {l.name}
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
                            type="number"
                            className={`w-full rounded border px-2 py-1.5 text-right text-sm outline-none ${isD ? 'border-slate-200 bg-white focus:border-blue-500' : 'cursor-not-allowed border-transparent bg-transparent text-slate-400'}`}
                            value={isD ? line.discountPercent || '' : ''}
                            min={0}
                            max={100}
                            onChange={(e) =>
                              p.recalcLine(line.id, 'discountPercent', e.target.value)
                            }
                            disabled={!isD}
                          />
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          <span
                            className={`text-sm tabular-nums ${isD ? 'text-amber-700' : 'text-slate-400'}`}
                          >
                            {isD ? fmt(line.discountAmount) : ''}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            className={`w-full rounded border px-2 py-1.5 text-right text-sm outline-none ${isD ? 'border-slate-200 bg-white focus:border-blue-500' : 'cursor-not-allowed border-transparent bg-transparent text-slate-400'}`}
                            value={isD ? line.vatPercent || '' : ''}
                            min={0}
                            onChange={(e) => p.recalcLine(line.id, 'vatPercent', e.target.value)}
                            disabled={!isD}
                          />
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          <span
                            className={`text-sm tabular-nums ${isD ? 'text-blue-700' : 'text-slate-400'}`}
                          >
                            {isD ? fmt(line.vatAmount) : ''}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          {isD && p.dirtyLines.length > 1 && (
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

          {/* ===== FILE ĐÍNH KÈM ===== */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase text-slate-600">📎 File đính kèm</h3>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600"
                onClick={p.handleAttach}
              >
                <Icon name="upload_file" className="text-base" /> Chọn tệp
              </button>
            </div>
            {p.attachments.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {p.attachments.map((a) => (
                  <div
                    key={a.name}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <span className="text-sm text-slate-600">
                      {a.name}{' '}
                      <span className="text-xs text-slate-400">
                        ({(a.size / 1024).toFixed(1)} KB)
                      </span>
                    </span>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-red-500"
                      onClick={() => p.handleRemoveAttach(a.name)}
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-slate-400">
              Hỗ trợ: pdf, doc, docx, xls, xlsx, jpg, png, zip, rar - Tối đa 20MB/file
            </p>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="sticky bottom-0 z-20 rounded-b-xl border-t-2 border-slate-200 bg-white px-6 py-4">
          <div className="mb-3 grid grid-cols-4 gap-4 text-right">
            <div>
              <span className="text-xs text-slate-500">Tổng tiền hàng</span>
              <div className="text-base font-bold text-slate-800">{fmt(p.totalAmount)}</div>
            </div>
            <div>
              <span className="text-xs text-slate-500">Tổng chiết khấu</span>
              <div className="text-base font-bold text-amber-700">-{fmt(p.totalDiscount)}</div>
            </div>
            <div>
              <span className="text-xs text-slate-500">Tổng thuế</span>
              <div className="text-base font-bold text-blue-700">{fmt(p.totalTax)}</div>
            </div>
            <div>
              <span className="text-xs text-slate-500">Tổng thanh toán</span>
              <div className="text-lg font-bold text-slate-900">{fmt(p.totalPayment)} VND</div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              onClick={p.requestClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="rounded-lg bg-[#004785] px-7 py-2.5 text-sm font-bold text-white hover:bg-[#003566] disabled:opacity-50"
              onClick={p.handleSubmit}
              disabled={!p.isValid || p.saving}
            >
              {p.saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>

        {/* ===== CONFIRM CLOSE ===== */}
        {p.showConfirmClose && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => p.setShowConfirmClose(false)}
            />
            <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <Icon name="warning" className="text-amber-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Bạn có chắc muốn thoát?</h3>
                  <p className="mt-1 text-sm text-slate-500">Dữ liệu chưa được lưu sẽ bị mất.</p>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  onClick={() => p.setShowConfirmClose(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  onClick={() => {
                    p.setShowConfirmClose(false);
                    onClose?.();
                  }}
                >
                  Thoát không lưu
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-[#004785] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#003566]"
                  onClick={async () => {
                    const ok = await p.handleSubmit();
                    if (ok) onClose?.();
                  }}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoodsReceiptPopup;
