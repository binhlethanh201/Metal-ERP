import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import { getInventoryCheckDetail } from '../../services/inventoryCheckService';
import { useAuth } from '../../../../shared/hooks/useAuth';

const InventoryCheckDetailModal = ({
  isOpen,
  onClose,
  ticketId,
  onFillSubmit,
  onApproveSubmit,
  onRejectSubmit,
}) => {
  const { user } = useAuth();
  const isOwner = user?.roles?.includes('Owner') || user?.role === 'Owner';

  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actualValues, setActualValues] = useState({});

  // State xử lý form Yêu cầu đếm lại
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (isOpen && ticketId) {
      setLoading(true);
      setIsRejecting(false);
      setRejectReason('');

      getInventoryCheckDetail(ticketId)
        .then((res) => {
          if (res?.success && res.data) {
            setDetailData(res.data);
            const initialValues = {};
            res.data.details.forEach((item) => {
              initialValues[item.detailId] = item.actualQuantity || 0;
            });
            setActualValues(initialValues);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setDetailData(null);
    }
  }, [isOpen, ticketId]);

  if (!isOpen) return null;

  const isDraft = detailData?.status === 'Draft';
  const isWaiting = detailData?.status === 'WaitingForApproval';

  const handleFill = () => {
    const detailsPayload = Object.keys(actualValues).map((detailId) => ({
      detailId: detailId,
      actualQuantity: Number(actualValues[detailId]),
    }));
    onFillSubmit(ticketId, detailsPayload, onClose);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do để nhân viên biết đường đếm lại!');
      return;
    }
    onRejectSubmit(ticketId, rejectReason, onClose);
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
              Trạng thái: <strong className="uppercase">{detailData?.status}</strong> • Tạo bởi:{' '}
              <strong>{detailData?.createdByUserName || 'N/A'}</strong>
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
                        title="Tồn kho trên phần mềm lúc tạo phiếu"
                      >
                        Tồn Hệ Thống
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
                      const currentActual = actualValues[item.detailId] ?? 0;
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
                            {isDraft ? (
                              <input
                                type="number"
                                min="0"
                                className="w-24 rounded border border-blue-300 px-2 py-1 text-center font-bold text-blue-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={currentActual}
                                onChange={(e) =>
                                  setActualValues({
                                    ...actualValues,
                                    [item.detailId]: e.target.value,
                                  })
                                }
                              />
                            ) : (
                              <span className="font-bold text-blue-700">{item.actualQuantity}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isDraft ? (
                              <span
                                className={`font-bold ${discrepancy === 0 ? 'text-slate-400' : discrepancy > 0 ? 'text-emerald-600' : 'text-red-600'}`}
                              >
                                {discrepancy > 0 ? `+${discrepancy}` : discrepancy}
                              </span>
                            ) : (
                              <span
                                className={`font-bold ${item.discrepancy === 0 ? 'text-slate-400' : item.discrepancy > 0 ? 'text-emerald-600' : 'text-red-600'}`}
                              >
                                {item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Khu vực Form Nhập Lý Do Reject (Chỉ hiện khi bấm Yêu cầu đếm lại) */}
        {isRejecting && (
          <div className="border-t border-orange-200 bg-orange-50 px-6 py-4">
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
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {isDraft ? 'Lưu nháp / Đóng' : 'Đóng'}
            </button>
          ) : (
            <button
              onClick={() => setIsRejecting(false)}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Hủy thao tác
            </button>
          )}

          {/* Action cho Staff: Đang Draft thì cho Fill */}
          {isDraft && !isRejecting && (
            <button
              onClick={handleFill}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              <Icon name="send" size={20} /> Gửi duyệt
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
                onClick={() => onApproveSubmit(ticketId, onClose)}
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
