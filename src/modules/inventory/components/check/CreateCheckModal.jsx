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
 * CreateCheckModal
 * - Cho phép chọn sản phẩm từ kho chi nhánh hiện tại (backend tự resolve từ JWT)
 * - Owner có thể chọn assignee; Staff tự gán cho chính mình
 * - Gọi onSave(productIds, notes, assigneeUserId) khi submit
 */
const CreateCheckModal = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  const isOwner = hasRole(user?.roles, 'Owner');
  const canCreate = hasPermission(user, 'STOCK_CHECK_CREATE');
  const canApprove = hasPermission(user, 'STOCK_CHECK_APPROVE');
  const canManageAssign = isOwner || canCreate || canApprove;
  const hasCountPerm = hasPermission(user, 'STOCK_CHECK_COUNT');
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

  // Reset khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedIds([]);
      setNotes('');
      setAssigneeUserId('');
      setSearch('');
      setProducts([]);
      setStaffList([]);
      setError('');
      setSubmitting(false);
    }
  }, [isOpen]);

  // Fetch sản phẩm - backend tự resolve chi nhánh từ JWT, không cần truyền branchId
  useEffect(() => {
    if (!isOpen) return;

    setLoadingProducts(true);
    getProductsLookup({ pageSize: 200 })
      .then((res) => {
        if (res?.success && res.data) {
          setProducts(res.data.items || res.data || []);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => {
        console.error('Lỗi lấy danh sách sản phẩm:', err);
        setProducts([]);
      })
      .finally(() => setLoadingProducts(false));
  }, [isOpen]);

  // Fetch staff - chỉ Owner mới cần; filter theo permission có STOCK_CHECK_CREATE
  useEffect(() => {
    if (!isOpen || (!isOwner && !canCreate && !canApprove)) return;

    setLoadingStaff(true);
    const me = { userId: currentUserId, fullName: user?.fullName || 'Tôi' };
    getStaffs({ pageSize: 100 })
      .then((res) => {
        const staffs = res?.data?.items || res?.data || [];
        const qualified = Array.isArray(staffs) ? staffs.filter(s => {
          const roles = s.roles || [];
          const perms = s.permissionCodes || [];
          return roles.includes('Owner') || perms.includes('STOCK_CHECK_COUNT') || perms.includes('STOCK_CHECK_CREATE');
        }) : [];
        if ((hasCountPerm || isOwner) && !qualified.find((s) => s.userId === currentUserId)) {
          qualified.unshift(me);
        }
        setStaffList(qualified);
      })
      .catch(() => {
        setStaffList(hasCountPerm || isOwner ? [me] : []);
      })
      .finally(() => setLoadingStaff(false));
  }, [isOpen, isOwner, canCreate, canApprove, currentUserId, hasCountPerm, user?.fullName]);

  // Chi tu gan neu current user co quyen STOCK_CHECK_COUNT
  useEffect(() => {
    if (!isOpen || isOwner) return;
    if (hasCountPerm) {
      setAssigneeUserId(currentUserId);
    } else {
      setAssigneeUserId('');
    }
  }, [isOpen, isOwner, currentUserId, hasCountPerm]);

  const filteredProducts = products.filter(
    (p) =>
      p.productName?.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Khi chọn tất cả: thêm tất cả filtered vào selected (giữ lại những cái đã chọn ở trang khác)
  // Khi bỏ chọn tất cả: chỉ xóa những cái đang visible trong filtered
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
    if (!assigneeUserId) {
      setError('Vui lòng chọn Người phụ trách đếm!');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      // Staff: assigneeUserId = currentUserId (đã set từ useEffect)
      // Owner: assigneeUserId = giá trị chọn từ dropdown, hoặc null nếu để trống
      await onSave(
        selectedIds,
        notes,
        canManageAssign ? assigneeUserId || null : currentUserId
      );
    } catch {
      // Error được xử lý bởi parent
    } finally {
      setSubmitting(false);
    }
  };

  // Định nghĩa cột cho Shared Table
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

  // Footer cho Modal
  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={submitting}>
        Hủy
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={selectedIds.length === 0 || submitting}
        loading={submitting}
        className="flex items-center gap-2"
      >
        {!submitting && <Icon name="save" size={20} />}
        {submitting ? 'Đang tạo...' : 'Tạo phiếu kiểm kê'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Phiếu Kiểm Kê Mới"
      size="4xl"
      footer={modalFooter}
    >
      <div className="-mt-2 mb-6 text-sm text-slate-500 dark:text-[#999999]">
        Chọn sản phẩm từ kho để bắt đầu kiểm đếm
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Ghi chú */}
        <div className="col-span-3 md:col-span-2">
          <Textarea
            label="Mục đích / Ghi chú"
            placeholder="VD: Kiểm kê định kỳ cuối tháng..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={1}
          />
        </div>

        {/* Người phụ trách */}
        {canManageAssign ? (
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              Người phụ trách
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-[#004785] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5] dark:disabled:bg-[#1a1a1a]"
              value={assigneeUserId}
              onChange={(e) => setAssigneeUserId(e.target.value)}
              disabled={loadingStaff}
            >
              <option value="">-- Chọn người phụ trách --</option>
              {(hasCountPerm || isOwner) && (
                <option value={currentUserId}>Tự giao cho tôi</option>
              )}
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
          </div>
        ) : (
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              Người phụ trách
            </label>
            <div className="w-full rounded-lg border border-slate-200 bg-gray-50 px-3 py-2 text-sm text-slate-600 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#999999]">
              {user?.fullName || user?.email || 'Bạn'} (tự gán)
            </div>
          </div>
        )}
      </div>

      {/* Danh sách sản phẩm */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-[#e5e5e5]">
          Danh sách Sản phẩm
          <span className="ml-2 font-normal text-slate-500 dark:text-[#999999]">
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

      <div className="max-h-[350px] overflow-y-auto rounded-lg border border-slate-200 bg-white dark:border-[#333333] dark:bg-[#0f0f0f]">
        <Table
          columns={tableColumns}
          data={filteredProducts}
          loading={loadingProducts}
          emptyMessage="Không tìm thấy sản phẩm nào trong kho"
          className="border-none" // Bỏ border ngoài cùng để tránh bị double border với div bọc ngoài
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

export default CreateCheckModal;
