/**
 * ReturnForm - Form tạo đơn đổi trả
 * Flow: nhập mã hóa đơn → tìm hóa đơn → chọn sản phẩm → tạo
 */
import { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Input } from '../../../../shared/components/Input';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { getOrders, createReturn, addReturnItem } from '../../services/posService';

const REFUND_METHODS = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'TRANSFER', label: 'Chuyển khoản' },
];

const ReturnForm = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [invoiceCode, setInvoiceCode] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [reason, setReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const totalRefund = selectedProducts.reduce((sum, p) => sum + p.quantity * (p.sellPrice || 0), 0);

  const reset = () => {
    setStep(1);
    setInvoiceCode('');
    setInvoice(null);
    setInvoiceLoading(false);
    setInvoiceError('');
    setSelectedProducts([]);
    setReason('');
    setRefundMethod('CASH');
    setNotes('');
    setSubmitting(false);
    setSubmitError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFindInvoice = async () => {
    if (!invoiceCode.trim()) {
      setInvoiceError('Vui lòng nhập mã hóa đơn');
      return;
    }
    setInvoiceLoading(true);
    setInvoiceError('');
    try {
      // Tìm hóa đơn trong danh sách orders đã hoàn thành
      const ordersData = await getOrders({ status: 'Completed', pageSize: 100 });
      console.log('[ReturnForm] orders search:', ordersData);
      const orders = Array.isArray(ordersData)
        ? ordersData
        : (ordersData?.items ?? ordersData?.data ?? []);
      const kw = invoiceCode.trim().toLowerCase();

      // Tìm theo invoiceCode hoặc invoiceId
      const found = orders.find(
        (o) =>
          (o.invoiceCode || '').toLowerCase() === kw ||
          (o.invoiceId || '').toLowerCase() === kw ||
          (o.id || '').toLowerCase() === kw
      );

      if (found) {
        setInvoice(found);
        setStep(2);
      } else {
        setInvoiceError('Không tìm thấy hóa đơn: ' + invoiceCode);
      }
    } catch (err) {
      setInvoiceError('Lỗi tìm hóa đơn: ' + (err.message || 'Không xác định'));
    } finally {
      setInvoiceLoading(false);
    }
  };

  const toggleProduct = (product) => {
    setSelectedProducts((prev) => {
      const idx = prev.findIndex((p) => p.productId === product.productId);
      if (idx >= 0) {
        return prev.filter((p) => p.productId !== product.productId);
      }
      return [
        ...prev,
        {
          productId: product.productId,
          productName: product.productName || product.name,
          productCode: product.productCode,
          quantity: 1,
          sellPrice: product.unitPrice || product.retailPrice || 0,
          maxQty: product.quantity || 99,
        },
      ];
    });
  };

  const updateQty = (productId, qty) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, quantity: Math.max(1, Math.min(qty, p.maxQty)) } : p
      )
    );
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      setSubmitError('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }
    if (!reason.trim()) {
      setSubmitError('Vui lòng nhập lý do đổi trả');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      // 1. Tạo phiếu đổi trả
      const retData = await createReturn({
        invoiceId: invoice.invoiceId || invoice.id,
        reason: reason.trim(),
        refundMethod: refundMethod,
      });
      const returnId = retData.returnId || retData.return?.returnId || retData.id;

      // 2. Thêm từng sản phẩm
      await Promise.all(
        selectedProducts.map((p) =>
          addReturnItem(returnId, {
            productId: p.productId,
            quantity: p.quantity,
            condition: 'Cũ',
          })
        )
      );

      onSuccess?.();
      handleClose();
    } catch (err) {
      setSubmitError('Không thể tạo phiếu đổi trả: ' + (err.message || 'Lỗi'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo đơn đổi trả"
      size="2xl"
      footer={
        step === 1 ? (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleFindInvoice}
              loading={invoiceLoading}
              disabled={!invoiceCode.trim()}
            >
              Tìm hóa đơn
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setStep(1)}>
              Quay lại
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              Tạo đơn đổi trả
            </Button>
          </>
        )
      }
    >
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mã hóa đơn gốc <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nhập mã hóa đơn (VD: INV-2026-0072)"
              value={invoiceCode}
              onChange={(e) => {
                setInvoiceCode(e.target.value);
                setInvoiceError('');
              }}
              error={invoiceError}
            />
          </div>
          {invoiceError && <p className="text-sm text-red-500">{invoiceError}</p>}
        </div>
      )}

      {step === 2 && invoice && (
        <div className="space-y-4">
          {/* Invoice info */}
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Mã hóa đơn</p>
                <p className="mt-0.5 font-mono text-sm font-semibold">
                  {invoice.invoiceCode || invoice.invoiceId}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Khách hàng</p>
                <p className="mt-0.5 font-semibold">{invoice.customerName || 'Khách lẻ'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Ngày mua</p>
                <p className="mt-0.5 text-sm">
                  {invoice.createdAt
                    ? new Date(invoice.createdAt).toLocaleDateString('vi-VN')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Tổng tiền</p>
                <p className="mt-0.5 font-semibold text-green-600">
                  {formatCurrency(invoice.totalAmount || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Product selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Sản phẩm có thể đổi trả
            </label>
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {(invoice.items || []).map((item) => {
                const selected = selectedProducts.find((p) => p.productId === item.productId);
                return (
                  <div
                    key={item.invoiceItemId || item.productId}
                    className={`flex items-center gap-3 p-3 ${selected ? 'bg-blue-50' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selected}
                      onChange={() => toggleProduct(item)}
                      className="h-4 w-4 rounded border-slate-300 text-[#004785]"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName || item.productId}</p>
                      <p className="text-xs text-slate-500">
                        {item.productCode || '-'} · Đơn giá: {formatCurrency(item.unitPrice || 0)}
                      </p>
                    </div>
                    {selected && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, (selected.quantity || 1) - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-sm font-bold hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {selected.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, (selected.quantity || 1) + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-sm font-bold hover:bg-slate-100"
                        >
                          +
                        </button>
                        <span className="text-xs text-slate-400">/ {item.quantity}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {(!invoice.items || invoice.items.length === 0) && (
                <p className="p-4 text-center text-sm text-slate-400">Hóa đơn không có sản phẩm</p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Lý do đổi trả <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="VD: Sản phẩm bị lỗi, khách không hài lòng..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
            />
          </div>

          {/* Refund */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Phương thức hoàn tiền
              </label>
              <select
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
              >
                {REFUND_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Số tiền hoàn</label>
              <div className="flex items-center rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                <span className="text-lg font-bold text-green-700">
                  {formatCurrency(totalRefund)}
                </span>
              </div>
            </div>
          </div>

          {submitError && <p className="text-sm text-red-500">{submitError}</p>}
        </div>
      )}
    </Modal>
  );
};

export default ReturnForm;
