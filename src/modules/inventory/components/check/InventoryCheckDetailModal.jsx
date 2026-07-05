import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import { getInventoryCheckDetail } from '../../services/inventoryCheckService';
import { useAuth } from '../../../../shared/hooks/useAuth';

const normalizeDetailData = (data) => {
  if (!data) return null;

  const rawDetails = data.details || data.items || [];
  const normalizedDetails = rawDetails.map((item) => ({
    ...item,
    detailId: item.detailId || item.ticketItemId || item.id || item.branchProductId,
  }));

  return {
    ...data,
    details: normalizedDetails,
  };
};

const STATUS_MAP = {
  Draft: 'Nháp (Đang đếm)',
  WaitingForApproval: 'Chờ duyệt',
  Completed: 'Đã hoàn thành',
  Cancelled: 'Đã hủy',
};

const InventoryCheckDetailModal = ({
  isOpen,
  onClose,
  ticketId,
  ticketData,
  onFillSubmit,
  onApproveSubmit,
  onRejectSubmit,
  onCancelSubmit,
  onDeleteSubmit,
  onEditClick,
}) => {
  const { user } = useAuth();
  const isOwner = user?.roles?.includes('Owner') || user?.role === 'Owner';
  const currentUserId = user?.userId || user?.id; // Lấy ID của user hiện tại

  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actualValues, setActualValues] = useState({});

  // State xử lý form Yêu cầu đếm lại
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (isOpen && (ticketId || ticketData)) {
      setLoading(true);
      setIsRejecting(false);
      setRejectReason('');

      const applyDetail = (data) => {
        const normalized = normalizeDetailData(data);
        if (!normalized) return;

        setDetailData(normalized);
        const initialValues = {};
        (normalized.details || []).forEach((item) => {
          initialValues[item.detailId] = item.isCounted ? item.actualQuantity : '';
        });
        setActualValues(initialValues);
      };

      if (ticketData && (ticketData.details || ticketData.items)) {
        applyDetail(ticketData);
        setLoading(false);
        return;
      }

      getInventoryCheckDetail(ticketId)
        .then((res) => {
          if (res?.success && res.data) {
            applyDetail(res.data);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setDetailData(null);
    }
  }, [isOpen, ticketId, ticketData]);

  if (!isOpen) return null;

  const isDraft = detailData?.status === 'Draft';
  const isWaiting = detailData?.status === 'WaitingForApproval';

  const ticketIdentifier =
    ticketId || detailData?.ticketId || detailData?.id || detailData?.stockTicketId;

  // Theo rule: Chỉ assignee hoặc Owner mới được fill (Đếm kho)
  const canFill = isDraft && (isOwner || currentUserId === detailData?.assigneeUserId);

  const handleFill = () => {
    // Validate Frontend: Kiểm tra xem có ô nào bị bỏ trống không
    const hasUncounted = detailData?.details.some((item) => {
      const val = actualValues[item.detailId];
      return val === undefined || val === null || val === '';
    });

    if (hasUncounted) {
      alert('Vui lòng nhập đầy đủ số lượng kiểm đếm cho tất cả sản phẩm!');
      return;
    }

    const detailsPayload = Object.keys(actualValues).map((detailId) => ({
      detailId: detailId,
      actualQuantity: Number(actualValues[detailId]),
    }));
    onFillSubmit(ticketIdentifier, detailsPayload, onClose);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do để nhân viên biết đường đếm lại!');
      return;
    }
    onRejectSubmit(ticketIdentifier, rejectReason, onClose);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              Chi tiết phiếu:{' '}
              <span className="text-blue-600">{detailData?.ticketCode || '...'}</span>
              {detailData?.recountNumber > 0 && (
                <span className="rounded-full border border-orange-200 bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                  Đếm lại lần {detailData.recountNumber}
                </span>
              )}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Trạng thái:{' '}
              <strong className="text-blue-600">
                {STATUS_MAP[detailData?.status] || detailData?.status}
              </strong>{' '}
              • Người phụ trách: <strong>{detailData?.assigneeUserName || 'Chưa gán'}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        {/* Nội dung */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          {loading ? (
            <div className="py-10 text-center text-slate-400">
              <Icon name="sync" className="mb-2 animate-spin text-3xl" />
              <p>Đang tải chi tiết phiếu...</p>
            </div>
          ) : (
            <>
              {/* Alert hiển thị lý do bắt đếm lại (Nếu có) */}
              {detailData?.recountNumber > 0 && (
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900 shadow-sm">
                  <Icon name="warning" className="mt-0.5 text-orange-500" size={20} />
                  <div>
                    <strong className="mb-1 block text-orange-800">
                      Cảnh báo: Phiếu này đã bị yêu cầu đếm lại!
                    </strong>
                    <span className="italic">Lý do từ quản lý: "{detailData.recountReason}"</span>
                  </div>
                </div>
              )}

              <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-slate-700">
                <strong>Ghi chú:</strong> {detailData?.notes || 'Không có ghi chú'}
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="border-b border-slate-200 px-4 py-3 font-bold">Mã SP</th>
                      <th className="border-b border-slate-200 px-4 py-3 font-bold">
                        Tên sản phẩm
                      </th>
                      <th
                        className="border-b border-slate-200 px-4 py-3 text-center font-bold"
                        title="Tồn kho sẽ được chốt số liệu chính xác từ hệ thống tại thời điểm bạn bấm Gửi Duyệt."
                      >
                        Tồn Hệ Thống{' '}
                        <Icon
                          name="info"
                          size={14}
                          className="inline align-text-bottom text-slate-400"
                        />
                      </th>
                      <th className="border-b border-slate-200 px-4 py-3 text-center font-bold">
                        Kiểm Đếm Thực Tế
                      </th>
                      <th className="border-b border-slate-200 px-4 py-3 text-center font-bold">
                        Chênh Lệch
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailData?.details?.map((item) => {
                      const currentActualRaw = actualValues[item.detailId];
                      const hasValue = currentActualRaw !== '' && currentActualRaw !== undefined;
                      const currentActual = hasValue ? Number(currentActualRaw) : 0;

                      // Tính discrepancy realtime lúc đang nhập cho user dễ nhìn
                      const discrepancy = currentActual - item.systemQuantity;

                      return (
                        <tr key={item.detailId} className="transition-colors hover:bg-blue-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-700">
                            {item.productCode}
                          </td>
                          <td className="px-4 py-3">{item.productName}</td>
                          <td className="bg-slate-50/50 px-4 py-3 text-center font-bold text-slate-500">
                            {item.systemQuantity}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isDraft && canFill ? (
                              <input
                                type="number"
                                min="0"
                                placeholder="Nhập..."
                                className={`w-24 rounded border px-2 py-1 text-center font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  !hasValue
                                    ? 'border-orange-300 bg-orange-50 text-orange-700'
                                    : 'border-blue-300 text-blue-700'
                                }`}
                                value={currentActualRaw}
                                onChange={(e) =>
                                  setActualValues({
                                    ...actualValues,
                                    [item.detailId]: e.target.value,
                                  })
                                }
                              />
                            ) : (
                              <span className="font-bold text-blue-700">
                                {item.isCounted ? item.actualQuantity : '-'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isDraft ? (
                              <span
                                className={`font-bold ${!hasValue ? 'text-slate-300' : discrepancy === 0 ? 'text-slate-400' : discrepancy > 0 ? 'text-emerald-600' : 'text-red-600'}`}
                              >
                                {!hasValue
                                  ? '-'
                                  : discrepancy > 0
                                    ? `+${discrepancy}`
                                    : discrepancy}
                              </span>
                            ) : (
                              <span
                                className={`font-bold ${!item.isCounted ? 'text-slate-300' : item.discrepancy === 0 ? 'text-slate-400' : item.discrepancy > 0 ? 'text-emerald-600' : 'text-red-600'}`}
                              >
                                {!item.isCounted
                                  ? '-'
                                  : item.discrepancy > 0
                                    ? `+${item.discrepancy}`
                                    : item.discrepancy}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {isDraft && (
                  <div className="border-t border-blue-100 bg-blue-50 p-3 text-center text-xs italic text-blue-600">
                    * Chú ý: Cột "Tồn Hệ Thống" và "Chênh Lệch" sẽ được hệ thống tính toán và chốt
                    lại chính xác một lần nữa vào thời điểm bạn bấm "Gửi duyệt".
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Khu vực Form Nhập Lý Do Reject */}
        {isRejecting && (
          <div className="animate-fade-in border-t border-orange-200 bg-orange-50 px-6 py-4">
            <label className="mb-2 block text-sm font-bold text-orange-900">
              Nhập lý do yêu cầu đếm lại <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="2"
              className="w-full rounded-lg border border-orange-300 p-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="VD: Số lượng đếm lệch quá nhiều so với báo cáo bán hàng ngày hôm qua..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          {!isRejecting ? (
            <>
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                {isDraft && canFill ? 'Đóng' : 'Đóng'}
              </button>

              {isDraft && isOwner && (
                <button
                  onClick={() => onEditClick(detailData)} // Gọi ra ngoài truyền detailData
                  className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <Icon name="edit" size={20} /> Sửa phiếu
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => setIsRejecting(false)}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Hủy thao tác
            </button>
          )}

          {/* Nút Delete / Cancel cho Owner khi phiếu đang Draft hoặc Waiting */}
          {!isRejecting && isOwner && isDraft && (
            <button
              onClick={() => onDeleteSubmit(ticketIdentifier)}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
            >
              <Icon name="delete" size={20} /> Xóa phiếu
            </button>
          )}

          {!isRejecting && isOwner && (isDraft || isWaiting) && (
            <button
              onClick={() => onCancelSubmit(ticketIdentifier, '', onClose)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
            >
              <Icon name="Ban" size={20} /> Hủy phiếu
            </button>
          )}

          {/* Action cho Staff/Assignee: Đang Draft thì cho Fill */}
          {canFill && !isRejecting && (
            <button
              onClick={handleFill}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Icon name="send" size={20} /> Gửi duyệt (Chốt số)
            </button>
          )}

          {/* Actions cho Owner: Chờ duyệt thì cho Approve hoặc Reject */}
          {isWaiting && isOwner && !isRejecting && (
            <>
              <button
                onClick={() => setIsRejecting(true)}
                className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-100 px-5 py-2.5 text-sm font-bold text-orange-700 transition-colors hover:bg-orange-200"
              >
                <Icon name="replay" size={20} /> Yêu cầu đếm lại
              </button>
              <button
                onClick={() => onApproveSubmit(ticketIdentifier, onClose)}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                <Icon name="check_circle" size={20} /> Duyệt phiếu
              </button>
            </>
          )}

          {/* Nút Xác nhận Reject */}
          {isRejecting && (
            <button
              onClick={handleRejectConfirm}
              className="flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-700"
            >
              Xác nhận bắt đếm lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryCheckDetailModal;
