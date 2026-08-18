import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import { getProductsLookup } from '../../services/inventoryService';
import { getStaffs } from '../../../owner/services/staffService';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { hasPermission } from '../../../../shared/utils/permissions';
import { hasRole } from '../../../../shared/utils/roleRedirect';

// Import Shared Components
import Modal from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import Textarea from '../../../../shared/components/Textarea';
import Table from '../../../../shared/components/Table';

/**
 * EditCheckModal
 * - Chỉ dùng khi phiếu đang ở trạng thái Draft
 * - Tính toán addProductIds / removeProductIds dựa trên diff so với danh sách ban đầu
 * - Owner có thể đổi assignee; Staff chỉ có thể gán cho chính mình
 * - Gọi onSave(ticketId, payload) với payload: { notes, assigneeUserId, addProductIds, removeProductIds }
 */
const EditCheckModal = ({ isOpen, onClose, detailData, onSave }) => {
  const { user } = useAuth();
  const isOwner = hasRole(user?.roles, 'Owner');
  const canCreate = hasPermission(user, 'STOCK_CHECK_CREATE');
  const canApprove = hasPermission(user, 'STOCK_CHECK_APPROVE');
  const canManageAssign = isOwner || canCreate || canApprove;
  const currentUserId = user?.userId || user?.id;

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');

  const [assigneeUserId, setAssigneeUserId] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Lấy branchId từ detailData để làm context
  const branchId = detailData?.branchId;

  // Khởi tạo dữ liệu từ detailData khi mở modal
  useEffect(() => {
    if (!isOpen || !detailData) {
      setSearch('');
      setError('');
      return;
    }

    setNotes(detailData.notes || '');
    setAssigneeUserId(detailData.assigneeUserId || '');
    setError('');
    setSubmitting(false);

    // Init selected = sản phẩm hiện có trong phiếu
    const initialProductIds = (detailData.details || []).map((d) => d.productId).filter(Boolean);
    setSelectedIds(initialProductIds);

    // Fetch sản phẩm trong chi nhánh
    setLoadingProducts(true);
    getProductsLookup({ pageSize: 200 })
      .then((res) => {
        if (res?.success && res.data) {
          setProducts(res.data.items || res.data || []);
        }
      })
      .catch((err) => console.error('Lỗi lấy sản phẩm:', err))
      .finally(() => setLoadingProducts(false));

    // Fetch staff - chỉ Owner/người quản lý mới cần; CHỈ lấy nhân viên được cấp quyền "Đếm sản phẩm kiểm kê" (STOCK_CHECK_COUNT)
    if (canManageAssign) {
        setLoadingStaff(true);
        const hasCountPerm = hasPermission(user, 'STOCK_CHECK_COUNT');
        const me = { userId: currentUserId, fullName: user?.fullName || 'Tôi' };
        getStaffs({ pageSize: 100, view: 'active' })
          .then((res) => {
            const staffs = res?.data?.items || res?.data || [];
            const qualified = Array.isArray(staffs) ? staffs.filter(s => {
              // 1. Bỏ qua tài khoản đã xóa hoặc bị khóa
              if (s.isDeleted || s.status === 'DELETED' || s.status === 'PERMANENT_DELETED' || s.isActive === 0) return false;
              if (s.fullName?.includes('(Đã xóa)') || s.email?.startsWith('deleted_') || s.email?.startsWith('del_') || s.email?.endsWith('@mep.deleted')) return false;

              // 2. CHỈ LẤY nhân viên được cấp quyền ĐẾM sản phẩm kiểm kê (STOCK_CHECK_COUNT)
              const perms = s.permissionCodes || [];
              return perms.includes('STOCK_CHECK_COUNT');
            }) : [];

            if ((hasCountPerm || isOwner) && !qualified.find((s) => s.userId === currentUserId)) {
              qualified.unshift(me);
            }
            setStaffList(qualified);
          })
          .catch((err) => {
            console.error('Lỗi tải danh sách nhân viên:', err);
            setStaffList(hasCountPerm || isOwner ? [me] : []);
          })
        .finally(() => setLoadingStaff(false));
    } else {
      setAssigneeUserId(currentUserId);
    }
  }, [isOpen, detailData, branchId, isOwner, currentUserId, canCreate, canApprove]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || !detailData) return null;

  const filteredProducts = products.filter(
    (p) =>
      p.productName?.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = (checked) => {
    const filteredIds = filteredProducts.map((p) => p.productId).filter(Boolean);
    if (checked) {
      setSelectedIds((prev) => {
        const combined = new Set([...prev, ...filteredIds]);
        return Array.from(combined);
      });
    } else {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    }
  };

  const allFilteredSelected =
    filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.includes(p.productId));

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      setError('Vui lòng chọn ít nhất 1 sản phẩm để kiểm kê!');
      return;
    }
    setError('');

    const originalIds = (detailData.details || []).map((d) => d.productId).filter(Boolean);
    const addProductIds = selectedIds.filter((id) => !originalIds.includes(id));
    const removeProductIds = originalIds.filter((id) => !selectedIds.includes(id));

    const payload = {
      notes,
      assigneeUserId: canManageAssign ? assigneeUserId || null : currentUserId,
      addProductIds,
      removeProductIds,
    };

    setSubmitting(true);
    try {
      await onSave(detailData.ticketId, payload);
    } catch {
      // Xử lý lỗi bên ngoài
    } finally {
      setSubmitting(false);
    }
  };

  const tableColumns = [
    {
      key: 'checkbox',
      width: '50px',
      header: (
        <div className="text-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={allFilteredSelected}
            onChange={(e) => toggleSelectAll(e.target.checked)}
          />
        </div>
      ),
      render: (_, p) => (
        <div className="text-center">
          <input
            type="checkbox"
            checked={selectedIds.includes(p.productId)}
            onChange={() => toggleSelect(p.productId)}
            className="h-4 w-4 cursor-pointer"
          />
        </div>
      ),
    },
    {
      key: 'productCode',
      header: 'Mã SP',
      render: (val) => <span className="font-semibold text-slate-700">{val}</span>,
    },
    {
      key: 'productName',
      header: 'Tên SP',
    },
    {
      key: 'stock',
      header: <div className="text-center">Tồn Hệ Thống</div>,
      render: (_, p) => {
        const stock = p.actualStock ?? p.availableStock ?? 0;
        return (
          <div
            className={`text-center font-bold ${stock === 0 ? 'text-slate-400' : 'text-slate-700'}`}
          >
            {stock}
          </div>
        );
      },
    },
  ];

  // Đã đồng bộ kích thước 2 nút bằng flex, h-[42px], items-center, justify-center
  const modalFooter = (
    <div className="flex w-full items-center justify-end gap-3">
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={submitting}
        className="flex h-[42px] min-w-[100px] items-center justify-center"
      >
        Hủy bỏ
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={selectedIds.length === 0 || submitting}
        loading={submitting}
        className="flex h-[42px] min-w-[150px] items-center justify-center gap-2"
      >
        {!submitting && <Icon name="save" size={20} />}
        {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          Cập nhật Phiếu: <span className="text-[#004785]">{detailData.ticketCode}</span>
        </div>
      }
      size="4xl"
      footer={modalFooter}
    >
      <div className="-mt-2 mb-6 text-sm italic text-slate-500">
        Chỉ có thể chỉnh sửa khi phiếu đang ở trạng thái Nháp
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Textarea
            label="Mục đích / Ghi chú"
            placeholder="VD: Kiểm kê định kỳ..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Người phụ trách</label>
          {canManageAssign ? (
            <>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-[#004785] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
                value={assigneeUserId}
                onChange={(e) => setAssigneeUserId(e.target.value)}
                disabled={loadingStaff}
              >
                <option value="">-- Chưa gán (Để trống) --</option>
                <option value={currentUserId}>Tự giao cho tôi</option>
                {staffList
                  .filter((staff) => staff.userId !== currentUserId)
                  .map((staff) => (
                    <option key={staff.userId} value={staff.userId}>
                      {staff.fullName || staff.email}
                    </option>
                  ))}
              </select>
              {loadingStaff && (
                <span className="mt-1 inline-block text-xs text-slate-500">
                  Đang tải nhân viên...
                </span>
              )}
            </>
          ) : (
            <div className="w-full rounded-lg border border-slate-200 bg-gray-50 px-3 py-2 text-sm text-slate-600">
              {user?.fullName || user?.email || 'Bạn'} (tự gán)
            </div>
          )}
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-bold text-slate-800">
          Danh sách Hàng hóa
          <span className="ml-2 font-normal text-slate-500">
            ({filteredProducts.length} sản phẩm)
          </span>
        </h3>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Tìm tên, mã SP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Icon name="search" size={18} />}
          />
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto rounded-lg border border-slate-200 bg-white">
        <Table
          columns={tableColumns}
          data={filteredProducts}
          loading={loadingProducts}
          emptyMessage="Không tìm thấy sản phẩm"
          className="border-none"
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Đã chọn: <strong className="text-[#004785]">{selectedIds.length}</strong> sản phẩm
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
    </Modal>
  );
};

export default EditCheckModal;
