import { useState, useEffect, useRef } from 'react';
import {
  X,
  Package,
  CalendarClock,
  User,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Edit3,
  Save,
} from 'lucide-react';
import {
  getInwardInventory,
  getOutwardInventory,
  confirmInwardInventory,
  confirmOutwardInventory,
  updateInwardInventory,
  updateOutwardInventory,
  cancelInwardInventory,
  cancelOutwardInventory,
} from '../../services/inventoryService';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val || 0));

// Bộ dịch ngữ nghĩa từ API Enum sang tiếng Việt chuẩn giao diện kho
const renderTicketTypeLabel = (ticketType, type) => {
  const key = ticketType?.toUpperCase();
  switch (key) {
    // Nhóm Nhập kho
    case 'PURCHASE':
      return 'Nhập hàng từ NCC';
    case 'CUSTOMER_RETURN':
      return 'Khách hàng trả lại';
    case 'BALANCE_ADJUST':
      return 'Cân bằng kiểm kho';
    // Nhóm Xuất kho
    case 'RETURN_SUPPLIER':
      return 'Trả hàng cho NCC';
    case 'WRITE_OFF':
      return 'Xuất hủy / Hao hụt';
    case 'TRANSFER':
      return 'Xuất điều chuyển nội bộ';
    default:
      return type === 'INWARD' ? 'Nhập kho thông thường' : 'Xuất kho thông thường';
  }
};

export const TicketDetailModal = ({
  isOpen,
  onClose,
  ticketId,
  type = 'INWARD',
  onReload,
  onNotify,
}) => {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  // State phục vụ chỉnh sửa Ghi chú / Lý do
  const [isEditing, setIsEditing] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [editNote, setEditNote] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const notifyRef = useRef(onNotify);
  const closeRef = useRef(onClose);
  useEffect(() => {
    notifyRef.current = onNotify;
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen || !ticketId) return;
    let active = true;

    const fetchDetail = async () => {
      setIsLoading(true);
      setIsEditing(false);
      try {
        const res =
          type === 'INWARD'
            ? await getInwardInventory(ticketId)
            : await getOutwardInventory(ticketId);
        const data = res?.data || res;
        if (active && data) {
          setDetail(data);
          setEditReason(data.reason || '');
          setEditNote(data.note || '');
        }
      } catch (error) {
        notifyRef.current &&
          notifyRef.current({ type: 'error', message: 'Không thể tải chi tiết phiếu kho này' });
        closeRef.current && closeRef.current();
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchDetail();
    return () => {
      active = false;
    };
  }, [isOpen, ticketId, type]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      if (type === 'INWARD') {
        await confirmInwardInventory(ticketId);
      } else {
        await confirmOutwardInventory(ticketId);
      }
      onNotify &&
        onNotify({ type: 'success', message: 'Duyệt phiếu thành công! Tồn kho đã được cập nhật.' });
      onReload && onReload();
      onClose();
    } catch (error) {
      const errList = error?.response?.data?.errors;
      const msg = Array.isArray(errList)
        ? errList.join(' | ')
        : error?.message || 'Lỗi khi xác nhận phiếu';
      onNotify && onNotify({ type: 'error', message: msg });
    } finally {
      setIsConfirming(false);
    }
  };

  // Xử lý cập nhật Ghi chú / Lý do tuân thủ tuyệt đối Rule của API Doc
  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    try {
      const statusUpper = detail?.status?.toUpperCase();

      // 1. Chuẩn bị Payload khắt khe theo từng trạng thái
      let payload = {};

      if (statusUpper === 'PENDING') {
        // PENDING: Được sửa cả Reason và Note
        payload = {
          reason: editReason.trim(),
          note: editNote.trim(),
        };
      } else if (statusUpper === 'COMPLETED') {
        // COMPLETED: Backend khóa Reason, CHỈ gửi trường Note để tránh bị từ chối (400 Bad Request)
        payload = {
          reason: detail.reason, // Giữ nguyên lý do cũ
          note: editNote.trim(),
        };
      } else {
        throw new Error('Phiếu đã hủy không thể chỉnh sửa thông tin.');
      }

      // 2. Gọi API tương ứng theo nghiệp vụ Nhập / Xuất
      if (type === 'INWARD') {
        await updateInwardInventory(ticketId, payload);
      } else {
        await updateOutwardInventory(ticketId, payload);
      }

      // 3. Cập nhật state cục bộ ngay lập tức để UI phản hồi mượt mà
      setDetail((prev) => ({
        ...prev,
        reason: statusUpper === 'PENDING' ? editReason.trim() : prev.reason,
        note: editNote.trim(),
      }));
      setIsEditing(false);

      onNotify &&
        onNotify({
          type: 'success',
          message:
            statusUpper === 'COMPLETED'
              ? 'Đã cập nhật ghi chú giải trình cho phiếu hoàn tất!'
              : 'Cập nhật thông tin phiếu thành công!',
        });
      onReload && onReload();
    } catch (error) {
      const errList = error?.response?.data?.errors;
      const msg = Array.isArray(errList)
        ? errList.join(' | ')
        : error?.message || 'Lỗi khi cập nhật phiếu';
      onNotify && onNotify({ type: 'error', message: msg });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const statusUpper = detail?.status?.toUpperCase();
  const isPending = statusUpper === 'PENDING';
  const isCompleted = statusUpper === 'COMPLETED';
  const isCancelled = statusUpper === 'CANCELLED';

  const canEditReason = isPending;
  const canEditNote = isPending || isCompleted;
  const canConfirm = detail?.canConfirm ?? isPending;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm duration-150">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 font-bold text-sky-700">
              <Package size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Chi tiết phiếu {type === 'INWARD' ? 'Nhập kho' : 'Xuất kho'}
                </h3>
                <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
                  {detail?.ticketCode || ticketId}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">Mã định danh hệ thống: {ticketId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Modal */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              Đang tải thông tin chi tiết phiếu...
            </div>
          ) : !detail ? (
            <div className="py-16 text-center text-rose-500">Không tìm thấy dữ liệu phiếu kho.</div>
          ) : (
            <>
              {/* Lưới thông tin tổng quan */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm sm:grid-cols-4">
                <div>
                  <span className="block text-xs font-semibold uppercase text-slate-500">
                    Trạng thái
                  </span>
                  <div className="mt-1 font-bold">
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 size={15} /> Hoàn tất
                      </span>
                    )}
                    {isPending && (
                      <span className="flex animate-pulse items-center gap-1 text-amber-600">
                        <Clock size={15} /> Chờ duyệt kho
                      </span>
                    )}
                    {isCancelled && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <XCircle size={15} /> Đã hủy
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-slate-500">
                    Người lập phiếu
                  </span>
                  <div className="mt-1 flex items-center gap-1 font-semibold text-slate-800">
                    <User size={14} className="text-slate-400" /> {detail.userName || 'Hệ thống'}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-slate-500">
                    Ngày tạo
                  </span>
                  <div className="mt-1 flex items-center gap-1 font-semibold text-slate-800">
                    <CalendarClock size={14} className="text-slate-400" />
                    {detail.createdAt ? new Date(detail.createdAt).toLocaleString('vi-VN') : '---'}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-slate-500">
                    Phân loại
                  </span>
                  {/* Sử dụng bộ dịch tiếng Việt hoàn toàn */}
                  <div className="mt-1 font-bold text-sky-700">
                    {renderTicketTypeLabel(detail.ticketType, type)}
                  </div>
                </div>
              </div>

              {/* Phần Ghi chú & Lý do */}
              <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                    <FileText size={16} className="text-slate-500" /> Ghi chú & Lý do giải trình
                  </span>
                  {!isCancelled && !isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 rounded-lg border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
                    >
                      <Edit3 size={13} /> Chỉnh sửa ghi chú
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Lý do nghiệp vụ{' '}
                        {canEditReason ? '' : '(Phiếu đã hoàn tất - Không được sửa Lý do)'}:
                      </label>
                      <input
                        disabled={!canEditReason || isSavingEdit}
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Ghi chú bổ sung {canEditNote ? '' : '(Không được phép sửa)'}:
                      </label>
                      <textarea
                        rows={2}
                        disabled={!canEditNote || isSavingEdit}
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-sm disabled:bg-slate-100"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        disabled={isSavingEdit}
                        className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={isSavingEdit}
                        className="flex items-center gap-1 rounded-xl bg-sky-600 px-3 py-1 text-xs font-bold text-white hover:bg-sky-700"
                      >
                        <Save size={13} /> {isSavingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <span className="block text-xs font-medium text-slate-500">Lý do phiếu:</span>
                      <p className="mt-0.5 font-semibold text-slate-800">
                        {detail.reason || 'Không có lý do'}
                      </p>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-slate-500">
                        Ghi chú thêm:
                      </span>
                      <p className="mt-0.5 font-semibold text-slate-800">
                        {detail.note || 'Không có ghi chú'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bảng danh sách sản phẩm & So sánh Tồn kho thực tế */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800">Danh sách hàng hóa trong phiếu</h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase text-slate-600">
                        <th className="px-3 py-3">Mã hàng</th>
                        <th className="px-3 py-3">Tên sản phẩm</th>
                        {type === 'INWARD' && (
                          <th className="px-3 py-3 text-right">Đơn giá nhập</th>
                        )}
                        {isCompleted && (
                          <th className="px-3 py-3 text-right text-slate-500">Tồn trước</th>
                        )}
                        <th className="px-3 py-3 text-right font-extrabold text-sky-700">
                          {type === 'INWARD' ? '+ Nhập vào' : '- Xuất đi'}
                        </th>
                        {isCompleted && (
                          <th className="px-3 py-3 text-right text-emerald-700">Tồn sau</th>
                        )}
                        {type === 'INWARD' && <th className="px-3 py-3 text-right">Thành tiền</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {!detail.items || detail.items.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-400">
                            Không có sản phẩm nào
                          </td>
                        </tr>
                      ) : (
                        detail.items.map((item, idx) => {
                          const qty = Number(item.quantity || 0);
                          const sysQty = Number(item.systemQuantity ?? item.actualQuantity ?? 0);
                          const afterQty =
                            item.actualQuantity !== undefined
                              ? Number(item.actualQuantity)
                              : type === 'INWARD'
                                ? sysQty + qty
                                : sysQty - qty;

                          return (
                            <tr key={item.ticketItemId || idx} className="hover:bg-slate-50/60">
                              <td className="px-3 py-3 font-bold text-slate-800">
                                {item.productCode || 'N/A'}
                              </td>
                              <td className="px-3 py-3 font-medium text-slate-800">
                                {item.productName || 'Sản phẩm'}
                              </td>
                              {type === 'INWARD' && (
                                <td className="px-3 py-3 text-right text-slate-600">
                                  {formatCurrency(item.costPrice)}
                                </td>
                              )}
                              {isCompleted && (
                                <td className="px-3 py-3 text-right font-medium text-slate-500">
                                  {item.systemQuantity !== undefined ? item.systemQuantity : '---'}
                                </td>
                              )}
                              <td className="px-3 py-3 text-right font-extrabold text-sky-700">
                                {qty}
                              </td>
                              {isCompleted && (
                                <td className="px-3 py-3 text-right font-bold text-emerald-700">
                                  {afterQty}
                                </td>
                              )}
                              {type === 'INWARD' && (
                                <td className="px-3 py-3 text-right font-bold text-slate-900">
                                  {formatCurrency(qty * Number(item.costPrice || 0))}
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Modal */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="text-xs text-slate-500">
            {isPending && '💡 Phiếu đang lưu nháp. Cần xác nhận để cập nhật vào tồn kho thực tế.'}
            {isCompleted && '💡 Phiếu đã hoàn tất. Tồn kho đã được hạch toán vào hệ thống.'}
            {isCancelled && '💡 Phiếu đã bị hủy bỏ và vô hiệu lực.'}
          </div>

          <div className="flex items-center gap-2">
            {/* NÚT HỦY NHÁP TRỰC TIẾP TRONG MODAL */}
            {isPending && (
              <button
                type="button"
                disabled={isConfirming || isSavingEdit}
                onClick={async () => {
                  if (!window.confirm('Bạn có chắc chắn muốn hủy phiếu nháp này không?')) return;
                  try {
                    if (type === 'INWARD')
                      await cancelInwardInventory(ticketId, 'Hủy phiếu nháp từ Modal chi tiết');
                    else await cancelOutwardInventory(ticketId, 'Hủy phiếu nháp từ Modal chi tiết');

                    onNotify &&
                      onNotify({ type: 'success', message: 'Đã hủy phiếu nháp thành công!' });
                    onReload && onReload();
                    onClose();
                  } catch (e) {
                    onNotify &&
                      onNotify({ type: 'error', message: 'Không thể hủy phiếu nháp này' });
                  }
                }}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50"
              >
                Hủy phiếu nháp
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Đóng
            </button>

            {/* NÚT DUYỆT PHIẾU NGAY TRONG MODAL */}
            {canConfirm && isPending && (
              <button
                type="button"
                disabled={isConfirming}
                onClick={handleConfirm}
                className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-60"
              >
                <CheckCircle2 size={18} />
                {isConfirming ? 'Đang duyệt kho...' : 'Xác nhận duyệt kho ngay'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
