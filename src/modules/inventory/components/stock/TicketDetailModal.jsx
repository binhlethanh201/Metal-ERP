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
import { useAuth } from '../../../../shared/hooks/useAuth';
import { hasPermission } from '../../../../shared/utils/permissions';
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
    case 'INVENTORY_CHECK':
    case 'CHECK':
      return 'Cân bằng kiểm kho';
    case 'RETURN_SUPPLIER':
    case 'SUPPLIER_RETURN':
      return 'Trả hàng cho NCC';
    case 'WRITE_OFF':
      return 'Xuất hủy / Hao hụt';
    case 'TRANSFER':
      return 'Xuất điều chuyển nội bộ';
    case 'SALE':
      return 'Xuất kho bán';
    case 'EXCHANGE_IN':
      return 'Nhập đổi hàng';
    case 'EXCHANGE_OUT':
      return 'Xuất đổi hàng';
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
  const { user } = useAuth();
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [returnableMap, setReturnableMap] = useState({});

  // Quyen duyet: STOCK_INWARD_UPDATE (inward) hoac STOCK_OUTWARD_CONFIRM (outward)
  const permCanConfirm =
    type === 'OUTWARD'
      ? hasPermission(user, 'STOCK_OUTWARD_CONFIRM')
      : hasPermission(user, 'STOCK_INWARD_UPDATE');
  // Quyen huy: STOCK_INWARD_DELETE/UPDATE (inward) hoac STOCK_OUTWARD_DELETE/CONFIRM (outward)
  const permCanCancel =
    type === 'OUTWARD'
      ? hasPermission(user, 'STOCK_OUTWARD_DELETE') || hasPermission(user, 'STOCK_OUTWARD_CONFIRM')
      : hasPermission(user, 'STOCK_INWARD_DELETE') || hasPermission(user, 'STOCK_INWARD_UPDATE');

  const [isEditing, setIsEditing] = useState(false);
  const [editReason, setEditReason] = useState('');
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
            data.reason ||
              data.note ||
              (data.ticketType === 'CUSTOMER_RETURN' ? 'Khách hàng trả' : '')
          );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.inwardTicketId, detail?.ticketType]);

  const handleConfirm = async () => {
    if (!canConfirm) {
      onNotify && onNotify({ type: 'error', message: 'Bạn không có quyền duyệt phiếu này.' });
      return;
    }
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
      if (error?.status === 403) {
        msg = 'Bạn không có quyền duyệt phiếu này.';
      } else if (error?.status === 409 || error?.status === 400) {
        msg = 'Phiếu này đã được duyệt trước đó! Tồn kho đã được hạch toán.';
        window.alert(msg);
      } else {
        const errList = error?.data?.errors;
        msg = Array.isArray(errList)
          ? errList.join(' | ')
          : error?.message || 'Lỗi khi xác nhận phiếu';
      }
      onNotify && onNotify({ type: 'error', message: msg });
      onReload && onReload();
      onClose();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!isCreator) {
      onNotify && onNotify({ type: 'error', message: 'Bạn không có quyền chỉnh sửa phiếu này.' });
      return;
    }
    setIsSavingEdit(true);
    try {
      const statusUpper = detail?.status?.toUpperCase();
      let payload = {};
      const combinedText = editReason.trim();

      if (statusUpper === 'PENDING') {
        payload = { reason: combinedText, note: combinedText };
      } else if (statusUpper === 'COMPLETED') {
        payload = { note: combinedText };
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
        reason: combinedText,
        note: combinedText,
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
  const isSale = detail?.ticketType === 'SALE';
  const isExchange =
    isSale && (detail?.reason || detail?.note || '').toLowerCase().includes('doi hang');
  const hasInwardRef = isReturnSupplier && !!detail?.inwardTicketId;
  const hidePriceFields = isCustomerReturn || isReturnSupplier;

  const canConfirm = (detail?.canConfirm ?? isPending) && permCanConfirm;
  // Huy phieu:
  // - PENDING: nguoi tao phieu hoac co quyen xoa / Owner
  // - COMPLETED: chi Owner hoac nguoi co quyen xoa
  const isCreator = detail?.userId && user?.userId && detail.userId === user.userId;
  const isOwner = (user?.roles || []).some((r) => (r || '').toLowerCase() === 'owner');
  const canCancel =
    (isPending && (isCreator || permCanCancel || isOwner)) ||
    (isCompleted && (permCanCancel || isOwner));

  const handleCancelDraft = () => {
    if (!canCancel) {
      onNotify && onNotify({ type: 'error', message: 'Bạn không có quyền hủy phiếu này.' });
      return;
    }
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
      const msg =
        e?.status === 403
          ? 'Bạn không có quyền hủy phiếu này.'
          : e?.message || 'Không thể hủy phiếu nháp này';
      onNotify && onNotify({ type: 'error', message: msg });
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
                disabled={isConfirming || isSavingEdit || !canCancel}
                title={
                  !canCancel
                    ? 'Bạn không có quyền hủy phiếu này (chỉ người tạo phiếu hoặc người có quyền hủy mới được)'
                    : 'Hủy phiếu nháp'
                }
              >
                Hủy phiếu nháp
              </Button>
            )}
            {!isPending && !isCancelled && (
              <Button
                variant="danger"
                onClick={handleCancelDraft}
                disabled={isConfirming || isSavingEdit || !canCancel}
                title={
                  !canCancel
                    ? 'Bạn không có quyền hủy phiếu này (chỉ Owner hoặc người có quyền hủy mới được)'
                    : 'Hủy phiếu'
                }
              >
                Hủy phiếu
              </Button>
            )}
            {isPending && (
              <Button
                variant="success"
                onClick={handleConfirm}
                disabled={isConfirming || !canConfirm}
                className="flex items-center gap-2"
                title={
                  !permCanConfirm
                    ? 'Bạn không có quyền duyệt phiếu này'
                    : 'Xác nhận duyệt để cộng/trừ kho thực tế'
                }
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
                  {!isCancelled && !isEditing && isPending && isCreator && (
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
                    <Textarea
                      label="Lý do / Ghi chú phiếu"
                      rows={3}
                      disabled={isSavingEdit}
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                      placeholder="Nhập lý do hoặc ghi chú cho phiếu..."
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
                  <div className="text-sm">
                    <span className="block text-xs font-medium text-slate-500 dark:text-[#999999]">
                      Lý do / Ghi chú:
                    </span>
                    <p className="mt-0.5 font-semibold text-slate-800 dark:text-[#d4d4d4]">
                      {(() => {
                        const raw = detail.reason || detail.note || '';
                        if (isCustomerReturn && (!raw || raw === 'Nhập kho'))
                          return 'Khách hàng trả';
                        return raw || 'Không có';
                      })()}
                    </p>
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

                          const convertValue = Number(item.convertValue || 1);
                          const isConversion =
                            convertValue > 1 &&
                            item.selectedUnit &&
                            item.baseUnit &&
                            item.selectedUnit !== item.baseUnit;
                          const saleQty = Number(
                            item.saleQuantity ?? (isConversion ? qty / convertValue : qty)
                          );

                          const itemPrice = Number(
                            item.costPrice ??
                              item.CostPrice ??
                              item.unitPrice ??
                              item.UnitPrice ??
                              0
                          );
                          const outPrice = Number(
                            item.sellPrice ??
                              item.unitPrice ??
                              item.UnitPrice ??
                              item.costPrice ??
                              item.CostPrice ??
                              0
                          );
                          const itemTotal = Number(
                            item.totalPrice ?? (isConversion ? saleQty * outPrice : qty * outPrice)
                          );
                          const displayUnit =
                            item.selectedUnit ||
                            item.unitName ||
                            item.UnitName ||
                            item.unit ||
                            item.Unit ||
                            '---';

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
                                <span className="font-medium text-slate-800 dark:text-[#e5e5e5]">
                                  {displayUnit}
                                </span>
                              </td>
                              {type === 'INWARD' && !hidePriceFields && (
                                <td className="px-3 py-3 text-right text-slate-600 dark:text-[#999999]">
                                  {formatCurrency(itemPrice)}
                                </td>
                              )}
                              {type === 'OUTWARD' && (
                                <td className="px-3 py-3 text-right text-slate-600 dark:text-[#999999]">
                                  {formatCurrency(outPrice)}
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
                                {isConversion ? saleQty : qty}
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
                                  {formatCurrency(qty * itemPrice)}
                                </td>
                              )}
                              {type === 'OUTWARD' && (
                                <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-[#e5e5e5]">
                                  {formatCurrency(itemTotal)}
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    {!hidePriceFields && detail?.items?.length > 0 && !isExchange && (
                      <tfoot className="border-t-2 border-slate-200 bg-slate-50/50 dark:border-[#333333] dark:bg-[#1a1a1a]/50">
                        {detail.discountAmount > 0 && (
                          <tr>
                            <td
                              colSpan={isCompleted ? 7 : 5}
                              className="px-3 py-2 text-right font-medium text-slate-500 dark:text-[#999999]"
                            >
                              Chiết khấu đã áp dụng:
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-red-500">
                              -{formatCurrency(detail.discountAmount)}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td
                            colSpan={isCompleted ? 7 : 5}
                            className="px-3 py-3 text-right font-bold text-slate-800 dark:text-[#d4d4d4]"
                          >
                            Tổng thành tiền:
                          </td>
                          <td className="px-3 py-3 text-right font-extrabold text-[#004785] dark:text-blue-400">
                            {formatCurrency(
                              type === 'OUTWARD' && detail?.totalAmount !== undefined && detail?.totalAmount !== null && detail?.totalAmount !== 0
                                ? detail.totalAmount
                                : detail.items.reduce((sum, itm) => {
                                    const q = Number(itm.quantity || 0);
                                    const p = Number(
                                      itm.costPrice ??
                                        itm.CostPrice ??
                                        itm.unitPrice ??
                                        itm.UnitPrice ??
                                        0
                                    );
                                    return sum + q * p;
                                  }, 0)
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                    {isExchange && (detail?.exchangeDeltaAmount ?? 0) !== 0 && (
                      <tfoot className="border-t-2 border-slate-200 dark:border-[#333333]">
                        <tr>
                          <td
                            colSpan={
                              isCompleted && !hasInwardRef ? 7 : isCompleted && hasInwardRef ? 7 : 5
                            }
                            className="px-3 py-3 text-right font-bold text-slate-800 dark:text-[#d4d4d4]"
                          >
                            Thu thêm từ khách (Đổi chênh):
                          </td>
                          <td className="px-3 py-3 text-right font-extrabold text-[#004785] dark:text-[#3b82f6]">
                            {formatCurrency(Math.abs(detail.exchangeDeltaAmount))}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                    {isExchange && (detail?.exchangeDeltaAmount ?? 0) === 0 && (
                      <tfoot className="border-t-2 border-slate-200 dark:border-[#333333]">
                        <tr>
                          <td
                            colSpan={
                              isCompleted && !hasInwardRef ? 7 : isCompleted && hasInwardRef ? 7 : 5
                            }
                            className="px-3 py-3 text-right font-bold text-slate-800 dark:text-[#d4d4d4]"
                          >
                            Thu thêm từ khách (Đổi chênh):
                          </td>
                          <td className="px-3 py-3 text-right font-extrabold text-green-600 dark:text-green-400">
                            0 ₫ (Đổi ngang giá)
                          </td>
                        </tr>
                      </tfoot>
                    )}
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
