import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import { useStaffManager } from '../hooks/useStaffManager';
import StaffTable from '../components/staff/StaffTable';
import StaffModal from '../components/staff/StaffModal';

const StaffManagement = () => {
  const {
    staffs,
    permissions,
    loading,
    detailLoading,
    search,
    setSearch,
    page,
    setPage,
    paginationMeta,
    fetchStaffDetail,
    handleCreateStaff,
    handleUpdateStaff,
    handleToggleStatus,
    handleDeleteStaff,
    currentUserId,
  } = useStaffManager();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const openCreateModal = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  // GỌI API GET /api/owner/staffs/{id} KHI BẤM NÚT CHI TIẾT
  const handleViewDetailClick = async (staffSummary) => {
    const detailData = await fetchStaffDetail(staffSummary.userId);
    if (detailData) {
      setEditingStaff(detailData);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const onSave = (formData) => {
    if (editingStaff) {
      // Chế độ vừa xem vừa Update (PUT /api/owner/staffs/{id})
      const payload = {
        fullName: formData.fullName || null,
        email: formData.email || null,
        phoneNumber: formData.phoneNumber || null,
        password: formData.password || undefined,
        isActive: formData.isActive,
        permissionCodes: formData.permissionCodes || [],
      };
      handleUpdateStaff(editingStaff.userId, payload, closeModal);
    } else {
      // Chế độ Tạo mới (POST /api/owner/staffs)
      const payload = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        phoneNumber: formData.phoneNumber || null,
        defaultRoleType: formData.defaultRoleType || null,
        customPermissionCodes: formData.permissionCodes || [],
      };
      handleCreateStaff(payload, closeModal);
    }
  };

  return (
    <div className="animate-fade-in w-full space-y-4 text-slate-800">
      {/* Overlay loading khi đang gọi API getStaffDetail */}
      {detailLoading && (
        <div className="backdrop-blur-xs fixed inset-0 z-[300] flex items-center justify-center bg-black/30">
          <div className="flex items-center gap-3 rounded-lg bg-white px-6 py-4 shadow-xl">
            <Icon name="sync" className="animate-spin text-2xl text-blue-600" />
            <span className="font-semibold text-slate-700">
              Đang tải thông tin chi tiết nhân viên...
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Nhân sự</h1>
          <p className="mt-1 text-gray-600">Tạo tài khoản và phân quyền cho nhân viên</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-[#004785] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
        >
          <Icon name="add" size={20} />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      <div className="flex w-1/3 items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <Icon name="search" className="text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo tên, email, SĐT..."
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
        currentUserId={currentUserId}
        onViewDetail={handleViewDetailClick}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteStaff}
      />

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
        permissions={permissions}
        onSave={onSave}
      />
    </div>
  );
};

export default StaffManagement;
