import React, { useMemo, useState } from 'react';
import Icon from '../../../shared/components/Icon';
import Input from '../../../shared/components/Input';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
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

  const summary = useMemo(() => {
    const total = paginationMeta.totalCount || staffs.length;
    const active = staffs.filter((s) => s.isActive === 1).length;
    const inactive = staffs.filter((s) => s.isActive === 0).length;
    return { total, active, inactive };
  }, [staffs, paginationMeta.totalCount]);

  const isDeletedMode = viewMode === 'deleted';

  return (
    <div className="animate-in fade-in w-full space-y-6 duration-200">
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

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Nhân sự</h1>
          <p className="mt-1 text-gray-600">Tạo tài khoản và phân quyền cho nhân viên</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
            {loading ? 'Đang tải...' : 'Sẵn sàng'}
          </span>
          <Button variant="primary" onClick={openCreateModal} className="flex items-center gap-2">
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
            <p className="mt-1 text-sm text-gray-600">Tổng nhân viên</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-green-600">{summary.active}</div>
            <p className="mt-1 text-sm text-gray-600">Đang hoạt động</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-slate-500">{summary.inactive}</div>
            <p className="mt-1 text-sm text-gray-600">Đã ẩn</p>
          </div>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Icon name="filter" size={14} /> Trạng thái:
            </span>
            {[
              { key: 'active', label: 'Đang hoạt động' },
              { key: 'all', label: 'Tất cả' },
              { key: 'deleted', label: 'Đã ẩn' },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={statusFilter === tab.key && viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('list');
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
              >
                {tab.label}
              </Button>
            ))}
            <Button
              variant={isDeletedMode ? 'danger' : 'outline'}
              size="sm"
              onClick={() => { setViewMode('deleted'); setStatusFilter('all'); }}
              className="flex items-center gap-1"
            >
              <Icon name="delete" size={14} /> Đã xóa
            </Button>
          </div>

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

      {viewMode === 'list' ? (
        <>
          <StaffTable
            staffs={staffs}
            loading={loading}
            currentUserId={currentUserId}
            onClickRow={(row) => handleViewDetailClick(row)}
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
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteStaff}
      />
    </div>
  );
};

export default StaffManagement;
