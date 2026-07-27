import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import Input from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { useStaffManager } from '../hooks/useStaffManager';
import StaffTable from '../components/staff/StaffTable';
import StaffModal from '../components/staff/StaffModal';

const StaffManagement = () => {
  const {
    activeStaffs,
    hiddenStaffs,
    permissions,
    activeLoading,
    hiddenLoading,
    detailLoading,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    activePaginationMeta,
    currentUserId,
    fetchStaffDetail,
    handleCreateStaff,
    handleUpdateStaff,
    handleHideStaff,
    handleActivateStaff,
    handlePermanentDeleteStaff,
  } = useStaffManager();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'hidden'

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

  const tabs = [
    { key: 'active', label: 'Đang hoạt động', icon: 'user-check' },
    { key: 'hidden', label: 'Đã ẩn', icon: 'eye-off' },
  ];

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

      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">Quản lý Nhân sự</h1>
          <p className="mt-1 text-gray-600 dark:text-[#999999]">
            Tạo tài khoản và phân quyền cho nhân viên trong cửa hàng của bạn.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openCreateModal}
          className="flex items-center gap-2"
        >
          <Icon name="add" size={20} />
          Thêm nhân viên
        </Button>
      </div>

      {/* TABS */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#333333] dark:bg-[#1a1a1a]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 dark:border-[#333333]">
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map((t) => {
              const isActive = activeTab === t.key;
              const counts = {
                active: activePaginationMeta.totalCount,
                hidden: hiddenStaffs.length,
              };
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border-[#004785] text-[#004785] dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#999999] dark:hover:text-[#e5e5e5]'
                  }`}
                >
                  <Icon name={t.icon} size={16} />
                  {t.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-blue-100 text-[#004785] dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-[#333333] dark:text-[#999999]'
                    }`}
                  >
                    {counts[t.key]}
                  </span>
                </button>
              );
            })}
          </div>

          {activeTab === 'active' && (
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
          )}
        </div>

        {/* TAB CONTENT */}
        <div className="p-4">
          {activeTab === 'active' && (
            <>
              <StaffTable
                staffs={activeStaffs}
                loading={activeLoading}
                currentUserId={currentUserId}
                variant="active"
                onHide={handleHideStaff}
                onClickRow={handleViewDetailClick}
              />
              {activePaginationMeta.totalPages > 0 && (
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  setPage={setPage}
                  totalCount={activePaginationMeta.totalCount}
                  totalPages={activePaginationMeta.totalPages}
                />
              )}
            </>
          )}

          {activeTab === 'hidden' && (
            <StaffTable
              staffs={hiddenStaffs}
              loading={hiddenLoading}
              currentUserId={currentUserId}
              variant="hidden"
              onActivate={handleActivateStaff}
              onPermanentDelete={handlePermanentDeleteStaff}
              onClickRow={handleViewDetailClick}
            />
          )}
        </div>
      </div>

      {/* MODAL — chỉ để sửa info/perms */}
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

const Pagination = ({ page, setPage, pageSize, setPageSize, totalCount, totalPages }) => (
  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] px-5 py-3 shadow-sm">
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
        {totalCount === 0 ? 0 : (page - 1) * pageSize + 1} -{' '}
        {Math.min(page * pageSize, totalCount)} trong tổng số {totalCount} nhân viên
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
        Trang {page} / {totalPages}
      </div>
      <button
        type="button"
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page >= totalPages}
        className="rounded-lg border border-slate-300 dark:border-[#404040] dark:bg-[#1a1a1a] px-2 py-1 text-slate-600 dark:text-[#b3b3b3] hover:bg-slate-50 dark:hover:bg-[#333333] disabled:opacity-50"
      >
        <Icon name="chevron_right" className="text-[18px]" />
      </button>
    </div>
  </div>
);

export default StaffManagement;
