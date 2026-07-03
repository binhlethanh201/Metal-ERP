/**
 * ReturnDetail - Chi tiết phiếu đổi trả + actions
 * API: /pos/returns/:id - GET
 */
import { useState, useEffect } from 'react';
import { Card } from '../../../../shared/components/Card';
import { Badge } from '../../../../shared/components/Badge';
import { Button } from '../../../../shared/components/Button';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { getReturn, finalizeReturn } from '../../services/posService';

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

// Map API return detail
const mapReturnDetail = (r) => ({
  returnId: r.returnId || r.id,
  returnCode: r.returnCode || r.returnId || r.id,
  invoiceCode: r.invoiceCode || r.invoiceId || '',
  customerName: r.customerName || 'Khách lẻ',
  userName: r.userName || r.createdBy || '-',
  status: r.status || 'PENDING',
  reason: r.reason || '',
  notes: r.notes || '',
  totalRefund: parseFloat(r.totalRefund || r.refundAmount || 0),
  refundMethod: r.refundMethod || r.method || 'CASH',
  createdAt: r.createdAt || r.createdAt,
  returnItems: (r.returnItems || r.items || []).map((item) => ({
    returnItemId: item.returnItemId || item.id,
    productId: item.productId || item.id,
    productName: item.productName || 'Sản phẩm',
    productCode: item.productCode || '',
    quantity: parseFloat(item.quantity || 1),
    sellPrice: parseFloat(item.sellPrice || item.unitPrice || item.price || 0),
    refundAmount: parseFloat(item.refundAmount || 0),
  })),
});

const ReturnDetail = ({ returnId, onBack, onUpdated }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    if (!returnId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await getReturn(returnId);
        console.log('[ReturnDetail] API response:', raw);
        const data = raw?.data || raw;
        setDetail(mapReturnDetail(data));
      } catch (err) {
        setError(err.message || 'Không thể tải chi tiết');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [returnId]);

  const handleFinalize = async () => {
    if (!window.confirm('Xác nhận hoàn tiền cho phiếu đổi trả này?')) return;
    setFinalizing(true);
    try {
      await finalizeReturn(returnId);
      setDetail((prev) => ({ ...prev, status: 'COMPLETED' }));
      onUpdated?.();
    } catch (err) {
      alert('Không thể hoàn tiền: ' + (err.message || 'Lỗi'));
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#004785]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">{error}</p>
        <Button variant="secondary" className="mt-4" onClick={onBack}>
          Quay lại
        </Button>
      </div>
    );
  }

  if (!detail) return null;

  const statusCfg = STATUS_CONFIG[detail.status] || { label: detail.status, variant: 'secondary' };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
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
          Quay lại
        </button>
      </div>

      {/* Main info */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-mono text-lg font-bold text-[#004785]">{detail.returnCode}</h3>
              <p className="text-sm text-slate-500">
                {detail.createdAt ? new Date(detail.createdAt).toLocaleString('vi-VN') : '-'}
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

      {/* Items */}
      <Card header="Sản phẩm đổi trả">
        {detail.returnItems?.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {detail.returnItems.map((item, i) => (
              <div key={item.returnItemId || i} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-900">{item.productName}</p>
                  <p className="text-xs text-slate-500">
                    {item.productCode || '-'} · SL: {item.quantity} · Đơn giá:{' '}
                    {formatCurrency(item.sellPrice)}
                  </p>
                </div>
                <p className="font-semibold text-green-600">
                  {formatCurrency(item.refundAmount || item.quantity * item.sellPrice)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-slate-400">Không có sản phẩm</p>
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
        </div>
      )}
    </div>
  );
};

export default ReturnDetail;
