import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import { useStaffManager } from '../hooks/useStaffManager';
import StaffTable from '../components/staff/StaffTable';
import StaffModal from '../components/staff/StaffModal';
import AssignBranchModal from '../components/staff/AssignBranchModal';

const StaffManagement = () => {
  const {
    staffs,
    branches,
    loading,
    search,
    setSearch,
    page,
    setPage,
    paginationMeta,
    handleCreateStaff,
    handleUpdateStaff,
    handleToggleStatus,
    handleAssignBranch,
    handleUnassignBranch,
  } = useStaffManager();

  // State cho Form Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // ---> BỔ SUNG STATE VÀ HÀM CHO MODAL ĐIỀU CHUYỂN <---
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState(null);

  const openAssignModal = (staff) => {
    setAssigningStaff(staff);
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
    setAssigningStaff(null);
  };

  const onConfirmAssign = (staffId, branchId) => {
    handleAssignBranch(staffId, branchId, closeAssignModal);
  };
  // --------------------------------------------------------

  const openModal = (staff = null) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const onSave = (formData) => {
    if (editingStaff) {
      // Logic biên dịch Role thành mảng PermissionCodes chuẩn của Backend
      let updatedPermissions = [];
      if (formData.defaultRoleType === 'SalesStaff') {
        updatedPermissions = ['POS_SALE', 'RETURN_PROCESS', 'CUSTOMER_MANAGE'];
      } else {
        updatedPermissions = ['STOCK_VIEW', 'STOCK_MANAGE', 'STOCK_TRANSFER'];
      }

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        branchId: formData.branchId || null,
        password: formData.password || undefined, // Chỉ gửi pass nếu có nhập
        isActive: formData.isActive, // Mở chức năng đổi trạng thái
        permissionCodes: updatedPermissions, // Cập nhật luôn Role mới
      };

      handleUpdateStaff(editingStaff.userId, payload, closeModal);
    } else {
      handleCreateStaff(formData, closeModal);
    }
  };

  return (
    <div className="animate-fade-in w-full space-y-4 text-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Nhân sự</h1>
          <p className="mt-1 text-gray-600">Tạo tài khoản và phân bổ chi nhánh cho nhân viên</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 rounded-lg bg-[#004785] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
        >
          <Icon name="add" size={20} />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex w-1/3 items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <Icon name="search" className="text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo tên hoặc email..."
          className="w-full bg-transparent text-sm focus:outline-none"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <StaffTable
        staffs={staffs}
        loading={loading}
        onEdit={openModal}
        onToggleStatus={handleToggleStatus}
        onAssign={openAssignModal}
        onUnassign={handleUnassignBranch}
      />

      {/* Phân trang */}
      {paginationMeta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border p-2 hover:bg-slate-50 disabled:opacity-50"
          >
            <Icon name="chevron_left" />
          </button>
          <span className="text-sm font-semibold">
            Trang {page} / {paginationMeta.totalPages}
          </span>
          <button
            disabled={page >= paginationMeta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border p-2 hover:bg-slate-50 disabled:opacity-50"
          >
            <Icon name="chevron_right" />
          </button>
        </div>
      )}

      <StaffModal
        isOpen={isModalOpen}
        onClose={closeModal}
        staff={editingStaff}
        branches={branches}
        onSave={onSave}
      />

      <AssignBranchModal
        isOpen={isAssignModalOpen}
        onClose={closeAssignModal}
        staff={assigningStaff}
        branches={branches}
        onSave={onConfirmAssign}
      />
    </div>
  );
};

export default StaffManagement;
