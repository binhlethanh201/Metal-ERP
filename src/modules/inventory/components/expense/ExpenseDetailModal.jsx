import React, { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Badge } from '../../../../shared/components/Badge';
import { Textarea } from '../../../../shared/components/Textarea';
import { Input } from '../../../../shared/components/Input';
import { CheckCircle2, Clock, XCircle, RefreshCw, Check, Ban, Receipt, FileText, Edit3, Save } from 'lucide-react';
import { getExpenseDetail, updateExpenseVoucher } from '../../services/expenseService';
import { useAuth } from '../../../../shared/hooks/useAuth';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

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

const ExpenseDetailModal = ({ isOpen, onClose, selectedVoucher, handleConfirm, handleCancel, onSuccessUpdate }) => {
  const { user } = useAuth();
  const [detailVoucher, setDetailVoucher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');

  const formatAmountDisplay = (val) => {
    if (!val) return '';
    return Number(val).toLocaleString('vi-VN');
  };

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\./g, '');
    if (/^\d*$/.test(raw)) {
      setEditAmount(raw);
    }
  };

  const isPending = detailVoucher?.status === 'PENDING';
  const isCreator = detailVoucher?.createdBy && user?.userId && detailVoucher.createdBy === user.userId;
  const isOwner = user?.roles?.some((r) => r.roleName === 'Owner') || user?.role === 'Owner';
  const canEdit = isPending && (isCreator || isOwner);

  useEffect(() => {
    if (isOpen && selectedVoucher) {
      setLoading(true);
      setError('');
      setCancelMode(false);
      setCancelReason('');
      setIsEditing(false);

      getExpenseDetail(selectedVoucher.voucherId)
        .then((res) => {
          const data = res?.data || res;
          setDetailVoucher(data);
          setEditReason(data.reason || '');
          setEditAmount(data.amount != null ? String(data.amount) : '');
          setEditNote(data.note || '');
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

  const onSaveEdit = async () => {
    if (!editReason.trim()) {
      alert('Vui lòng nhập lý do chi.');
      return;
    }
    const amount = Number(editAmount);
    if (!amount || amount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ.');
      return;
    }
    setActionLoading(true);
    try {
      await updateExpenseVoucher(selectedVoucher.voucherId, {
        reason: editReason.trim(),
        amount,
        note: editNote.trim(),
      });
      setDetailVoucher((prev) => ({ ...prev, reason: editReason.trim(), amount, note: editNote.trim() }));
      setIsEditing(false);
      if (onSuccessUpdate) {
        onSuccessUpdate();
      }
    } catch (err) {
      alert(err?.data?.message || err?.message || 'Cập nhật phiếu chi thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const detailTitle = detailVoucher ? (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 font-bold text-rose-600 dark:bg-rose-900/50">
        <Receipt size={20} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">
          Chi tiết phiếu chi
        </span>
        <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-[#272727] dark:text-[#b3b3b3]">
          {detailVoucher.voucherCode}
        </span>
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
            {canEdit && !isEditing && (
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => setIsEditing(true)}
                disabled={actionLoading}
              >
                <Edit3 size={16} /> Sửa phiếu
              </Button>
            )}
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
        <div className="space-y-6">
          {cancelMode && (
            <div className="animate-fade-in rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-800 dark:bg-red-950/30">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-300">
                <FileText size={16} /> Nhập lý do hủy cho phiếu {detailVoucher.voucherCode} (
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

          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-[#333333] dark:bg-[#1a1a1a]">
            <div>
              <span className="block text-xs font-semibold uppercase text-slate-500 dark:text-[#999999]">Trạng thái</span>
              <div className="mt-1">{renderStatusBadge(detailVoucher.status)}</div>
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase text-slate-500 dark:text-[#999999]">Người tạo</span>
              <div className="mt-1 font-semibold text-slate-800 dark:text-[#d4d4d4]">{detailVoucher.createdByName || '---'}</div>
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase text-slate-500 dark:text-[#999999]">Ngày tạo</span>
              <div className="mt-1 font-semibold text-slate-800 dark:text-[#d4d4d4]">
                {detailVoucher.createdAt ? new Date(detailVoucher.createdAt).toLocaleString('vi-VN') : '---'}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-[#333333]">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 text-sm font-bold text-slate-800 dark:border-[#333333] dark:text-[#d4d4d4]">
              <FileText size={16} className="text-slate-500 dark:text-[#999999]" /> Thông tin phiếu chi
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <Input label="Lý do chi" value={editReason} onChange={(e) => setEditReason(e.target.value)} />
                <Input 
                  label="Số tiền" 
                  type="text" 
                  inputMode="numeric"
                  value={formatAmountDisplay(editAmount)} 
                  onChange={handleAmountChange} 
                />
                <Textarea label="Ghi chú" rows={2} value={editNote} onChange={(e) => setEditNote(e.target.value)} />
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)} disabled={actionLoading}>Hủy</Button>
                  <Button variant="primary" size="sm" onClick={onSaveEdit} loading={actionLoading} className="flex items-center gap-1">
                    <Save size={13} /> Lưu thay đổi
                  </Button>
                </div>
              </div>
            ) : (
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="block text-xs font-medium text-slate-500 dark:text-[#999999]">Nhóm chi phí</span>
                <p className="mt-0.5 font-semibold text-slate-800 dark:text-[#d4d4d4]">
                  {detailVoucher.categoryName || '(Nhóm đã xóa)'}
                </p>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 dark:text-[#999999]">Số tiền</span>
                <p className="mt-0.5 text-base font-bold text-emerald-600">{formatCurrency(detailVoucher.amount)}</p>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 dark:text-[#999999]">Lý do chi</span>
                <p className="mt-0.5 font-semibold text-slate-800 dark:text-[#d4d4d4]">{detailVoucher.reason}</p>
              </div>
              {detailVoucher.note && (
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-[#999999]">Ghi chú</span>
                  <p className="mt-0.5 text-slate-600 dark:text-[#999999]">{detailVoucher.note}</p>
                </div>
              )}
            </div>
            )}
          </div>

          {detailVoucher.status === 'COMPLETED' && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
              <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 size={16} /> Thông tin xác nhận
              </div>
              <div className="mt-1 text-sm text-emerald-800 dark:text-emerald-400">
                Bởi <strong>{detailVoucher.confirmedByName || '---'}</strong> lúc{' '}
                {detailVoucher.completedAt ? new Date(detailVoucher.completedAt).toLocaleString('vi-VN') : '---'}
              </div>
            </div>
          )}

          {detailVoucher.status === 'CANCELLED' && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950/30">
              <div className="flex items-center gap-1.5 text-sm font-bold text-rose-700 dark:text-rose-300">
                <XCircle size={16} /> Thông tin hủy
              </div>
              <div className="mt-1 text-sm text-rose-800 dark:text-rose-400">
                Bởi <strong>{detailVoucher.cancelledByName || '---'}</strong> lúc{' '}
                {detailVoucher.cancelledAt ? new Date(detailVoucher.cancelledAt).toLocaleString('vi-VN') : '---'}
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
