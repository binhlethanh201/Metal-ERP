/**
 * ReturnForm - Tạo đơn đổi trả
 * Flow: nhập mã hóa đơn → tìm hóa đơn → chọn sản phẩm → chọn loại + lý do → tạo
 */
import { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Input } from '../../../../shared/components/Input';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { getOrders, getReturns, createReturn, addReturnItem } from '../../services/posService';

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
  const [returnType, setReturnType] = useState('RETURN');
  const [reason, setReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isExchange = returnType === 'EXCHANGE';
  const totalRefund = selectedProducts.reduce((sum, p) => sum + p.quantity * (p.sellPrice || 0), 0);

  const reset = () => {
    setStep(1);
    setInvoiceCode('');
    setInvoice(null);
    setInvoiceLoading(false);
    setInvoiceError('');
    setSelectedProducts([]);
    setReturnType('RETURN');
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
      const ordersData = await getOrders({ status: 'Completed', pageSize: 200 });
      const orders = Array.isArray(ordersData)
        ? ordersData
        : (ordersData?.items ?? ordersData?.data ?? []);
      const kw = invoiceCode.trim().toLowerCase();

      const found = orders.find(
        (o) =>
          (o.invoiceCode || '').toLowerCase() === kw ||
          (o.invoiceId || '').toLowerCase() === kw ||
          (o.id || '').toLowerCase() === kw
      );

      if (found) {
        // Kiểm tra sản phẩm đã đổi trả từ các phiếu trước
        const invId = found.invoiceId || found.invoiceCode || found.id;
        const orderId = found.orderId || found.order_id || '';
        console.log(
          '[ReturnForm] Found invoice, invId:',
          invId,
          'orderId:',
          orderId,
          'Full invoice keys:',
          Object.keys(found)
        );
        let returnedMap = {};
        try {
          const returnsData = await getReturns({});
          console.log('[ReturnForm] getReturns raw:', returnsData);
          const allReturns = Array.isArray(returnsData)
            ? returnsData
            : (returnsData?.items ?? returnsData?.data ?? []);
          console.log('[ReturnForm] All returns count:', allReturns.length);
          if (allReturns.length > 0) {
            console.log('[ReturnForm] First return keys:', Object.keys(allReturns[0]));
            console.log(
              '[ReturnForm] First return sample:',
              JSON.stringify(allReturns[0], null, 2)
            );
          }
          // Lọc các phiếu đổi trả không bị hủy của hóa đơn này
          const relatedReturns = allReturns.filter((r) => {
            const rStatus = String(r.status || '').toUpperCase();
            // Match bằng orderId (chính xác nhất) hoặc invoiceCode
            const match =
              rStatus !== 'CANCELLED' &&
              ((r.orderId && r.orderId.toLowerCase() === orderId.toLowerCase()) ||
                (r.invoiceCode && r.invoiceCode.toLowerCase() === invId.toLowerCase()) ||
                (r.orderId && r.orderId.toLowerCase() === invId.toLowerCase()));
            if (match)
              console.log('[ReturnForm] Matched return:', r.returnCode, 'items:', r.items?.length);
            return match;
          });
          console.log('[ReturnForm] Related returns:', relatedReturns.length);
          relatedReturns.forEach((ret) => {
            const items = ret.items || ret.returnItems || [];
            items.forEach((item) => {
              const pid = item.productId || item.id;
              const qty = parseFloat(item.quantity || 0);
              returnedMap[pid] = (returnedMap[pid] || 0) + qty;
            });
          });
          console.log('[ReturnForm] Returned map:', returnedMap);
        } catch (err) {
          console.error('[ReturnForm] getReturns failed:', err);
        }

        // Tính số lượng còn lại có thể đổi trả cho từng sản phẩm
        const invoiceItems = found.items || [];
        const enrichedItems = invoiceItems.map((item) => {
          const pid = item.productId || item.id;
          const originalQty = parseFloat(item.quantity || 0);
          const returnedQty = returnedMap[pid] || 0;
          const remainingQty = Math.max(0, originalQty - returnedQty);
          return { ...item, _remainingQty: remainingQty, _returnedQty: returnedQty };
        });

        const availableItems = enrichedItems.filter((item) => item._remainingQty > 0);

        if (availableItems.length === 0) {
          setInvoiceError(
            'Tất cả sản phẩm trong hóa đơn này đã được đổi trả hết. Không thể tạo thêm phiếu.'
          );
          setInvoiceLoading(false);
          return;
        }

        setInvoice({ ...found, items: enrichedItems });
        setStep(2);
      } else {
        setInvoiceError(
          `Không tìm thấy hóa đơn "${invoiceCode}". Kiểm tra lại mã hoặc trạng thái đơn.`
        );
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
      const remainingQty = product._remainingQty ?? parseFloat(product.quantity || 0);
      return [
        ...prev,
        {
          productId: product.productId,
          productName: product.productName || product.name,
          productCode: product.productCode || '',
          quantity: 1,
          sellPrice: product.unitPrice || product.retailPrice || 0,
          maxQty: remainingQty,
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
      setSubmitError('Vui lòng chọn ít nhất một sản phẩm để đổi trả');
      return;
    }
    if (!reason.trim()) {
      setSubmitError('Vui lòng nhập lý do đổi trả');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const invId = invoice.invoiceId || invoice.invoiceCode || invoice.id;
      const payload = {
        invoiceId: invId,
        returnType: returnType,
        reason: reason.trim(),
        ...(returnType === 'RETURN' && { refundMethod: refundMethod }),
      };
      if (notes.trim()) {
        payload.notes = notes.trim();
      }
      payload.items = selectedProducts.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
      }));

      console.log('[ReturnForm] Payload:', payload);
      const retData = await createReturn(payload);
      console.log('[ReturnForm] Response:', retData);
      const returnId =
        retData.returnOrderId || retData.returnId || retData.return?.returnId || retData.id;

      // Nếu backend không nhận items inline thì gọi thêm API addReturnItem
      if (!retData.returnItems || retData.returnItems.length === 0) {
        await Promise.all(
          selectedProducts.map((p) =>
            addReturnItem(returnId, {
              productId: p.productId,
              quantity: p.quantity,
            })
          )
        );
      }

      onSuccess?.(retData);
      handleClose();
    } catch (err) {
      console.error('[ReturnForm] Full error:', err);
      console.error('[ReturnForm] Error data:', err.data);
      const detail = err?.data?.errors
        ? Object.values(err.data.errors).flat().join(', ')
        : err?.data?.title || err?.message || 'Lỗi';
      setSubmitError('Không thể tạo phiếu đổi trả: ' + detail);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-6 flex items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 1 ? 'bg-[#004785] text-white' : 'bg-green-500 text-white'}`}
      >
        {step === 1 ? '1' : '✓'}
      </div>
      <div className={`h-0.5 w-12 ${step === 2 ? 'bg-green-500' : 'bg-slate-200'}`} />
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 2 ? 'bg-[#004785] text-white' : 'bg-slate-200 text-slate-500'}`}
      >
        2
      </div>
      <span className="ml-2 text-sm text-slate-500">
        {step === 1 ? 'Tìm hóa đơn gốc' : 'Chọn sản phẩm & lý do'}
      </span>
    </div>
  );

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
              {isExchange ? 'Tạo đơn đổi hàng' : 'Tạo đơn trả hàng'}
            </Button>
          </>
        )
      }
    >
      {renderStepIndicator()}

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
              onKeyDown={(e) => e.key === 'Enter' && handleFindInvoice()}
            />
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            Nhập mã hóa đơn đã hoàn thành để tạo yêu cầu đổi/trả hàng. Hệ thống sẽ kiểm tra hóa đơn
            và hiển thị danh sách sản phẩm có thể đổi trả.
          </div>
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

          {/* Return type selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Loại yêu cầu <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReturnType('RETURN')}
                className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                  returnType === 'RETURN'
                    ? 'border-[#004785] bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    returnType === 'RETURN'
                      ? 'bg-[#004785] text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 15v-1a4 4 0 00-8 0v1m0 0h8m-8 0a4 4 0 01-4-4V8a4 4 0 014-4h8a4 4 0 014 4v3a4 4 0 01-4 4m-8 0a4 4 0 004 4h.5M9 19l-1.5 1.5M9 19l1.5-1.5"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">Trả hàng</p>
                  <p className="text-xs text-slate-500">Hoàn tiền cho khách</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setReturnType('EXCHANGE')}
                className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                  returnType === 'EXCHANGE'
                    ? 'border-[#004785] bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    returnType === 'EXCHANGE'
                      ? 'bg-[#004785] text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">Đổi hàng</p>
                  <p className="text-xs text-slate-500">Đổi sản phẩm cùng loại, không hoàn tiền</p>
                </div>
              </button>
            </div>
          </div>

          {/* Product selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Sản phẩm đổi trả <span className="text-red-500">*</span>
            </label>
            <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
              {(invoice.items || []).map((item) => {
                const selected = selectedProducts.find((p) => p.productId === item.productId);
                const remainingQty = item._remainingQty ?? parseFloat(item.quantity || 0);
                const returnedQty = item._returnedQty || 0;

                // Ẩn sản phẩm đã đổi trả hết
                if (remainingQty <= 0 && !selected) return null;

                return (
                  <div
                    key={item.invoiceItemId || item.productId}
                    className={`flex items-center gap-3 p-3 transition-colors ${selected ? 'bg-blue-50' : remainingQty <= 0 ? 'bg-slate-50 opacity-50' : 'hover:bg-slate-50'}`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selected}
                      disabled={remainingQty <= 0}
                      onChange={() => toggleProduct({ ...item, quantity: remainingQty })}
                      className="h-4 w-4 rounded border-slate-300 text-[#004785]"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName || item.productId}</p>
                      <p className="text-xs text-slate-500">
                        {item.productCode || '-'}
                        {isExchange ? '' : ` · Đơn giá: ${formatCurrency(item.unitPrice || 0)}`} ·
                        Đã mua: {item.quantity}
                      </p>
                      {returnedQty > 0 && (
                        <p className="text-xs text-amber-600">
                          Đã đổi trả: {returnedQty} · Còn lại:{' '}
                          <span className="font-semibold">{remainingQty}</span>
                        </p>
                      )}
                    </div>
                    {selected && remainingQty > 0 && (
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
                        <span className="text-xs text-slate-400">/ {remainingQty}</span>
                      </div>
                    )}
                    {remainingQty <= 0 && (
                      <span className="text-xs font-medium text-red-500">Đã đổi trả hết</span>
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
              placeholder="VD: Sản phẩm bị lỗi kỹ thuật, khách không hài lòng, sai quy cách..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
            />
          </div>

          {/* Refund method + amount — chỉ hiển thị khi trả hàng */}
          {!isExchange && (
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
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Số tiền hoàn dự kiến
                </label>
                <div className="flex items-center rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <span className="text-lg font-bold text-green-700">
                    {formatCurrency(totalRefund)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Exchange note */}
          {isExchange && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                <div>
                  <p className="text-sm font-bold text-blue-800">Đổi hàng — không hoàn tiền</p>
                  <p className="mt-1 text-xs text-blue-600">
                    Khách hàng sẽ đổi sản phẩm cùng loại, cùng mẫu mã. Phiếu này ghi nhận việc đổi
                    trả, không phát sinh hoàn tiền.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
            <textarea
              rows={2}
              placeholder="Ghi chú thêm (không bắt buộc)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
            />
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {submitError}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ReturnForm;
