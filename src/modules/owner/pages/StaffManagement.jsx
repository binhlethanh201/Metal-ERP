import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import Input from '../../../shared/components/Input';
import { useStaffManager } from '../hooks/useStaffManager';
import StaffTable from '../components/staff/StaffTable';
import StaffModal from '../components/staff/StaffModal';
import DeletedStaffsModal from '../components/staff/DeletedStaffsModal';

const StaffManagement = () => {
  const {
    staffs,
    permissions,
    loading,
    detailLoading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    paginationMeta,
    fetchStaffDetail,
    handleCreateStaff,
    handleUpdateStaff,
    handleToggleStatus,
    handleDeleteStaff,
    currentUserId,
    refetch,
  } = useStaffManager();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'deleted'

  const openCreateModal = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

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

      <div className="w-1/3">
        <Input
          placeholder="Tìm theo tên, email, SĐT..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          icon={<Icon name="search" size={18} />}
        />
      </div>

      {/* Status filter tabs */}
      <div className="flex w-fit items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
        {[
          { key: 'active', label: 'Đang hoạt động' },
          { key: 'all', label: 'Tất cả' },
          { key: 'deleted', label: 'Đã ẩn' },
          { key: 'softDeleted', label: 'Đã xóa' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              if (tab.key === 'softDeleted') {
                setViewMode('deleted');
              } else {
                setViewMode('list');
                setStatusFilter(tab.key);
                setPage(1);
              }
            }}
            className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
              (tab.key === 'softDeleted' ? viewMode === 'deleted' : statusFilter === tab.key)
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.key === 'softDeleted' && <Icon name="delete" size={14} />}
            {tab.label}
          </button>
        ))}
      </div>

      {viewMode === 'list' ? (
        <>
          <StaffTable
            staffs={staffs}
            loading={loading}
            currentUserId={currentUserId}
            onViewDetail={handleViewDetailClick}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteStaff}
          />

          {paginationMeta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="chevron_left" size={20} />
              </button>
              <span className="text-sm font-semibold">
                Trang {page} / {paginationMeta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= paginationMeta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="chevron_right" size={20} />
              </button>
            </div>
          )}
        </>
      ) : (
        <DeletedStaffsModal
          onAction={() => {
            refetch();
          }}
        />
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
