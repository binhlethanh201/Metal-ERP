import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import {
  getInventoryCheckDetail,
  fillInventoryCheck,
  approveInventoryCheck,
  rejectInventoryCheck,
  cancelInventoryCheck,
  deleteInventoryCheck,
  updateDiscrepancyReasons,
} from '../../services/inventoryCheckService';
import { useAuth } from '../../../../shared/hooks/useAuth';

// Import Shared Components
import Modal from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Textarea from '../../../../shared/components/Textarea';
import Table from '../../../../shared/components/Table';
import Badge from '../../../../shared/components/Badge';

// ==================== HELPERS ====================
const formatUserName = (name) => {
  if (!name) return '';
  let username = name;
  const atIndex = name.indexOf('@');
  if (atIndex > 0) username = name.slice(0, atIndex);
  return username
    .replace(/[._]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

const normalizeDetailData = (data) => {
  if (!data) return null;
  const rawDetails = data.details || data.items || [];
  return {
    ...data,
    details: rawDetails.map((item) => ({
      ...item,
      detailId: item.detailId || item.ticketItemId || item.id || item.branchProductId,
    })),
  };
};

const getStatusLabel = (item) => {
  if (!item) return '...';
  const status = item.status || item.Status;
  const recountNumber = Number(item.recountNumber ?? item.RecountNumber ?? 0);

  if (status === 'Draft') {
    return recountNumber > 0 ? 'Yêu cầu đếm lại' : 'Nháp (Đang đếm)';
  }

  switch (status) {
    case 'WaitingForApproval': return 'Chờ duyệt';
    case 'Completed': return 'Đã hoàn thành';
    case 'Cancelled': return 'Đã hủy';
    default: return status;
  }
};

const InventoryCheckDetailModal = ({ isOpen, onClose, ticketId, onActionSuccess, onEditClick }) => {
  const { user } = useAuth();
  const isOwner = user?.roles?.includes('Owner') || user?.role === 'Owner';
  const currentUserId = user?.userId || user?.id;

  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Form đếm thực tế
  const [actualValues, setActualValues] = useState({});

  // Form reject
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Form cancel (cần nhập reason)
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Form giải trình lý do chênh lệch (4.10)
  const [isEditingReasons, setIsEditingReasons] = useState(false);
  const [reasonNotes, setReasonNotes] = useState({});

  // ==================== FETCH DETAIL ====================
  useEffect(() => {
    if (!isOpen || !ticketId) {
      setDetailData(null);
      setError('');
      return;
    }

    setLoading(true);
    setError('');
    setIsRejecting(false);
    setRejectReason('');
    setIsCancelling(false);
    setCancelReason('');
    setIsEditingReasons(false);
    setReasonNotes({});

    getInventoryCheckDetail(ticketId)
      .then((res) => {
        if (res?.success && res.data) {
          const normalized = normalizeDetailData(res.data);
          setDetailData(normalized);

          // Init giá trị thực tế từ data (nếu đã đếm thì giữ lại)
          const initValues = {};
          (normalized.details || []).forEach((item) => {
            initValues[item.detailId] = item.isCounted ? item.actualQuantity : '';
          });
          setActualValues(initValues);

          // Init reason notes
          const initReasons = {};
          (normalized.details || []).forEach((item) => {
            initReasons[item.detailId] = item.reasonNote || '';
          });
          setReasonNotes(initReasons);
        } else {
          setError('Không thể tải chi tiết phiếu kiểm kê.');
        }
      })
      .catch((err) => {
        setError(err?.data?.message || err?.message || 'Lỗi khi tải chi tiết.');
      })
      .finally(() => setLoading(false));
  }, [isOpen, ticketId]);

  if (!isOpen) return null;

  // ==================== PERMISSION CHECKS ====================
  const isDraft = detailData?.status === 'Draft';
  const isWaiting = detailData?.status === 'WaitingForApproval';
  const isCompleted = detailData?.status === 'Completed';

  const canFill = isDraft && (isOwner || currentUserId === detailData?.assigneeUserId);
  const canModify = isDraft && (isOwner || currentUserId === detailData?.createdByUserId);
  const canApproveReject = isOwner && isWaiting;
  const canCancel = isOwner && (isDraft || isWaiting);
  const canEditReasons = isOwner && (isWaiting || isCompleted);

  // ==================== ACTION HANDLERS ====================
  const handleFill = async () => {
    const hasUncounted = detailData?.details.some((item) => {
      const val = actualValues[item.detailId];
      return val === undefined || val === null || val === '';
    });
    if (hasUncounted) {
      setError('Vui lòng nhập đầy đủ số lượng kiểm đếm cho tất cả sản phẩm!');
      return;
    }

    // Validate Frontend: Kiểm tra không cho phép nhập số âm
    const hasNegative = detailData?.details.some((item) => {
      const val = actualValues[item.detailId];
      return val !== '' && Number(val) < 0;
    });

    if (hasNegative) {
      alert('Số lượng kiểm đếm thực tế không được phép nhỏ hơn 0!');
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      const details = Object.entries(actualValues).map(([detailId, val]) => ({
        detailId,
        actualQuantity: Number(val),
      }));
      const res = await fillInventoryCheck(ticketId, details);
      if (res?.success) {
        onActionSuccess?.();
        onClose();
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Lỗi khi gửi kết quả kiểm kê.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (
      !window.confirm(
        'Duyệt phiếu này? Tồn kho sẽ được điều chỉnh ngay lập tức theo công thức: tồn hiện tại + chênh lệch.'
      )
    )
      return;

    setActionLoading(true);
    setError('');
    try {
      const res = await approveInventoryCheck(ticketId);
      if (res?.success) {
        onActionSuccess?.();
        onClose();
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Lỗi khi duyệt phiếu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      setError('Vui lòng nhập lý do yêu cầu đếm lại!');
      return;
    }
    if (!window.confirm('Xác nhận yêu cầu đếm lại phiếu này?')) return;

    setActionLoading(true);
    setError('');
    try {
      const res = await rejectInventoryCheck(ticketId, rejectReason.trim());
      if (res?.success) {
        onActionSuccess?.();
        onClose();
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Lỗi khi yêu cầu đếm lại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!window.confirm('Xác nhận hủy phiếu kiểm kê này? Tồn kho sẽ không bị ảnh hưởng.')) return;

    setActionLoading(true);
    setError('');
    try {
      const res = await cancelInventoryCheck(ticketId, cancelReason.trim());
      if (res?.success) {
        onActionSuccess?.();
        onClose();
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Lỗi khi hủy phiếu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Xóa phiếu kiểm kê nháp này? Hành động này không thể hoàn tác.')) return;

    setActionLoading(true);
    setError('');
    try {
      const res = await deleteInventoryCheck(ticketId);
      if (res?.success) {
        onActionSuccess?.();
        onClose();
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Lỗi khi xóa phiếu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveReasons = async () => {
    setActionLoading(true);
    setError('');
    try {
      const details = Object.entries(reasonNotes)
        .filter(([, note]) => note !== undefined)
        .map(([detailId, reasonNote]) => ({ detailId, reasonNote: reasonNote || '' }));

      const res = await updateDiscrepancyReasons(ticketId, details);
      if (res?.success) {
        setIsEditingReasons(false);
        const refreshed = await getInventoryCheckDetail(ticketId);
        if (refreshed?.success && refreshed.data) {
          setDetailData(normalizeDetailData(refreshed.data));
        }
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Lỗi khi lưu giải trình.');
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== CẤU HÌNH TABLE ====================
  const tableColumns = [
    {
      key: 'productCode',
      header: 'Mã SP',
      render: (val) => <span className="font-semibold text-slate-700">{val}</span>,
    },
    {
      key: 'productName',
      header: 'Tên sản phẩm',
    },
    {
      key: 'systemQuantity',
      header: (
        <div className="text-center" title="Tồn kho được chốt từ DB tại thời điểm Fill.">
          Tồn Hệ Thống{' '}
          <Icon name="info" size={14} className="inline align-text-bottom text-slate-400" />
        </div>
      ),
      render: (_, item) => (
        <div className="text-center font-bold text-slate-500">
          {isDraft ? (
            <span className="italic text-slate-400" title="Sẽ được chốt khi bấm Gửi duyệt">
              Chốt lúc fill
            </span>
          ) : (
            item.systemQuantity
          )}
        </div>
      ),
    },
    {
      key: 'actualQuantity',
      header: <div className="text-center">Kiểm Đếm Thực Tế</div>,
      render: (_, item) => {
        const currentActualRaw = actualValues[item.detailId];
        const hasValue =
          currentActualRaw !== '' && currentActualRaw !== undefined && currentActualRaw !== null;

        if (isDraft && canFill) {
          return (
            <div className="text-center">
              <input
                type="number"
                min="0"
                placeholder="Nhập..."
                className={`w-24 rounded border px-2 py-1.5 text-center font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-[#004785] ${
                  !hasValue
                    ? 'border-orange-300 bg-orange-50 text-orange-700'
                    : 'border-slate-300 text-[#004785]'
                }`}
                value={currentActualRaw}
                onChange={(e) =>
                  setActualValues((prev) => ({
                    ...prev,
                    [item.detailId]: e.target.value,
                  }))
                }
              />
            </div>
          );
        }
        return (
          <div className="text-center font-bold text-[#004785]">
            {item.isCounted ? item.actualQuantity : '-'}
          </div>
        );
      },
    },
    {
      key: 'discrepancy',
      header: <div className="text-center">Chênh Lệch</div>,
      render: (_, item) => {
        const currentActualRaw = actualValues[item.detailId];
        const hasValue =
          currentActualRaw !== '' && currentActualRaw !== undefined && currentActualRaw !== null;
        const currentActual = hasValue ? Number(currentActualRaw) : 0;
        const displayDiscrepancy = isDraft
          ? currentActual - (item.systemQuantity || 0)
          : item.discrepancy;

        return (
          <div
            className={`text-center font-bold ${
              isDraft
                ? !hasValue
                  ? 'text-slate-300'
                  : displayDiscrepancy === 0
                    ? 'text-slate-400'
                    : displayDiscrepancy > 0
                      ? 'text-emerald-600'
                      : 'text-red-600'
                : !item.isCounted
                  ? 'text-slate-300'
                  : item.discrepancy === 0
                    ? 'text-slate-400'
                    : item.discrepancy > 0
                      ? 'text-emerald-600'
                      : 'text-red-600'
            }`}
          >
            {isDraft
              ? !hasValue
                ? '-'
                : displayDiscrepancy > 0
                  ? `+${displayDiscrepancy}`
                  : displayDiscrepancy
              : !item.isCounted
                ? '-'
                : item.discrepancy > 0
                  ? `+${item.discrepancy}`
                  : item.discrepancy}
          </div>
        );
      },
    },
  ];

  if (isWaiting || isCompleted) {
    tableColumns.push({
      key: 'reasonNote',
      header: 'Giải trình',
      render: (_, item) => {
        if (isEditingReasons && canEditReasons) {
          return (
            <input
              type="text"
              placeholder="Nhập giải trình..."
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs focus:border-[#004785] focus:outline-none"
              value={reasonNotes[item.detailId] || ''}
              onChange={(e) =>
                setReasonNotes((prev) => ({
                  ...prev,
                  [item.detailId]: e.target.value,
                }))
              }
            />
          );
        }
        return <span className="text-xs italic text-slate-500">{item.reasonNote || '—'}</span>;
      },
    });
  }

  // ==================== CẤU HÌNH FOOTER (SPLIT ALIGNMENT) ====================
  const isFormActive = isRejecting || isCancelling || isEditingReasons;

  const modalFooter = (
    <div className="flex w-full items-center justify-between gap-3">
      {/* KHU VỰC BÊN TRÁI: Hủy thao tác / Xóa phiếu / Hủy phiếu */}
      <div className="flex items-center gap-2">
        {isFormActive ? (
          <Button
            variant="secondary"
            onClick={() => {
              setIsRejecting(false);
              setIsCancelling(false);
              setIsEditingReasons(false);
              setError('');
            }}
            disabled={actionLoading}
          >
            Hủy thao tác
          </Button>
        ) : (
          <>
            {/* Xóa phiếu nháp */}
            {canModify && (
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex items-center gap-2"
              >
                <Icon name="delete" size={18} /> Xóa phiếu
              </Button>
            )}

            {/* Hủy phiếu */}
            {canCancel && (
              <Button
                variant="secondary"
                onClick={() => setIsCancelling(true)}
                disabled={actionLoading}
                className="flex items-center gap-2 border border-slate-300 bg-white"
              >
                <Icon name="Ban" size={18} /> Hủy phiếu
              </Button>
            )}
          </>
        )}
      </div>

      {/* KHU VỰC BÊN PHẢI: Tiến trình chính / Sửa / Giải trình / Duyệt phiếu */}
      <div className="flex items-center gap-2">
        {!isFormActive ? (
          <>
            {/* Sửa phiếu */}
            {canModify && (
              <Button
                variant="outline"
                onClick={() => onEditClick?.(detailData)}
                disabled={actionLoading}
                className="flex items-center gap-2"
              >
                <Icon name="edit" size={18} /> Sửa phiếu
              </Button>
            )}

            {/* Giải trình chênh lệch */}
            {canEditReasons && !isEditingReasons && (
              <Button
                variant="outline"
                onClick={() => setIsEditingReasons(true)}
                disabled={actionLoading}
                className="flex items-center gap-2"
              >
                <Icon name="edit" size={18} /> Nhập giải trình
              </Button>
            )}

            {/* Gửi duyệt */}
            {canFill && (
              <Button
                variant="primary"
                onClick={handleFill}
                disabled={actionLoading}
                loading={actionLoading}
                className="flex items-center gap-2"
              >
                {!actionLoading && <Icon name="send" size={18} />}
                {actionLoading ? 'Đang gửi...' : 'Gửi duyệt (Chốt số)'}
              </Button>
            )}

            {/* Yêu cầu đếm lại & Duyệt */}
            {canApproveReject && (
              <>
                <Button
                  variant="danger"
                  onClick={() => setIsRejecting(true)}
                  disabled={actionLoading}
                  className="flex items-center gap-2"
                >
                  <Icon name="history" size={18} /> Yêu cầu đếm lại
                </Button>
                <Button
                  variant="success"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  loading={actionLoading}
                  className="flex items-center gap-2"
                >
                  {!actionLoading && <Icon name="check_circle" size={18} />}
                  {actionLoading ? 'Đang duyệt...' : 'Duyệt phiếu'}
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            {/* Các nút xác nhận tương ứng khi form phụ kích hoạt */}
            {isRejecting && (
              <Button
                variant="danger"
                onClick={handleRejectConfirm}
                disabled={actionLoading || !rejectReason.trim()}
                loading={actionLoading}
              >
                Xác nhận bắt đếm lại
              </Button>
            )}

            {isCancelling && (
              <Button
                variant="danger"
                onClick={handleCancelConfirm}
                disabled={actionLoading}
                loading={actionLoading}
              >
                Xác nhận hủy phiếu
              </Button>
            )}

            {isEditingReasons && (
              <Button
                variant="primary"
                onClick={handleSaveReasons}
                disabled={actionLoading}
                loading={actionLoading}
                className="flex items-center gap-2"
              >
                {!actionLoading && <Icon name="save" size={18} />}
                Lưu giải trình
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ==================== CẤU HÌNH HEADER TITLE ====================
  const modalTitle = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
        Chi tiết phiếu: <span className="text-[#004785]">{detailData?.ticketCode || '...'}</span>
        {detailData?.recountNumber > 0 && (
          <Badge variant="warning">Đếm lại lần {detailData.recountNumber}</Badge>
        )}
      </div>
      <div className="text-sm font-normal text-slate-500">
        Người phụ trách:{' '}
        <strong className="text-slate-700">
          {formatUserName(detailData?.assigneeUserName) || 'Chưa gán'}
        </strong>
        {detailData?.createdByUserName && (
          <>
            {' '}
            • Người tạo:{' '}
            <strong className="text-slate-700">
              {formatUserName(detailData.createdByUserName)}
            </strong>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="5xl" footer={modalFooter}>
      {loading ? (
        <div className="py-10 text-center text-slate-400">
          <Icon name="sync" className="mb-2 animate-spin text-3xl" />
          <p>Đang tải chi tiết phiếu...</p>
        </div>
      ) : !detailData ? (
        <div className="py-10 text-center text-red-500">{error || 'Không có dữ liệu.'}</div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Trạng thái và Ghi chú */}
          <div className="flex items-center gap-4">
            <Badge
              variant={
                detailData?.status === 'Completed'
                  ? 'success'
                  : detailData?.status === 'WaitingForApproval'
                    ? 'warning'
                    : detailData?.status === 'Cancelled'
                      ? 'danger'
                      : 'secondary'
              }
              size="lg"
            >
              {getStatusLabel(detailData)}
            </Badge>

            {detailData.notes && (
              <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-700">
                <strong>Ghi chú:</strong> {detailData.notes}
              </div>
            )}
          </div>

          {/* Cảnh báo đếm lại */}
          {detailData.recountNumber > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 shadow-sm">
              <Icon name="warning" className="mt-0.5 shrink-0 text-orange-500" size={20} />
              <div>
                <strong className="mb-1 block text-sm font-bold text-orange-800">
                  Phiếu này đã bị yêu cầu đếm lại!
                </strong>
                <span className="text-sm italic text-orange-700">
                  Lý do: "{detailData.recountReason}"
                </span>
              </div>
            </div>
          )}

          {/* Bảng chi tiết sản phẩm */}
          <div className="rounded-lg border border-slate-200 bg-white">
            <Table
              columns={tableColumns}
              data={detailData.details || []}
              className="border-none"
              emptyMessage="Không có sản phẩm nào trong phiếu."
            />
            {isDraft && (
              <div className="border-t border-blue-100 bg-blue-50 p-3 text-center text-xs italic text-blue-600">
                * Cột "Tồn Hệ Thống" và "Chênh Lệch" sẽ được hệ thống chốt chính xác từ DB tại thời
                điểm bấm "Gửi duyệt".
              </div>
            )}
          </div>

          {/* Hiển thị Banner Lỗi */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <Icon name="error" size={18} className="mt-0.5 shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                <Icon name="close" size={18} />
              </button>
            </div>
          )}

          {/* Form phụ: lý do đếm lại */}
          {isRejecting && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <Textarea
                label="Lý do yêu cầu đếm lại"
                required
                placeholder="VD: Số lượng đếm lệch quá nhiều so với báo cáo bán hàng..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Form phụ: lý do hủy phiếu */}
          {isCancelling && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <Textarea
                label={
                  <>
                    Lý do hủy phiếu <span className="font-normal text-slate-400">(tùy chọn)</span>
                  </>
                }
                placeholder="VD: Hủy vì sai sản phẩm..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default InventoryCheckDetailModal;
