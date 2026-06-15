import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import ConfirmActionModal from '../components/ConfirmActionModal';
import ChangeRoleModal from '../components/account/ChangeRoleModal';
import CreateAccountModal from '../components/account/CreateAccountModal';

const UserAccountsManagement = () => {
  const [activeTab, setActiveTab] = useState('owners');
  const [searchTerm, setSearchTerm] = useState('');

  // States quản lý Modals
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });
  const [roleModalData, setRoleModalData] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false, type: null, data: null });
    setRoleModalData(null);
    setIsCreateModalOpen(false);
  };

  // --- TRIGGERS ---
  const triggerFreezeOwner = (ownerId) => {
    setModalConfig({
      isOpen: true,
      type: 'freeze',
      data: {
        title: 'Khóa toàn bộ Tenant (Master Account)',
        message: `Bạn đang thực hiện khóa luồng truy cập của Tenant ID: ${ownerId}.`,
        warningNote:
          'BR-45: Khi Master Partner bị khóa, trạng thái này sẽ cascade tới TOÀN BỘ chi nhánh, kho hàng và token của nhân viên trực thuộc lập tức.',
        confirmText: 'Thực thi Khóa',
      },
    });
  };

  const triggerTerminateStaff = (staffName) => {
    setModalConfig({
      isOpen: true,
      type: 'terminate',
      data: {
        title: 'Đình chỉ Nhân sự Hệ thống',
        message: `Đình chỉ quyền truy cập của ${staffName}?`,
        warningNote:
          'Exception E1: Nếu đây là nhân sự DUY NHẤT giữ Role cấp bách, hệ thống sẽ Reject thao tác này.',
        confirmText: 'Đình chỉ tài khoản',
      },
    });
  };

  const triggerDeactivateCommunity = (userName) => {
    setModalConfig({
      isOpen: true,
      type: 'deactivate',
      data: {
        title: 'Hủy kích hoạt Community User',
        message: `Bạn sắp gỡ bỏ quyền đăng nhập của ${userName}.`,
        warningNote:
          'BR-41: Thao tác này là Soft-Delete (Anonymize). Dữ liệu lịch sử mua bán và logs sẽ được giữ nguyên.',
        confirmText: 'Hủy kích hoạt',
      },
    });
  };

  // --- RENDER TABS ---
  const renderOwnersTable = () => (
    <table className="w-full text-left text-xs text-on-surface">
      <thead>
        <tr className="border-b border-outline-variant bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          <th className="px-4 py-3">Tenant / Corporate ID</th>
          <th className="px-4 py-3">Subscription Tier</th>
          <th className="px-4 py-3 text-center">Master Status</th>
          <th className="px-4 py-3 text-right">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant">
        <tr className="transition-colors hover:bg-surface-container-lowest">
          <td className="px-4 py-3">
            <div className="text-sm font-bold text-on-surface">Kim Khí Gia Bảo</div>
            <div className="mt-0.5 font-mono text-[11px] text-outline">
              ID: T-9921 | admin@giabao.vn
            </div>
          </td>
          <td className="px-4 py-3 font-bold text-primary">PREMIUM PLAN</td>
          <td className="px-4 py-3 text-center">
            <span className="rounded-sm bg-tertiary-fixed px-2 py-1 text-[10px] font-bold text-on-tertiary-fixed-variant">
              ACTIVE
            </span>
          </td>
          <td className="px-4 py-3 text-right">
            <button
              onClick={() => triggerFreezeOwner('T-9921')}
              className="p-1 text-outline hover:text-error"
              title="Freeze Tenant"
            >
              <Icon name="lock" size={16} />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );

  const renderStaffTable = () => (
    <table className="w-full text-left text-xs text-on-surface">
      <thead>
        <tr className="border-b border-outline-variant bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          <th className="px-4 py-3">Nhân sự nội bộ</th>
          <th className="px-4 py-3">Role Mapping</th>
          <th className="px-4 py-3 text-center">Account State</th>
          <th className="px-4 py-3 text-right">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant">
        <tr className="transition-colors hover:bg-surface-container-lowest">
          <td className="px-4 py-3">
            <div className="text-sm font-bold text-on-surface">Nguyễn Văn A</div>
            <div className="mt-0.5 font-mono text-[11px] text-outline">nva.staff@system.local</div>
          </td>
          <td className="px-4 py-3 font-mono font-bold text-on-surface-variant">
            INVENTORY_CONTROLLER
          </td>
          <td className="px-4 py-3 text-center">
            <span className="rounded-sm bg-tertiary-fixed px-2 py-1 text-[10px] font-bold text-on-tertiary-fixed-variant">
              ACTIVE
            </span>
          </td>
          <td className="px-4 py-3 text-right">
            <button
              onClick={() =>
                setRoleModalData({
                  name: 'Nguyễn Văn A',
                  email: 'nva.staff@system.local',
                  role: 'INVENTORY_CONTROLLER',
                })
              }
              className="mr-3 rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-1 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-high"
            >
              ĐỔI ROLE
            </button>
            <button
              onClick={() => triggerTerminateStaff('Nguyễn Văn A')}
              className="p-1 text-outline hover:text-error"
              title="Terminate"
            >
              <Icon name="user_x" size={16} />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );

  const renderCommunityTable = () => (
    <table className="w-full text-left text-xs text-on-surface">
      <thead>
        <tr className="border-b border-outline-variant bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          <th className="px-4 py-3">Người dùng Diễn đàn</th>
          <th className="px-4 py-3">Account Tier</th>
          <th className="px-4 py-3 text-center">Retention State</th>
          <th className="px-4 py-3 text-right">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant">
        <tr className="transition-colors hover:bg-surface-container-lowest">
          <td className="px-4 py-3">
            <div className="text-sm font-bold text-on-surface">Trần Thị B (Shop B)</div>
            <div className="mt-0.5 font-mono text-[11px] text-outline">Reg: 12/05/2026</div>
          </td>
          <td className="px-4 py-3 font-bold text-secondary-container">VIP PREMIUM</td>
          <td className="px-4 py-3 text-center">
            <span className="rounded-sm bg-tertiary-fixed px-2 py-1 text-[10px] font-bold text-on-tertiary-fixed-variant">
              ACTIVE
            </span>
          </td>
          <td className="px-4 py-3 text-right">
            <button
              onClick={() => triggerDeactivateCommunity('Trần Thị B')}
              className="p-1 text-outline hover:text-error"
              title="Soft Delete"
            >
              <Icon name="trash_2" size={16} />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-on-surface">
            Quản lý Tài khoản Hệ thống
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-on-surface-variant">
            CRUD & KIỂM SOÁT QUYỀN TRUY CẬP TOÀN NỀN TẢNG
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-md bg-on-surface px-4 py-2.5 text-xs font-bold text-surface-container-lowest shadow-sm transition-all hover:opacity-90"
        >
          + ĐĂNG KÝ TÀI KHOẢN MỚI
        </button>
      </div>

      {/* TABS & SEARCH BAR */}
      <div className="flex items-center justify-between rounded-md border border-outline-variant bg-surface-container-lowest p-2 shadow-sm">
        {/* SEARCH BAR */}
        <div className="relative w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            <Icon name="search" size={14} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm Email, ID, Tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 pl-9 text-xs font-semibold outline-none focus:border-primary focus:bg-surface-container-lowest"
          />
        </div>

        {/* TABS */}
        <div className="flex gap-1">
          {[
            { id: 'owners', label: 'Partner Owners' },
            { id: 'staff', label: 'System Staff' },
            { id: 'community', label: 'Community Users' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-5 py-2 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-on-surface text-surface-container-lowest shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER TABLE */}
      <div className="overflow-hidden rounded-md border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          {' '}
          {activeTab === 'owners' && renderOwnersTable()}
          {activeTab === 'staff' && renderStaffTable()}
          {activeTab === 'community' && renderCommunityTable()}
        </div>
      </div>

      {/* MODALS */}
      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        initialTab={activeTab}
        onSave={(data) => {
          console.log('Create:', data);
          alert('Đã tạo tài khoản!');
          handleCloseModal();
        }}
      />

      <ConfirmActionModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        onConfirm={() => {
          alert('Thực thi thành công API!');
          handleCloseModal();
        }}
        title={modalConfig.data?.title}
        message={modalConfig.data?.message}
        warningNote={modalConfig.data?.warningNote}
        confirmText={modalConfig.data?.confirmText}
      />

      <ChangeRoleModal
        isOpen={!!roleModalData}
        onClose={handleCloseModal}
        staffData={roleModalData}
        onSave={(newRole) => {
          alert(`Đã đổi Role thành: ${newRole}`);
          handleCloseModal();
        }}
      />
    </div>
  );
};

export default UserAccountsManagement;
