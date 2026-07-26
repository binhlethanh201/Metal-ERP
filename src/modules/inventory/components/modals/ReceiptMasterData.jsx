/**
 * ReceiptMasterData - Thông tin chung phiếu nhập (2 cột).
 * Purchase mode: NCC, Diễn giải, Thanh toán, Hóa đơn
 * Other mode: Đối tượng, Diễn giải
 */
const ReceiptMasterData = ({ p, onAddSupplier }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-5 dark:border-[#333333] dark:bg-[#1a1a1a]/50">
    <div className="grid grid-cols-2 gap-6">
      {/* Cột Trái */}
      <div className="space-y-4">
        {p.isPurchase ? (
          <>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-[#999999]">
                Nhà cung cấp <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-1.5">
                <select
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
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
                  className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 dark:border-[#404040] dark:hover:bg-blue-900/30"
                  onClick={onAddSupplier}
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-[#999999]">
                Diễn giải
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                rows={3}
                placeholder="Nhập ghi chú..."
                value={p.header.description}
                onChange={(e) => p.handleHeader('description', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-[#999999]">
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
                    <span className="text-sm text-slate-700 dark:text-[#b3b3b3]">{o.l}</span>
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
            <div className="border-t border-slate-200 pt-4">
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
                Thông tin hóa đơn mua hàng
              </h4>
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
                  className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 dark:border-[#404040] dark:hover:bg-blue-900/30"
                  onClick={onAddSupplier}
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-[#999999]">
                Diễn giải
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
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
          <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Số phiếu</label>
          <input
            type="text"
            className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 font-mono text-sm text-slate-500 outline-none"
            value={p.header.receiptNumber}
            readOnly
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Thời gian</label>
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
);

export default ReceiptMasterData;
