/**
 * ReturnDetail - Chi tiết phiếu đổi trả + actions
 * Hiển thị ngay dữ liệu từ danh sách, sau đó refresh từ API để có đầy đủ items
 */
import { useState, useEffect } from 'react';
import { Card } from '../../../../shared/components/Card';
import { Badge } from '../../../../shared/components/Badge';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { formatDateTime } from '../../../../shared/utils/formatDate';
import { getReturn, finalizeReturn, cancelReturn, getOrders } from '../../services/posService';

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ duyệt', variant: 'warning' },
  COMPLETED: { label: 'Hoàn tất', variant: 'success' },
  CANCELLED: { label: 'Đã hủy', variant: 'danger' },
};

const REFUND_METHOD_LABELS = {
  CASH: 'Tiền mặt',
  TRANSFER: 'Chuyển khoản',
  CARD: 'Thẻ',
};

const mapApiDetail = (r) => {
  if (!r) return null;
  const items = (r.returnItems || r.items || []).map((item) => ({
    returnItemId: item.returnItemId || item.id,
    productId: item.productId || item.id,
    _key: item.invoiceItemId || item.invoiceItem_id || item.lineItemId || item.id || item.productId,
    productName: item.productName || 'Sản phẩm',
    productCode: item.productCode || '',
    quantity: parseFloat(item.quantity || 1),
    sellPrice: parseFloat(item.sellPrice || item.unitPrice || item.price || 0),
    refundAmount: parseFloat(item.refundAmount || 0),
  }));

  return {
    returnId: r.returnOrderId || r.returnId || r.id,
    returnCode: r.returnCode || r.returnOrderId || r.returnId || r.id,
    invoiceCode: (() => {
      const raw =
        r.invoiceCode ||
        r.invoiceId ||
        r.invoice?.invoiceCode ||
        r.invoice?.invoiceId ||
        r.invoice?.code ||
        '';
      return raw
        .replace(/\s*\d{4}-\d{2}-\d{2}T[\d.:]+Z?/g, '')
        .replace(/T[\d.:]+Z?/g, '')
        .trim();
    })(),
    customerName: r.customerName || 'Khách lẻ',
    userName: r.userName || r.createdBy || '-',
    status: (r.status || 'PENDING').toUpperCase(),
    reason: r.reason || '',
    notes: r.notes || '',
    totalRefund: parseFloat(r.totalRefund || r.refundAmount || 0),
    refundMethod: (r.refundMethod || r.method || 'CASH').toUpperCase(),
    createdAt: r.createdAt || r.createdAt,
    returnItems: items.length > 0 ? items : r.returnItems || r.items || [],
  };
};

const ReturnDetail = ({ initialData, onBack, onUpdated }) => {
  const [detail, setDetail] = useState(() => mapApiDetail(initialData));
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [finalizing, setFinalizing] = useState(false);

  const returnId = initialData?.returnId || initialData?.id;

  useEffect(() => {
    if (!returnId) {
      setApiLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setApiLoading(true);
      setApiError(null);
      try {
        const raw = await getReturn(returnId);
        const data = raw?.data || raw;
        if (!cancelled) {
          const fresh = mapApiDetail(data);
          if (fresh) {
            // invoiceCode về null, dùng orderId tìm invoiceCode thực từ danh sách hóa đơn
            if (!fresh.invoiceCode && data.orderId) {
              try {
                const ordersData = await getOrders({ pageSize: 500 });
                const orders = Array.isArray(ordersData)
                  ? ordersData
                  : (ordersData?.items ?? ordersData?.data ?? []);
                const matched = orders.find(
                  (o) =>
                    (o.orderId || '').toLowerCase() === data.orderId.toLowerCase() ||
                    (o.id || '').toLowerCase() === data.orderId.toLowerCase() ||
                    (o.invoiceId || '').toLowerCase() === data.orderId.toLowerCase()
                );
                if (matched) {
                  const rawCode = matched.invoiceCode || matched.invoiceId || matched.id || '';
                  fresh.invoiceCode = rawCode
                    .replace(/\s*\d{4}-\d{2}-\d{2}T[\d.:]+Z?/g, '')
                    .replace(/T[\d.:]+Z?/g, '')
                    .trim();
                }
              } catch (_) {}
            }
            setDetail(fresh);
          }
        }
      } catch (err) {
        if (!cancelled) setApiError(err.message || 'Không thể tải chi tiết');
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [returnId]);

  const handleFinalize = async () => {
    if (!window.confirm('Xác nhận hoàn tiền cho phiếu đổi trả này?')) return;
    setFinalizing(true);
    try {
      await finalizeReturn(returnId);
      setDetail((prev) => (prev ? { ...prev, status: 'COMPLETED' } : prev));
      onUpdated?.();
    } catch (err) {
      alert('Không thể hoàn tiền: ' + (err.message || 'Lỗi'));
    } finally {
      setFinalizing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Xác nhận hủy phiếu đổi trả này?')) return;
    setFinalizing(true);
    try {
      await cancelReturn(returnId);
      // Xóa tracking trong localStorage để số lượng tồn được tính lại đúng
      try {
        const invCode = detail.invoiceCode;
        if (invCode && detail.returnItems?.length > 0) {
          const storageKey = 'pos_return_items_' + invCode;
          const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');
          let changed = false;
          detail.returnItems.forEach((item) => {
            const key = item._key || item.productId;
            if (key && existing[key]) {
              existing[key].qty = Math.max(0, (existing[key].qty || 0) - item.quantity);
              if (existing[key].qty <= 0) {
                delete existing[key];
              }
              changed = true;
            }
          });
          if (changed) {
            localStorage.setItem(storageKey, JSON.stringify(existing));
          }
        }
      } catch (_) {}
      setDetail((prev) => (prev ? { ...prev, status: 'CANCELLED' } : prev));
      onUpdated?.();
    } catch (err) {
      alert('Không thể hủy: ' + (err.message || 'Lỗi'));
    } finally {
      setFinalizing(false);
    }
  };

  if (!detail) {
    return (
      <div className="py-8 text-center">
        <p className="text-slate-400">Không có dữ liệu chi tiết</p>
        <Button variant="secondary" className="mt-4" onClick={onBack}>
          Quay lại
        </Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[detail.status] || { label: detail.status, variant: 'secondary' };
  const hasItems = Array.isArray(detail.returnItems) && detail.returnItems.length > 0;

  return (
    <div className="space-y-4">
      {/* Back + refresh indicator */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#004785]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay lại danh sách
        </button>
        {apiLoading && <span className="text-xs text-slate-400">Đang tải chi tiết...</span>}
        {apiError && (
          <span className="text-xs text-amber-500">Không đồng bộ được dữ liệu mới nhất</span>
        )}
      </div>

      {/* Main info card */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-mono text-lg font-bold text-[#004785]">{detail.returnCode}</h3>
              <p className="text-sm text-slate-500">
                {detail.createdAt ? formatDateTime(detail.createdAt) : '-'}
              </p>
            </div>
            <Badge variant={statusCfg.variant} size="lg">
              {statusCfg.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Khách hàng</p>
              <p className="mt-1 font-semibold">{detail.customerName}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Hóa đơn gốc
              </p>
              <p className="mt-1 font-mono text-sm font-semibold">{detail.invoiceCode || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Người tạo</p>
              <p className="mt-1 font-semibold">{detail.userName}</p>
            </div>
          </div>

          {detail.reason && (
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                Lý do đổi trả
              </p>
              <p className="mt-1 text-sm text-amber-800">{detail.reason}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Items card */}
      <Card header="Sản phẩm đổi trả">
        {hasItems ? (
          <div className="divide-y divide-slate-100">
            {detail.returnItems.map((item, i) => (
              <div key={item.returnItemId || i} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-900">{item.productName}</p>
                  <p className="text-xs text-slate-400">Số lượng: {item.quantity}</p>
                </div>
                <p className="font-semibold text-green-600">
                  {formatCurrency(item.refundAmount || item.quantity * item.sellPrice)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-slate-400">
            {apiLoading ? 'Đang tải danh sách sản phẩm...' : 'Không có sản phẩm'}
          </p>
        )}

        <div className="mt-4 border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Tổng tiền hoàn
                </p>
                <p className="text-2xl font-extrabold text-green-600">
                  {formatCurrency(detail.totalRefund)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Phương thức
                </p>
                <p className="mt-1 font-semibold">
                  {REFUND_METHOD_LABELS[detail.refundMethod] || detail.refundMethod}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      {detail.status === 'PENDING' && (
        <div className="flex gap-3">
          <Button variant="success" onClick={handleFinalize} loading={finalizing}>
            Hoàn tiền
          </Button>
          <Button variant="outline" className="text-red-500 hover:bg-red-50" onClick={handleCancel}>
            Hủy phiếu
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReturnDetail;
