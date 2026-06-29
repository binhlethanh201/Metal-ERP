/**
 * ReturnOrderPage - Trang Đổi trả hàng POS.
 * Luồng: Tra hóa đơn → Chọn sản phẩm & số lượng → Chọn phương thức hoàn → Xác nhận.
 * TODO (FE): Kết nối API khi BE sẵn sàng — hiện chạy với MOCK DATA local.
 */
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import Icon from '../../../shared/components/Icon';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

const REASONS = [
  { value: 'DEFECTIVE', label: 'Hàng lỗi / Hư hỏng' },
  { value: 'WRONG_ITEM', label: 'Giao sai sản phẩm' },
  { value: 'NOT_SATISFIED', label: 'Không hài lòng' },
  { value: 'OTHER', label: 'Khác' },
];

const REFUND_METHODS = [
  { value: 'CASH', label: 'Tiền mặt', icon: 'payments' },
  { value: 'TRANSFER', label: 'Chuyển khoản', icon: 'account_balance' },
  { value: 'EXCHANGE', label: 'Đổi hàng', icon: 'swap_horiz' },
];

// ── MOCK DATA ──────────────────────────────────────────────────
const MOCK_INVOICES = {
  'HD-001': {
    invoiceId: 'HD-001',
    invoiceCode: 'HD-001',
    customerName: 'Nguyễn Văn A',
    staffName: 'Thu ngân A',
    createdAt: '2026-06-27T10:00:00Z',
    total: 1500000,
    items: [
      { productId: 'P001', productName: 'Ống PVC 34mm', productCode: 'ONG-PVC-34', unitPrice: 250000, quantity: 3 },
      { productId: 'P002', productName: 'Bulong M10', productCode: 'BLT-M10', unitPrice: 15000, quantity: 20 },
      { productId: 'P003', productName: 'Tắc kê 8mm', productCode: 'TAC-KE-8', unitPrice: 5000, quantity: 100 },
    ],
  },
  'HD-002': {
    invoiceId: 'HD-002',
    invoiceCode: 'HD-002',
    customerName: 'Trần Thị B',
    staffName: 'Thu ngân B',
    createdAt: '2026-06-28T14:00:00Z',
    total: 800000,
    items: [
      { productId: 'P004', productName: 'Ống nước PPR 20', productCode: 'ONG-PPR-20', unitPrice: 80000, quantity: 10 },
    ],
  },
};

const MOCK_RETURN_HISTORY = [
  {
    returnOrderId: '1',
    returnCode: 'RET-20240629-0001',
    customerName: 'Nguyễn Văn A',
    refundAmount: 500000,
    status: 'Completed',
    createdAt: '2026-06-29T10:00:00Z',
  },
  {
    returnOrderId: '2',
    returnCode: 'RET-20240629-0002',
    customerName: 'Trần Thị B',
    refundAmount: 200000,
    status: 'Pending',
    createdAt: '2026-06-29T14:00:00Z',
  },
];

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ReturnItemRow = ({ item, onRemove, onQtyChange, onReasonChange }) => (
  <tr className="border-b border-slate-100 text-sm">
    <td className="px-3 py-2">
      <p className="font-semibold text-slate-900">{item.productName}</p>
      <p className="text-xs text-slate-400">{item.productCode}</p>
    </td>
    <td className="px-3 py-2 text-right font-semibold text-slate-900">
      {formatCurrency(item.unitPrice)}
    </td>
    <td className="px-3 py-2 text-center text-slate-500">{item.quantity}</td>
    <td className="px-3 py-2">
      <input
        type="number"
        min={1}
        max={item.quantity}
        value={item.returnQty}
        onChange={(e) =>
          onQtyChange(item.productId, Math.min(item.quantity, Math.max(1, +e.target.value)))
        }
        className="w-16 rounded border border-slate-200 px-2 py-1 text-center text-sm outline-none focus:border-[#004785] focus:ring-1 focus:ring-[#004785]"
      />
    </td>
    <td className="px-3 py-2">
      <select
        value={item.reason}
        onChange={(e) => onReasonChange(item.productId, e.target.value)}
        className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#004785] focus:ring-1 focus:ring-[#004785]"
      >
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </td>
    <td className="px-3 py-2 text-right font-bold text-[#004785]">
      {formatCurrency(item.refundLine)}
    </td>
    <td className="px-3 py-2 text-center">
      <button
        onClick={() => onRemove(item.productId)}
        className="text-slate-400 hover:text-red-600 active:scale-95"
      >
        <Icon name="close" size={16} />
      </button>
    </td>
  </tr>
);

function ReturnHistoryCard() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-4">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-bold text-slate-500"
      >
        <span className="uppercase tracking-widest">Phiếu đổi trả gần đây</span>
        <Icon name={expanded ? 'expand_more' : 'chevron_right'} size={16} />
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {MOCK_RETURN_HISTORY.length === 0 ? (
            <p className="py-2 text-center text-xs text-slate-400">Chưa có phiếu đổi trả nào.</p>
          ) : (
            MOCK_RETURN_HISTORY.map((r) => (
              <div key={r.returnOrderId} className="rounded-lg border border-slate-100 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{r.returnCode}</span>
                  <Badge
                    variant={
                      r.status === 'Completed'
                        ? 'success'
                        : r.status === 'Cancelled'
                          ? 'danger'
                          : 'warning'
                    }
                    className="text-[10px]"
                  >
                    {r.status}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{formatDate(r.createdAt)}</span>
                  <span className="font-semibold text-[#004785]">
                    {formatCurrency(r.refundAmount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
}

export default function ReturnOrderPage() {
  const { showNotice } = useOutletContext();

  const [invoiceKeyword, setInvoiceKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');

  const [originalInvoice, setOriginalInvoice] = useState(null);

  const [returnCode, setReturnCode] = useState('');
  const [returnFinalized, setReturnFinalized] = useState(false);
  const [returnItems, setReturnItems] = useState([]);
  const [refundMethod, setRefundMethod] = useState('CASH');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ── Tra hóa đơn (TODO: thay bằng API call) ─────────────────
  const handleSearchInvoice = async () => {
    if (!invoiceKeyword.trim()) return;
    setSearching(true);
    setInvoiceError('');
    setOriginalInvoice(null);
    setReturnItems([]);
    setReturnCode('');
    setReturnFinalized(false);

    await new Promise((r) => setTimeout(r, 300)); // giả lập delay
    const found = MOCK_INVOICES[invoiceKeyword.trim().toUpperCase()];
    if (found) {
      setOriginalInvoice(found);
    } else {
      setInvoiceError(
        'Không tìm thấy hóa đơn. Thử: HD-001 hoặc HD-002 (mock data). TODO: kết nối API thực tế.'
      );
    }
    setSearching(false);
  };

  const handleSelectItem = (item) => {
    if (returnItems.find((ri) => ri.productId === item.productId)) return;
    setReturnItems((prev) => [
      ...prev,
      { ...item, returnQty: 1, reason: 'DEFECTIVE', refundLine: item.unitPrice },
    ]);
  };

  const handleRemoveItem = (productId) => {
    setReturnItems((prev) => prev.filter((ri) => ri.productId !== productId));
  };

  const handleQtyChange = (productId, qty) => {
    setReturnItems((prev) =>
      prev.map((ri) =>
        ri.productId === productId ? { ...ri, returnQty: qty, refundLine: qty * ri.unitPrice } : ri
      )
    );
  };

  const handleReasonChange = (productId, reason) => {
    setReturnItems((prev) =>
      prev.map((ri) => (ri.productId === productId ? { ...ri, reason } : ri))
    );
  };

  const totalRefund = returnItems.reduce((s, ri) => s + (ri.refundLine || 0), 0);

  // ── Tạo phiếu đổi trả (TODO: thay bằng API call) ──────────
  const handleStartReturn = async () => {
    if (!originalInvoice || returnItems.length === 0) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400)); // giả lập delay
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const code = `RET-${dateStr}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setReturnCode(code);
    showNotice('Đã tạo phiếu đổi trả. Vui lòng xác nhận hoàn tất.', 'success');
    setSaving(false);
  };

  // ── Xác nhận hoàn tất (TODO: thay bằng API call) ───────────
  const handleFinalize = async () => {
    if (!returnCode) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400)); // giả lập delay
    showNotice('Đổi trả thành công! Đã hoàn kho và tạo phiếu hoàn tiền.', 'success');
    setReturnFinalized(true);
    setReturnCode('');
    setReturnItems([]);
    setOriginalInvoice(null);
    setNote('');
    setInvoiceKeyword('');
    setSaving(false);
  };

  // ── Hủy phiếu (TODO: thay bằng API call) ──────────────────
  const handleCancelReturn = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300)); // giả lập delay
    showNotice('Đã hủy phiếu đổi trả.', 'warning');
    setShowCancelModal(false);
    setReturnCode('');
    setReturnItems([]);
    setOriginalInvoice(null);
    setNote('');
    setInvoiceKeyword('');
    setSaving(false);
  };

  const handleReset = () => {
    setOriginalInvoice(null);
    setReturnCode('');
    setReturnFinalized(false);
    setReturnItems([]);
    setInvoiceKeyword('');
    setNote('');
    setInvoiceError('');
  };

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Icon name="assignment_return" className="text-[#004785]" size={28} />
        <div>
          <h1 className="text-xl font-black text-slate-900">Đổi trả hàng</h1>
          <p className="text-xs text-slate-500">
            BR-80: Đổi trả trong 30 ngày · BR-81: Yêu cầu hóa đơn gốc
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Step 1: Search invoice */}
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">
              Bước 1 — Tra hóa đơn gốc
            </h3>
            {!originalInvoice ? (
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Nhập mã hóa đơn (VD: HD-001, HD-002)..."
                    value={invoiceKeyword}
                    onChange={(e) => setInvoiceKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchInvoice()}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleSearchInvoice}
                  loading={searching}
                  icon={<Icon name="search" size={16} />}
                >
                  Tra
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Icon name="check_circle" className="text-green-600" size={18} />
                    <span className="font-bold text-green-800">{originalInvoice.invoiceCode}</span>
                    <Badge variant="success" className="text-xs">
                      Hóa đơn hợp lệ
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-green-700">
                    Khách: <strong>{originalInvoice.customerName}</strong> · Ngày:{' '}
                    <strong>{formatDate(originalInvoice.createdAt)}</strong> · NV:{' '}
                    <strong>{originalInvoice.staffName}</strong>
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleReset}
                  icon={<Icon name="close" size={14} />}
                >
                  Bỏ chọn
                </Button>
              </div>
            )}
            {invoiceError && (
              <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                <Icon name="error" size={14} /> {invoiceError}
              </p>
            )}
          </Card>

          {/* Step 2: Original invoice items */}
          {originalInvoice && (
            <Card className="p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">
                Sản phẩm có thể đổi trả
              </h3>
              <div className="custom-scrollbar max-h-64 overflow-y-auto">
                {originalInvoice.items.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">Không có sản phẩm</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="px-3 py-2 text-left font-semibold">Sản phẩm</th>
                        <th className="px-3 py-2 text-right font-semibold">Đơn giá</th>
                        <th className="px-3 py-2 text-center font-semibold">Đã mua</th>
                        <th className="px-3 py-2 text-center font-semibold">Đã trả</th>
                        <th className="px-3 py-2 text-center font-semibold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {originalInvoice.items.map((item) => {
                        const inReturn = returnItems.find((ri) => ri.productId === item.productId);
                        return (
                          <tr
                            key={item.productId}
                            className={`border-b border-slate-50 ${inReturn ? 'bg-slate-100 opacity-60' : ''}`}
                          >
                            <td className="px-3 py-2">
                              <p className="font-semibold text-slate-800">{item.productName}</p>
                              <p className="text-slate-400">{item.productCode}</p>
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-slate-800">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-3 py-2 text-center font-bold text-slate-600">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-2 text-center text-slate-500">
                              {inReturn ? `−${inReturn.returnQty}` : '0'}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <Button
                                variant={inReturn ? 'secondary' : 'primary'}
                                size="sm"
                                onClick={() =>
                                  inReturn
                                    ? handleRemoveItem(item.productId)
                                    : handleSelectItem(item)
                                }
                              >
                                {inReturn ? 'Bỏ chọn' : 'Chọn'}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          )}

          {/* Step 3: Return items */}
          {returnItems.length > 0 && (
            <Card className="p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">
                Bước 2 — Danh sách đổi trả
              </h3>
              <div className="custom-scrollbar max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="px-3 py-2 text-left font-semibold">Sản phẩm</th>
                      <th className="px-3 py-2 text-right font-semibold">Đơn giá</th>
                      <th className="px-3 py-2 text-center font-semibold">Mua</th>
                      <th className="px-3 py-2 text-center font-semibold">SL trả</th>
                      <th className="px-3 py-2 text-left font-semibold">Lý do</th>
                      <th className="px-3 py-2 text-right font-semibold">Thành tiền</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {returnItems.map((item) => (
                      <ReturnItemRow
                        key={item.productId}
                        item={item}
                        onRemove={handleRemoveItem}
                        onQtyChange={handleQtyChange}
                        onReasonChange={handleReasonChange}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Right column: summary + actions */}
        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">
              {returnCode ? 'Xác nhận đổi trả' : 'Thông tin hoàn tiền'}
            </h3>

            {returnCode && (
              <div className="mb-3 rounded-lg bg-blue-50 p-3 text-center">
                <p className="text-xs text-slate-500">Mã phiếu đổi trả</p>
                <p className="font-black text-[#004785]">{returnCode}</p>
              </div>
            )}

            {!returnCode && (
              <>
                <p className="mb-2 text-xs font-semibold text-slate-500">Phương thức hoàn</p>
                <div className="mb-4 flex flex-col gap-2">
                  {REFUND_METHODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setRefundMethod(m.value)}
                      className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all active:scale-95 ${
                        refundMethod === m.value
                          ? 'border-[#004785] bg-blue-50 text-[#004785]'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Icon name={m.icon} size={16} />
                      {m.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="mb-4">
              <label className="mb-1 block text-xs font-semibold text-slate-500">Ghi chú</label>
              <textarea
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#004785] focus:ring-1 focus:ring-[#004785]"
                placeholder="VD: Khách không hài lòng với chất lượng..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="mb-4 rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Số sản phẩm</span>
                <span className="font-semibold text-slate-800">{returnItems.length}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-sm font-bold text-slate-900">Số tiền hoàn</span>
                <span className="text-lg font-black text-[#004785]">
                  {formatCurrency(totalRefund)}
                </span>
              </div>
            </div>

            {!returnCode ? (
              <Button
                variant="primary"
                className="w-full"
                onClick={handleStartReturn}
                loading={saving}
                disabled={returnItems.length === 0}
                icon={<Icon name="assignment_return" size={16} />}
              >
                Tạo phiếu đổi trả
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleFinalize}
                  loading={saving}
                  icon={<Icon name="check_circle" size={16} />}
                >
                  Xác nhận hoàn tất
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowCancelModal(true)}
                  icon={<Icon name="close" size={16} />}
                >
                  Hủy phiếu
                </Button>
              </div>
            )}
          </Card>

          <ReturnHistoryCard />
        </div>
      </div>

      {/* Cancel confirm modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Hủy phiếu đổi trả?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
              Không
            </Button>
            <Button variant="danger" onClick={handleCancelReturn} loading={saving}>
              Xác nhận hủy
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Phiếu đổi trả <strong>{returnCode}</strong> sẽ bị hủy. Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
}
