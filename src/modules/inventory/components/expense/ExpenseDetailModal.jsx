import React, { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Badge } from '../../../../shared/components/Badge';
import { Textarea } from '../../../../shared/components/Textarea';
import { CheckCircle2, Clock, XCircle, RefreshCw, Check, Ban } from 'lucide-react';
import { getExpenseDetail } from '../../services/expenseService';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDateTime = (value) => (value ? new Date(value).toLocaleString('vi-VN') : '---');

const renderStatusBadge = (val) => {
  switch (val) {
    case 'PENDING':
      return (
        <Badge variant="warning" size="sm" className="inline-flex items-center gap-1">
          <Clock size={12} className="animate-pulse" /> CHỜ XÁC NHẬN
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="success" size="sm" className="inline-flex items-center gap-1">
          <CheckCircle2 size={12} /> ĐÃ XÁC NHẬN
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="danger" size="sm" className="inline-flex items-center gap-1">
          <XCircle size={12} /> ĐÃ HỦY
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" size="sm" className="inline-flex items-center gap-1">
          {val}
        </Badge>
      );
  }
};

const ExpenseDetailModal = ({ isOpen, onClose, selectedVoucher, handleConfirm, handleCancel }) => {
  const [detailVoucher, setDetailVoucher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (isOpen && selectedVoucher) {
      setLoading(true);
      setError('');
      setCancelMode(false);
      setCancelReason('');

      getExpenseDetail(selectedVoucher.voucherId)
        .then((res) => {
          setDetailVoucher(res?.data || res);
        })
        .catch((err) => {
          setError(err?.data?.message || err?.message || 'Không tải được chi tiết phiếu chi.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setDetailVoucher(null);
    }
  }, [isOpen, selectedVoucher]);

  const onConfirmSubmit = async () => {
    if (!window.confirm(`Xác nhận duyệt phiếu chi ${selectedVoucher.voucherCode}?`)) return;
    setActionLoading(true);
    try {
      await handleConfirm(selectedVoucher.voucherId);
      onClose();
    } catch (err) {
      alert(err?.data?.message || err?.message || 'Xác nhận phiếu chi thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const onCancelSubmit = async () => {
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy.');
      return;
    }
    setActionLoading(true);
    try {
      await handleCancel(selectedVoucher.voucherId, cancelReason.trim());
      onClose();
    } catch (err) {
      alert(err?.data?.message || err?.message || 'Hủy phiếu chi thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const detailTitle = detailVoucher ? (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-[#e5e5e5]">
        Chi tiết phiếu: <span className="text-[#004785]">{detailVoucher.voucherCode}</span>
      </div>
      <div className="text-sm font-normal text-slate-500 dark:text-[#999999]">
        Chi nhánh: <strong className="text-slate-700 dark:text-[#b3b3b3]">{detailVoucher.branchName}</strong>
      </div>
    </div>
  ) : (
    'Chi tiết phiếu chi tiền'
  );

  const modalFooter = (
    <div className="flex w-full items-center justify-between gap-3">
      {cancelMode ? (
        <>
          <Button variant="secondary" onClick={() => setCancelMode(false)} disabled={actionLoading}>
            Quay lại
          </Button>
          <Button
            variant="danger"
            onClick={onCancelSubmit}
            loading={actionLoading}
            disabled={actionLoading}
          >
            Xác nhận hủy phiếu
          </Button>
        </>
      ) : (
        <>
          <Button variant="secondary" onClick={onClose} disabled={actionLoading}>
            Đóng
          </Button>
          <div className="flex items-center gap-2">
            {selectedVoucher?.canCancel && (
              <Button
                variant="outline"
                className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                onClick={() => setCancelMode(true)}
                disabled={actionLoading}
              >
                <Ban size={16} /> Hủy phiếu
              </Button>
            )}
            {selectedVoucher?.canConfirm && (
              <Button
                variant="success"
                className="flex items-center gap-1"
                onClick={onConfirmSubmit}
                loading={actionLoading}
                disabled={actionLoading}
              >
                {!actionLoading && <Check size={16} />} Duyệt phiếu
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={detailTitle} size="lg" footer={modalFooter}>
      {loading ? (
        <div className="flex items-center justify-center py-10 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin text-[#004785]" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      ) : detailVoucher ? (
        <div className="space-y-5">
          {cancelMode && (
            <div className="animate-fade-in rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-800 dark:bg-red-950/30">
              <p className="mb-2 text-sm font-semibold text-red-800 dark:text-red-300">
                Nhập lý do hủy cho phiếu {detailVoucher.voucherCode} (
                {formatCurrency(detailVoucher.amount)})
              </p>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Lý do hủy phiếu..."
                autoFocus
              />
            </div>
          )}

          <div className="flex items-center gap-4 border-b border-slate-100 pb-4 dark:border-[#333333]">
            {renderStatusBadge(detailVoucher.status)}
            <div className="flex-1 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-slate-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-[#b3b3b3]">
              <strong>Lý do chi:</strong> {detailVoucher.reason}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 p-4 sm:grid-cols-2 dark:border-[#333333]">
            <div>
              <div className="text-xs font-medium uppercase text-slate-400 dark:text-[#808080]">Nhóm chi phí</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-[#e5e5e5]">
                {detailVoucher.categoryName}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase text-slate-400 dark:text-[#808080]">Nhà cung cấp</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-[#e5e5e5]">
                {detailVoucher.supplierName || '---'}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase text-slate-400 dark:text-[#808080]">Số tiền</div>
              <div className="mt-0.5 text-base font-bold text-emerald-600">
                {formatCurrency(detailVoucher.amount)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase text-slate-400 dark:text-[#808080]">Người tạo</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-[#e5e5e5]">
                {detailVoucher.createdByName || '---'}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase text-slate-400 dark:text-[#808080]">Ngày tạo</div>
              <div className="mt-0.5 text-sm text-slate-800 dark:text-[#e5e5e5]">
                {formatDateTime(detailVoucher.createdAt)}
              </div>
            </div>
            {detailVoucher.note && (
              <div className="border-t border-slate-100 pt-3 sm:col-span-2 dark:border-[#333333]">
                <div className="text-xs font-medium uppercase text-slate-400 dark:text-[#808080]">Ghi chú</div>
                <div className="mt-0.5 text-sm text-slate-600 dark:text-[#999999]">{detailVoucher.note}</div>
              </div>
            )}
          </div>

          {detailVoucher.status === 'COMPLETED' && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
              <div className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                Thông tin xác nhận
              </div>
              <div className="mt-1 text-sm text-emerald-800 dark:text-emerald-400">
                Bởi <strong>{detailVoucher.confirmedByName || '---'}</strong> lúc{' '}
                {formatDateTime(detailVoucher.completedAt)}
              </div>
            </div>
          )}

          {detailVoucher.status === 'CANCELLED' && (
            <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950/30">
              <div className="text-xs font-semibold uppercase text-rose-700 dark:text-rose-300">Thông tin hủy</div>
              <div className="mt-1 text-sm text-rose-800 dark:text-rose-400">
                Bởi <strong>{detailVoucher.cancelledByName || '---'}</strong> lúc{' '}
                {formatDateTime(detailVoucher.cancelledAt)}
              </div>
              {detailVoucher.cancelReason && (
                <div className="mt-2 text-sm text-rose-700 dark:text-rose-400">
                  <span className="font-medium">Lý do hủy: </span>
                  {detailVoucher.cancelReason}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

export default ExpenseDetailModal;
