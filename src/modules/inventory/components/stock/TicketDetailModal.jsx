import { useState, useEffect, useRef } from 'react';
import {
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
  getInwardReturnableItems,
} from '../../services/inventoryService';
import { getSupplierDetail } from '../../services/supplierService';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import IconButton from '../../../../shared/components/IconButton';
import { Input } from '../../../../shared/components/Input';
import { Textarea } from '../../../../shared/components/Textarea';
import { Badge } from '../../../../shared/components/Badge';
import CancelTicketModal from './CancelTicketModal';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val || 0));

const renderTicketTypeLabel = (ticketType, type) => {
  const key = ticketType?.toUpperCase();
  switch (key) {
    case 'PURCHASE':
      return 'Nhập hàng từ NCC';
    case 'CUSTOMER_RETURN':
      return 'Khách hàng trả lại';
    case 'BALANCE_ADJUST':
      return 'Cân bằng kiểm kho';
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
  const [returnableMap, setReturnableMap] = useState({});

  const [isEditing, setIsEditing] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [editNote, setEditNote] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Cancel modal (dùng chung pattern như table Lịch sử phiếu nhập)
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

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
          setEditReason(
            data.reason || (data.ticketType === 'CUSTOMER_RETURN' ? 'Khách hàng trả' : '')
          );
          setEditNote(data.note || (data.ticketType === 'CUSTOMER_RETURN' ? 'Khách hàng trả' : ''));

          // Tra cứu tên nhà cung cấp từ supplierId
          if (type === 'INWARD' && data.supplierId) {
            try {
              const supRes = await getSupplierDetail(data.supplierId);
              const supData = supRes?.data || supRes;
              data._partyName = supData?.name || supData?.supplierName || '';
            } catch {
              data._partyName = '';
            }
          } else if (type === 'OUTWARD') {
            // Tra cứu từ localStorage (lưu khi tạo phiếu xuất)
            try {
              data._partyName = (
                localStorage.getItem(`outward_party_${data.ticketCode}`) || ''
              ).replace(/^.*?:\s*/g, '');
            } catch {} // eslint-disable-line no-empty
          }
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

  // Fetch returnable items data for RETURN_SUPPLIER tickets with inward reference
  useEffect(() => {
    if (!detail || detail.ticketType !== 'RETURN_SUPPLIER' || !detail.inwardTicketId) {
      setReturnableMap({});
      return;
    }
    const fetchReturnable = async () => {
      try {
        const res = await getInwardReturnableItems(detail.inwardTicketId);
        const items = res?.data?.items || res?.data || [];
        if (Array.isArray(items)) {
          const map = {};
          items.forEach((ri) => {
            map[ri.inwardTicketItemId] = {
              maxReturnable: ri.maxReturnableQuantity || 0,
              originalQty: ri.originalQuantity || 0,
              actualStock: ri.actualStock || 0,
            };
          });
          setReturnableMap(map);
        }
      } catch {
        setReturnableMap({});
      }
    };
    fetchReturnable();
  }, [detail?.inwardTicketId, detail?.ticketType]);

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
      let msg;
      if (error?.status === 409 || error?.status === 400) {
        msg = 'Phiếu này đã được duyệt trước đó! Tồn kho đã được hạch toán.';
        window.alert(msg);
      } else {
        const errList = error?.data?.errors;
        msg = Array.isArray(errList)
          ? errList.join(' | ')
          : error?.message || 'Lỗi khi xác nhận phiếu';
        onNotify && onNotify({ type: 'error', message: msg });
      }
      onReload && onReload();
      onClose();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    try {
      const statusUpper = detail?.status?.toUpperCase();
      let payload = {};

      if (statusUpper === 'PENDING') {
        payload = { reason: editReason.trim(), note: editNote.trim() };
      } else if (statusUpper === 'COMPLETED') {
        // COMPLETED: chỉ được sửa Note theo tài liệu API.
        // KHÔNG gửi field reason nữa (khác code gốc) để tránh trường hợp
        // backend validate strict field reason khi ticket đã COMPLETED.
        payload = { note: editNote.trim() };
      } else {
        throw new Error('Phiếu đã hủy không thể chỉnh sửa thông tin.');
      }

      if (type === 'INWARD') {
        await updateInwardInventory(ticketId, payload);
      } else {
        await updateOutwardInventory(ticketId, payload);
      }

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
      const errList = error?.data?.errors;
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
  const isCustomerReturn = detail?.ticketType === 'CUSTOMER_RETURN';
  const isReturnSupplier = detail?.ticketType === 'RETURN_SUPPLIER';
  const hasInwardRef = isReturnSupplier && !!detail?.inwardTicketId;
  const hidePriceFields = isCustomerReturn || isReturnSupplier;

  const canEditReason = isPending;
  const canEditNote = isPending || isCompleted;
  const canConfirm = detail?.canConfirm ?? isPending;

  const handleCancelDraft = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async (reason) => {
    setIsCancelling(true);
    try {
      if (type === 'INWARD') await cancelInwardInventory(ticketId, reason);
      else await cancelOutwardInventory(ticketId, reason);

      setShowCancelModal(false);
      onNotify && onNotify({ type: 'success', message: 'Đã hủy phiếu nháp thành công!' });
      onReload && onReload();
      onClose();
    } catch (e) {
      onNotify && onNotify({ type: 'error', message: 'Không thể hủy phiếu nháp này' });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 font-bold text-[#004785] dark:bg-blue-900/50">
              <Package size={20} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">
                Chi tiết phiếu {type === 'INWARD' ? 'Nhập kho' : 'Xuất kho'}
              </span>
              <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-[#272727] dark:text-[#b3b3b3]">
                {detail?.ticketCode || ticketId}
              </span>
            </div>
          </div>
        }
        footer={
          <>
            {isPending && (
              <Button
                variant="danger"
                onClick={handleCancelDraft}
                disabled={isConfirming || isSavingEdit}
              >
                Hủy phiếu nháp
              </Button>
            )}
            {canConfirm && isPending && (
              <Button
                variant="success"
                onClick={handleConfirm}
                disabled={isConfirming}
                className="flex items-center gap-2"
              >
                <CheckCircle2 size={18} />
                {isConfirming ? 'Đang duyệt kho...' : 'Xác nhận duyệt kho ngay'}
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 dark:text-[#808080]">
              Đang tải thông tin chi tiết phiếu...
            </div>
          ) : !detail ? (
            <div className="py-16 text-center text-red-500 dark:text-red-400">
              Không tìm thấy dữ liệu phiếu kho.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-[#333333] dark:bg-[#1a1a1a] sm:grid-cols-4">
                <div>
                  <span className="block text-xs font-semibold uppercase text-slate-500 dark:text-[#999999]">
                    Trạng thái
                  </span>
                  <div className="mt-1">
                    {isCompleted && (
                      <Badge variant="success" size="sm" className="inline-flex items-center gap-1">
                        <CheckCircle2 size={14} /> Hoàn tất
                      </Badge>
                    )}
                    {isPending && (
                      <Badge
                        variant="warning"
                        size="sm"
                        className="inline-flex animate-pulse items-center gap-1"
                      >
                        <Clock size={14} /> Chờ duyệt kho
                      </Badge>
                    )}
                    {isCancelled && (
                      <Badge
                        variant="secondary"
                        size="sm"
                        className="inline-flex items-center gap-1"
                      >
                        <XCircle size={14} /> Đã hủy
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-slate-500 dark:text-[#999999]">
                    Người lập phiếu
                  </span>
                  <div className="mt-1 flex items-center gap-1 font-semibold text-slate-800 dark:text-[#d4d4d4]">
                    <User size={14} className="text-slate-400 dark:text-[#808080]" />{' '}
                    {detail.userName || 'Hệ thống'}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-slate-500 dark:text-[#999999]">
                    Thời gian
                  </span>
                  <div className="mt-1 flex items-center gap-1 font-semibold text-slate-800 dark:text-[#d4d4d4]">
                    <CalendarClock size={14} className="text-slate-400 dark:text-[#808080]" />
                    {detail.createdAt ? new Date(detail.createdAt).toLocaleString('vi-VN') : '---'}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-slate-500 dark:text-[#999999]">
                    Phân loại
                  </span>
                  <div className="mt-1 font-bold text-[#004785]">
                    {renderTicketTypeLabel(detail.ticketType, type)}
                  </div>
                </div>
                {type === 'OUTWARD' && (
                  <div className="sm:col-span-4">
                    <span className="block text-xs font-semibold uppercase text-slate-500 dark:text-[#999999]">
                      Đối tượng
                    </span>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-[#d4d4d4]">
                      {detail._partyName || '---'}
                    </div>
                  </div>
                )}
                {type === 'INWARD' && (
                  <div className="sm:col-span-4">
                    <span className="block text-xs font-semibold uppercase text-slate-500 dark:text-[#999999]">
                      Nhà cung cấp
                    </span>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-[#d4d4d4]">
                      {detail._partyName || '---'}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-[#333333]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-b-[#333333]">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-[#d4d4d4]">
                    <FileText size={16} className="text-slate-500 dark:text-[#999999]" /> Ghi chú &
                    Lý do giải trình
                  </span>
                  {!isCancelled && !isEditing && (
                    <IconButton
                      icon={Edit3}
                      variant="outline"
                      space="customer"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      title="Chỉnh sửa ghi chú"
                    />
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3 pt-1">
                    <Input
                      label={`Lý do nghiệp vụ ${canEditReason ? '' : '(Phiếu đã hoàn tất - Không được sửa Lý do)'}`}
                      disabled={!canEditReason || isSavingEdit}
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                    />
                    <Textarea
                      label={`Ghi chú bổ sung ${canEditNote ? '' : '(Không được phép sửa)'}`}
                      rows={2}
                      disabled={!canEditNote || isSavingEdit}
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        disabled={isSavingEdit}
                      >
                        Hủy bỏ
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={isSavingEdit}
                        className="flex items-center gap-1"
                      >
                        <Save size={13} /> {isSavingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <span className="block text-xs font-medium text-slate-500 dark:text-[#999999]">
                        Lý do phiếu:
                      </span>
                      <p className="mt-0.5 font-semibold text-slate-800 dark:text-[#d4d4d4]">
                        {(() => {
                          const raw = detail.reason || '';
                          if (isCustomerReturn && (!raw || raw === 'Nhập kho'))
                            return 'Khách hàng trả';
                          return raw || 'Không có lý do';
                        })()}
                      </p>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-slate-500 dark:text-[#999999]">
                        Ghi chú thêm:
                      </span>
                      <p className="mt-0.5 font-semibold text-slate-800 dark:text-[#d4d4d4]">
                        {(() => {
                          const raw = detail.note || '';
                          if (isCustomerReturn && (!raw || raw === 'Nhập kho'))
                            return 'Khách hàng trả';
                          return raw || 'Không có ghi chú';
                        })()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-[#d4d4d4]">
                  Danh sách hàng hóa trong phiếu
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#333333]">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase text-slate-600 dark:border-b-[#333333] dark:bg-[#1a1a1a] dark:text-[#999999]">
                        <th className="px-3 py-3">Mã hàng</th>
                        <th className="px-3 py-3">Tên sản phẩm</th>
                        <th className="w-16 px-3 py-3 text-center">ĐVT</th>
                        {type === 'INWARD' && !hidePriceFields && (
                          <th className="px-3 py-3 text-right">Đơn giá nhập</th>
                        )}
                        {type === 'OUTWARD' && <th className="px-3 py-3 text-right">Đơn giá</th>}
                        {isCompleted && !hasInwardRef && (
                          <th className="px-3 py-3 text-right text-slate-500 dark:text-[#999999]">
                            Tồn trước
                          </th>
                        )}
                        {isCompleted && hasInwardRef && (
                          <th className="px-3 py-3 text-right text-slate-500 dark:text-[#999999]">
                            SL có thể trả
                          </th>
                        )}
                        <th className="px-3 py-3 text-right font-extrabold text-[#004785]">
                          {type === 'INWARD' ? 'Nhập vào' : 'Xuất đi'}
                        </th>
                        {isCompleted && !hasInwardRef && (
                          <th className="px-3 py-3 text-right text-green-700">Tồn sau</th>
                        )}
                        {isCompleted && hasInwardRef && (
                          <th className="px-3 py-3 text-right text-green-700">Tồn sau xuất</th>
                        )}
                        {type === 'INWARD' && !hidePriceFields && (
                          <th className="px-3 py-3 text-right">Thành tiền</th>
                        )}
                        {type === 'OUTWARD' && <th className="px-3 py-3 text-right">Thành tiền</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                      {!detail.items || detail.items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-6 text-center text-slate-400 dark:text-[#808080]"
                          >
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
                            <tr
                              key={item.ticketItemId || idx}
                              className="hover:bg-slate-50/60 dark:hover:bg-[#272727]/60"
                            >
                              <td className="px-3 py-3 font-bold text-slate-800 dark:text-[#d4d4d4]">
                                {item.productCode || 'N/A'}
                              </td>
                              <td className="px-3 py-3 font-medium text-slate-800 dark:text-[#d4d4d4]">
                                {item.productName || 'Sản phẩm'}
                              </td>
                              <td className="px-3 py-3 text-center text-slate-600 dark:text-[#999999]">
                                {item.unit || item.Unit || item.unitName || item.UnitName || '---'}
                              </td>
                              {type === 'INWARD' && !hidePriceFields && (
                                <td className="px-3 py-3 text-right text-slate-600 dark:text-[#999999]">
                                  {formatCurrency(item.costPrice)}
                                </td>
                              )}
                              {type === 'OUTWARD' && (
                                <td className="px-3 py-3 text-right text-slate-600 dark:text-[#999999]">
                                  {formatCurrency(item.unitPrice || item.UnitPrice || 0)}
                                </td>
                              )}
                              {isCompleted && !hasInwardRef && (
                                <td className="px-3 py-3 text-right font-medium text-slate-500 dark:text-[#999999]">
                                  {item.systemQuantity !== undefined ? item.systemQuantity : '---'}
                                </td>
                              )}
                              {isCompleted && hasInwardRef && (
                                <td className="px-3 py-3 text-right font-medium text-slate-500 dark:text-[#999999]">
                                  {item.inwardTicketItemId && returnableMap[item.inwardTicketItemId]
                                    ? Math.min(
                                        returnableMap[item.inwardTicketItemId].maxReturnable,
                                        returnableMap[item.inwardTicketItemId].actualStock
                                      )
                                    : item.inwardTicketItemId
                                      ? 0
                                      : '---'}
                                </td>
                              )}
                              <td className="px-3 py-3 text-right font-extrabold text-[#004785]">
                                {qty}
                              </td>
                              {isCompleted && !hasInwardRef && (
                                <td className="px-3 py-3 text-right font-bold text-green-700">
                                  {afterQty}
                                </td>
                              )}
                              {isCompleted && hasInwardRef && (
                                <td className="px-3 py-3 text-right font-bold text-green-700">
                                  {item.actualQuantity !== undefined ? item.actualQuantity : '---'}
                                </td>
                              )}
                              {type === 'INWARD' && !hidePriceFields && (
                                <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-[#e5e5e5]">
                                  {formatCurrency(qty * Number(item.costPrice || 0))}
                                </td>
                              )}
                              {type === 'OUTWARD' && (
                                <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-[#e5e5e5]">
                                  {formatCurrency(
                                    qty * Number(item.unitPrice || item.UnitPrice || 0)
                                  )}
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

              <div className="text-xs text-slate-500 dark:text-[#999999]">
                {isPending &&
                  '💡 Phiếu đang lưu nháp. Cần xác nhận để cập nhật vào tồn kho thực tế.'}
                {isCompleted && '💡 Phiếu đã hoàn tất. Tồn kho đã được hạch toán vào hệ thống.'}
                {isCancelled && '💡 Phiếu đã bị hủy bỏ và vô hiệu lực.'}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal xác nhận hủy phiếu với lý do (dùng chung pattern như table Lịch sử) */}
      <CancelTicketModal
        isOpen={showCancelModal}
        onClose={() => !isCancelling && setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        ticketCode={detail?.ticketCode || ticketId}
        ticketStatus={detail?.status}
        isSubmitting={isCancelling}
      />
    </>
  );
};

export default TicketDetailModal;
