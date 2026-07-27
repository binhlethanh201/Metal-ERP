import React, { useMemo, useState } from 'react';
import Icon from '../../../shared/components/Icon';
import Input from '../../../shared/components/Input';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { useStaffManager } from '../hooks/useStaffManager';
import StaffTable from '../components/staff/StaffTable';
import StaffModal from '../components/staff/StaffModal';
import HiddenStaffsModal from '../components/staff/HiddenStaffsModal';
import DeletedStaffsModal from '../components/staff/DeletedStaffsModal';

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
    pageSize,
    setPageSize,
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
  const [isHiddenModalOpen, setIsHiddenModalOpen] = useState(false);
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

  // Ẩn nhanh từ row table (chỉ áp dụng cho ACTIVE)
  const handleHideStaff = (id) => {
    if (
      !window.confirm(
        'Bạn có chắc muốn ẨN nhân viên này? Họ sẽ được chuyển sang trang "Đã ẩn".'
      )
    )
      return;
    handleToggleStatus(id);
  };

  const summary = useMemo(() => {
    const total = paginationMeta.totalCount || staffs.length;
    const active = staffs.filter((s) => s.isActive === 1).length;
    const inactive = staffs.filter((s) => s.isActive === 0).length;
    return { total, active, inactive };
  }, [staffs, paginationMeta.totalCount]);

  return (
    <div className="animate-in fade-in w-full space-y-6 duration-200">
      {detailLoading && (
        <div className="backdrop-blur-xs fixed inset-0 z-[300] flex items-center justify-center bg-black/30">
          <div className="flex items-center gap-3 rounded-lg bg-white px-6 py-4 shadow-xl">
            <Icon name="sync" className="animate-spin text-2xl text-blue-600" />
            <span className="font-semibold text-slate-700 dark:text-[#b3b3b3]">
              Đang tải thông tin chi tiết nhân viên...
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">Quản lý Nhân sự</h1>
          <p className="mt-1 text-gray-600 dark:text-[#999999]">
            Tạo tài khoản và phân quyền cho nhân viên
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
            {loading ? 'Đang tải...' : 'Sẵn sàng'}
          </span>
          <Button
            variant="outline"
            onClick={() => setIsHiddenModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Icon name="eye-off" size={16} />
            Đã ẩn
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsDeletedModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Icon name="history" size={16} />
            Đã xóa
          </Button>
          <Button
            variant="primary"
            onClick={openCreateModal}
            className="flex items-center gap-2"
          >
            <Icon name="add" size={20} />
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{summary.total}</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">Tổng nhân viên</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-green-600">{summary.active}</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">Đang hoạt động</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-slate-500 dark:text-[#999999]">
              {summary.inactive}
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">Đã ẩn</p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-[#333333] dark:bg-[#1a1a1a]/60">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="w-full md:w-72">
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
        </div>
      </div>

      <StaffTable
        staffs={staffs}
        loading={loading}
        currentUserId={currentUserId}
        showRowActions={false}
        showHideAction
        onHide={handleHideStaff}
        onClickRow={(row) => handleViewDetailClick(row)}
      />

      {paginationMeta.totalPages > 0 && (
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] px-5 py-3 shadow-sm">
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#b3b3b3]">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded border border-slate-300 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4] px-2 py-1 text-xs outline-none focus:border-primary"
              >
                <option value={20}>20 dòng</option>
                <option value={50}>50 dòng</option>
                <option value={100}>100 dòng</option>
              </select>
            </div>
            <span>
              {paginationMeta.totalCount === 0 ? 0 : (page - 1) * pageSize + 1} -{' '}
              {Math.min(page * pageSize, paginationMeta.totalCount)} trong tổng số{' '}
              {paginationMeta.totalCount} nhân viên
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-300 dark:border-[#404040] dark:bg-[#1a1a1a] px-2 py-1 text-slate-600 dark:text-[#b3b3b3] hover:bg-slate-50 dark:hover:bg-[#333333] disabled:opacity-50"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </button>
            <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
              Trang {page} / {paginationMeta.totalPages}
            </div>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(paginationMeta.totalPages, p + 1))}
              disabled={page >= paginationMeta.totalPages}
              className="rounded-lg border border-slate-300 dark:border-[#404040] dark:bg-[#1a1a1a] px-2 py-1 text-slate-600 dark:text-[#b3b3b3] hover:bg-slate-50 dark:hover:bg-[#333333] disabled:opacity-50"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      )}

      <StaffModal
        isOpen={isModalOpen}
        onClose={closeModal}
        staff={editingStaff}
        permissions={permissions}
        onSave={onSave}
      />

      <HiddenStaffsModal
        isOpen={isHiddenModalOpen}
        onClose={() => setIsHiddenModalOpen(false)}
        onAction={() => refetch()}
      />

      <DeletedStaffsModal
        isOpen={isDeletedModalOpen}
        onClose={() => setIsDeletedModalOpen(false)}
        onAction={() => refetch()}
      />
    </div>
  );
};

export default StaffManagement;
