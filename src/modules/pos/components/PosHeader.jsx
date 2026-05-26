/** Header POS - Search bar + nút Quét mã / Lịch sử / Thêm nhanh + thông tin nhân viên. */
import MaterialIcon from '../../../shared/components/MaterialIcon';

const PosHeader = ({ search, onSearchChange, onBarcodeScan, onHistory, onQuickAdd }) => (
  <header className="fixed left-[260px] right-0 top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
    <div className="flex flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
      <MaterialIcon name="search" className="mr-2 text-slate-400" />
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full border-none bg-transparent text-sm outline-none focus:ring-0"
        placeholder="Tìm sản phẩm (Tên, mã SKU, barcode...)"
      />
    </div>

    <div className="flex items-center gap-4">
      <button
        onClick={onBarcodeScan}
        className="flex items-center gap-x-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 active:scale-95"
      >
        <MaterialIcon name="barcode_scanner" />
        <span>Quét mã</span>
      </button>
      <button
        onClick={onHistory}
        className="flex items-center gap-x-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 active:scale-95"
      >
        <MaterialIcon name="history" />
        <span>Lịch sử</span>
      </button>
      <button
        onClick={onQuickAdd}
        className="flex items-center gap-x-2 rounded-lg bg-[#004785] px-4 py-2 text-sm font-bold text-white transition-all active:scale-95"
      >
        <MaterialIcon name="add" />
        <span>Thêm nhanh</span>
      </button>
      <div className="mx-2 h-8 w-px bg-slate-200" />
      <div className="flex cursor-pointer items-center gap-x-3">
        <div className="text-right">
          <div className="text-sm font-bold leading-none text-slate-900">Nguyễn Văn A</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Quản lý kho
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-200 font-bold text-[#004785]">
          A
        </div>
      </div>
    </div>
  </header>
);

export default PosHeader;
