import { useRef, useState } from 'react';
import {
  Package,
  CalendarClock,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Settings,
} from 'lucide-react';
import { Button } from '../../../../shared/components/Button';
import { Textarea } from '../../../../shared/components/Textarea';
import Modal from '../../../../shared/components/Modal';

const STORAGE_KEY = 'stockImport_customTypes';

const loadCustomTypes = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCustomTypes = (types) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
};

const DEFAULT_TYPES = [
  { value: 1, label: 'Nhập mua hàng từ NCC' },
  { value: 2, label: 'Khách hàng trả lại' },
  { value: 3, label: 'Cân bằng kho' },
];

export const ImportTicketForm = ({
  inwardType,
  onChangeInwardType,
  suppliers = [],
  selectedSupplier,
  onSelectSupplier,
  note,
  onChangeNote,
  totals,
  status,
  isSubmitting,
  onSubmit,
  formatCurrency,
}) => {
  const containerRef = useRef(null);
  const [supplierPopupOpen, setSupplierPopupOpen] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [typeManagerOpen, setTypeManagerOpen] = useState(false);
  const [customTypes, setCustomTypes] = useState(loadCustomTypes);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeMap, setNewTypeMap] = useState(1);

  const allTypes = [...DEFAULT_TYPES, ...customTypes];

  const filteredSuppliers = supplierSearch.trim()
    ? suppliers.filter((s) =>
        `${s.name || ''} ${s.code || ''} ${s.phone || ''}`
          .toLowerCase()
          .includes(supplierSearch.trim().toLowerCase())
      )
    : suppliers;

  return (
    <>
      <aside className="space-y-4">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Package size={18} className="text-[#004785]" />
            <h2 className="text-lg font-bold text-slate-900">Thông tin phiếu nhập</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Người lập phiếu
              </div>
              <div className="mt-1 font-semibold text-slate-900">Quản lý kho</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <CalendarClock size={14} /> Thời gian
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {new Date().toLocaleString('vi-VN')}
              </div>
            </div>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            <div className="mb-1.5 flex items-center justify-between">
              <span>Loại phiếu nhập kho</span>
              <button
                type="button"
                onClick={() => setTypeManagerOpen(true)}
                className="flex items-center gap-1 text-xs font-semibold text-[#004785] hover:underline"
              >
                <Settings size={14} /> Quản lý
              </button>
            </div>
            <select
              value={inwardType}
              onChange={(e) => onChangeInwardType(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#004785]"
            >
              {allTypes.map((t) => (
                <option key={`${t.value}-${t.label}`} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <div className="relative" ref={containerRef}>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nhà cung cấp / Đối tượng
            </label>
            <button
              type="button"
              onClick={() => setSupplierPopupOpen(!supplierPopupOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#004785]"
            >
              <span
                className={`truncate ${selectedSupplier ? 'text-slate-900' : 'text-slate-400'}`}
              >
                {selectedSupplier ? selectedSupplier.name : '-- Chọn nhà cung cấp --'}
              </span>
              <svg
                className={`ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform ${supplierPopupOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {supplierPopupOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSupplierPopupOpen(false)} />
                <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <div className="flex items-center border-b border-slate-100 px-3">
                    <Search size={16} className="shrink-0 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm nhà cung cấp..."
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                      className="w-full border-none px-2 py-2.5 text-sm outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredSuppliers.length === 0 ? (
                      <div className="px-3 py-6 text-center text-sm text-slate-400">
                        Không tìm thấy nhà cung cấp
                      </div>
                    ) : (
                      filteredSuppliers.map((sup) => (
                        <button
                          key={sup.id}
                          type="button"
                          onClick={() => {
                            onSelectSupplier(sup);
                            setSupplierPopupOpen(false);
                            setSupplierSearch('');
                          }}
                          className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-blue-50 ${selectedSupplier?.id === sup.id ? 'bg-blue-50 font-semibold text-[#004785]' : 'text-slate-700'}`}
                        >
                          <span className="truncate">{sup.name}</span>
                          <span className="ml-2 shrink-0 text-xs text-slate-400">
                            {sup.code || sup.phone || ''}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <Textarea
            label="Ghi chú / Lý do nhập kho"
            value={note}
            onChange={(e) => onChangeNote(e.target.value)}
            rows={3}
            placeholder="Ghi chú chi tiết đợt nhập hàng..."
          />

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Tổng số dòng:</span>
              <span className="font-bold text-slate-900">{totals.totalLines}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Tổng sản phẩm:</span>
              <span className="font-bold text-slate-900">
                {Number.isFinite(totals.totalQuantity) && totals.totalQuantity <= 999999999
                  ? totals.totalQuantity.toLocaleString('vi-VN')
                  : '---'}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
              <span>Tổng tiền:</span>
              <span
                className="max-w-[200px] truncate text-right text-green-600"
                title={formatCurrency(totals.totalAmount)}
              >
                {formatCurrency(totals.totalAmount)}
              </span>
            </div>
          </div>

          <div
            className={`flex items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-sm ${
              status.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : status.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-blue-200 bg-blue-50 text-blue-700'
            }`}
          >
            {status.type === 'error' ? (
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            ) : status.type === 'success' ? (
              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
            ) : (
              <Package size={18} className="mt-0.5 flex-shrink-0" />
            )}
            <span className="font-medium">{status.message}</span>
          </div>

          <div className="space-y-2 pt-1">
            <Button
              variant="success"
              onClick={() => onSubmit(false)}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              {isSubmitting ? 'ĐANG XỬ LÝ...' : 'HOÀN TẤT & CỘNG KHO'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onSubmit(true)}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-1.5"
            >
              <Clock size={16} className="text-amber-500" />
              Lưu nháp (Chờ kiểm kho duyệt sau)
            </Button>
          </div>
        </div>
      </aside>

      <Modal
        isOpen={typeManagerOpen}
        onClose={() => setTypeManagerOpen(false)}
        title="Quản lý loại phiếu nhập"
        size="md"
      >
        <div className="space-y-5">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                Tên loại phiếu
              </label>
              <input
                type="text"
                placeholder="VD: Nhập hàng trả góp..."
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Xử lý như</label>
              <select
                value={newTypeMap}
                onChange={(e) => setNewTypeMap(Number(e.target.value))}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
              >
                <option value={1}>Nhập mua</option>
                <option value={2}>Trả lại</option>
                <option value={3}>Cân bằng</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                const name = newTypeName.trim();
                if (!name) return;
                setCustomTypes((prev) => {
                  const next = [...prev, { value: newTypeMap, label: name }];
                  saveCustomTypes(next);
                  return next;
                });
                setNewTypeName('');
              }}
              className="flex h-[38px] items-center gap-1.5 rounded-lg bg-[#004785] px-4 text-sm font-semibold text-white hover:bg-black"
            >
              <Plus size={16} /> Thêm
            </button>
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Mặc định
            </div>
            {DEFAULT_TYPES.map((t) => (
              <div
                key={t.value}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5"
              >
                <span className="text-sm font-medium text-slate-700">{t.label}</span>
                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                  Hệ thống
                </span>
              </div>
            ))}
            {customTypes.length > 0 && (
              <div className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Tuỳ chỉnh
              </div>
            )}
            {customTypes.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">{t.label}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                    {t.value === 1 ? 'Nhập mua' : t.value === 2 ? 'Trả lại' : 'Cân bằng'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomTypes((prev) => {
                      const next = prev.filter((_, idx) => idx !== i);
                      saveCustomTypes(next);
                      return next;
                    });
                  }}
                  className="text-xs font-semibold text-red-400 hover:text-red-600"
                >
                  Xoá
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
};
