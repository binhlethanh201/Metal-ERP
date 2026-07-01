/**
 * GoodsIssueHeaderInfo - Phần thông tin chung của phiếu xuất kho.
 * Gồm: Loại XK, Đối tượng (+ thêm nhanh), Diễn giải, Tham chiếu, Số phiếu, Thời gian, Người lập.
 */
const GoodsIssueHeaderInfo = ({
  header,
  onChange,
  customerList,
  issueTypes,
  onQuickAddCustomer,
}) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Loại xuất kho */}
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Loại xuất kho
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            value={header.issueType}
            onChange={(e) => onChange('issueType', e.target.value)}
          >
            {issueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Đối tượng + nút thêm nhanh */}
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Đối tượng <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <select
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              value={header.customerId}
              onChange={(e) => {
                const cust = customerList.find((c) => c.id === e.target.value);
                onChange('customerId', e.target.value);
                onChange('customerName', cust?.name || '');
              }}
            >
              <option value="">-- Chọn đối tượng --</option>
              {customerList.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.code} - {cust.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 transition-colors hover:bg-blue-50"
              onClick={onQuickAddCustomer}
              title="Thêm nhanh đối tượng"
            >
              <span className="text-lg font-bold leading-none">+</span>
            </button>
          </div>
        </div>

        {/* Diễn giải */}
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Diễn giải
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            placeholder="Lý do xuất kho..."
            value={header.description}
            onChange={(e) => onChange('description', e.target.value)}
          />
        </div>

        {/* Tham chiếu */}
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Tham chiếu
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            placeholder="Mã chứng từ liên quan..."
            value={header.reference}
            onChange={(e) => onChange('reference', e.target.value)}
          />
        </div>

        {/* Số phiếu */}
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Số phiếu <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-600 outline-none"
            value={header.issueNumber}
            readOnly
          />
        </div>

        {/* Thời gian */}
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Thời gian <span className="text-red-400">*</span>
          </label>
          <input
            type="datetime-local"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            value={header.date}
            onChange={(e) => onChange('date', e.target.value)}
          />
        </div>

        {/* Người lập phiếu */}
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Người lập phiếu
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 outline-none"
            value={header.createdBy}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default GoodsIssueHeaderInfo;
