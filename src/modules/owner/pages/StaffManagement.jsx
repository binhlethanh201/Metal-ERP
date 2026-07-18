import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import IconButton from '../../../shared/components/IconButton';
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
  } = useStaffManager();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);

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
        <Button variant="primary" onClick={openCreateModal} className="flex items-center gap-2">
          <Icon name="add" size={20} />
          <span>Thêm nhân viên</span>
        </Button>
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
      <div className="flex items-center gap-2">
        <div className="flex w-fit items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
          {[
            { key: 'active', label: 'Đang hoạt động' },
            { key: 'all', label: 'Tất cả' },
            { key: 'deleted', label: 'Đã ẩn' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
                statusFilter === tab.key
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDeletedModalOpen(true)}
          className="flex items-center gap-1.5 border-slate-300 text-slate-600 hover:bg-slate-50"
        >
          <Icon name="delete" size={16} />
          Đã xóa
        </Button>
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
        <div className="mt-4 flex items-center justify-end gap-3">
          <IconButton
            icon={(props) => <Icon name="chevron_left" {...props} />}
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          />
          <span className="text-sm font-semibold">
            Trang {page} / {paginationMeta.totalPages}
          </span>
          <IconButton
            icon={(props) => <Icon name="chevron_right" {...props} />}
            variant="outline"
            disabled={page >= paginationMeta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          />
        </div>
      )}

      <StaffModal
        isOpen={isModalOpen}
        onClose={closeModal}
        staff={editingStaff}
        permissions={permissions}
        onSave={onSave}
      />

      <DeletedStaffsModal
        isOpen={isDeletedModalOpen}
        onClose={() => setIsDeletedModalOpen(false)}
        onSuccess={() => {
          // Refresh the current staff list after restore/delete
          setStatusFilter(statusFilter);
        }}
      />
    </div>
  );
};

export default StaffManagement;
