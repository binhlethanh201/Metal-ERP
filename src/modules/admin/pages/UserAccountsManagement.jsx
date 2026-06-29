import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../shared/components/Icon';
import ConfirmActionModal from '../components/ConfirmActionModal';
import ChangeRoleModal from '../components/account/ChangeRoleModal';
import CreateAccountModal from '../components/account/CreateAccountModal';
import {
  getStaffList,
  getCommunityList,
  createStaff,
  createCommunity,
  updateStaff,
  changeStaffStatus,
  banStaff,
  banCommunity,
} from '../services/adminService';

const UserAccountsManagement = () => {
  const [activeTab, setActiveTab] = useState('owners');
  const [searchTerm, setSearchTerm] = useState('');

  const [owners, setOwners] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [community, setCommunity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });
  const [roleModalData, setRoleModalData] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([getStaffList(), getCommunityList()])
      .then(([staffData, communityData]) => {
        const staffList = Array.isArray(staffData) ? staffData : staffData?.items || [];
        const communityList = Array.isArray(communityData)
          ? communityData
          : communityData?.items || [];
        const hasRole = (u, role) => Array.isArray(u.roles) && u.roles.includes(role);
        setOwners(staffList.filter((s) => hasRole(s, 'Owner') || hasRole(s, 'PartnerOwner')));
        setStaffs(staffList.filter((s) => hasRole(s, 'SalesStaff') || hasRole(s, 'SystemStaff')));
        setCommunity(communityList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('User accounts API error:', err);
        setError(err.message || 'Không tải được danh sách tài khoản');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false, type: null, data: null });
    setRoleModalData(null);
    setIsCreateModalOpen(false);
  };

  const handleConfirmAction = async () => {
    try {
      const { type, target } = modalConfig.data || {};
      if (type === 'freeze' && target?.userId) await changeStaffStatus(target.userId, 'Suspended');
      else if (type === 'terminate' && target?.userId)
        await banStaff(target.userId, 'Admin terminated');
      else if (type === 'deactivate' && target?.userId)
        await banCommunity(target.userId, 'Admin deactivated');
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error('Action error:', err);
      alert(err.message || 'Thao tác thất bại');
    }
  };

  const triggerFreezeOwner = (owner) => {
    setModalConfig({
      isOpen: true,
      type: 'freeze',
      data: {
        title: 'Khóa toàn bộ Tenant (Master Account)',
        message: `Bạn đang thực hiện khóa luồng truy cập của Tenant: ${owner.fullName}.`,
        warningNote:
          'BR-45: Khi Master Partner bị khóa, trạng thái này sẽ cascade tới TOÀN BỘ chi nhánh, kho hàng và token của nhân viên trực thuộc lập tức.',
        confirmText: 'Thực thi Khóa',
        target: owner,
      },
    });
  };

  const triggerTerminateStaff = (staff) => {
    setModalConfig({
      isOpen: true,
      type: 'terminate',
      data: {
        title: 'Đình chỉ Nhân sự Hệ thống',
        message: `Đình chỉ quyền truy cập của ${staff.fullName}?`,
        warningNote:
          'Exception E1: Nếu đây là nhân sự DUY NHẤT giữ Role cấp bách, hệ thống sẽ Reject thao tác này.',
        confirmText: 'Đình chỉ tài khoản',
        target: staff,
      },
    });
  };

  const triggerDeactivateCommunity = (user) => {
    setModalConfig({
      isOpen: true,
      type: 'deactivate',
      data: {
        title: 'Hủy kích hoạt Community User',
        message: `Bạn sắp gỡ bỏ quyền đăng nhập của ${user.fullName}.`,
        warningNote:
          'BR-41: Thao tác này là Soft-Delete (Anonymize). Dữ liệu lịch sử mua bán và logs sẽ được giữ nguyên.',
        confirmText: 'Hủy kích hoạt',
        target: user,
      },
    });
  };

  // --- RENDER TABS ---
  const renderOwnersTable = () => {
    const filtered = owners.filter(
      (o) =>
        !searchTerm ||
        (o.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (loading)
      return <div className="p-8 text-center text-xs text-on-surface-variant">Đang tải...</div>;
    if (filtered.length === 0)
      return (
        <div className="p-8 text-center text-xs text-on-surface-variant">Không có dữ liệu.</div>
      );
    return (
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
          {filtered.map((owner) => (
            <tr key={owner.userId} className="transition-colors hover:bg-surface-container-lowest">
              <td className="px-4 py-3">
                <div className="text-sm font-bold text-on-surface">
                  {owner.fullName || owner.email}
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-outline">
                  ID: {owner.userId} | {owner.email}
                </div>
              </td>
              <td className="px-4 py-3 font-bold text-primary">{owner.subscriptionPlan || '—'}</td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`rounded-sm px-2 py-1 text-[10px] font-bold ${
                    owner.status === 'Active' || owner.status === 'active'
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                      : 'bg-error-container text-error'
                  }`}
                >
                  {owner.status?.toUpperCase() || '—'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => triggerFreezeOwner(owner)}
                  className="p-1 text-outline hover:text-error"
                  title="Freeze Tenant"
                >
                  <Icon name="lock" size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderStaffTable = () => {
    const filtered = staffs.filter(
      (s) =>
        !searchTerm ||
        (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (loading)
      return <div className="p-8 text-center text-xs text-on-surface-variant">Đang tải...</div>;
    if (filtered.length === 0)
      return (
        <div className="p-8 text-center text-xs text-on-surface-variant">Không có dữ liệu.</div>
      );
    return (
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
          {filtered.map((staff) => (
            <tr key={staff.userId} className="transition-colors hover:bg-surface-container-lowest">
              <td className="px-4 py-3">
                <div className="text-sm font-bold text-on-surface">
                  {staff.fullName || staff.email}
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-outline">{staff.email}</div>
              </td>
              <td className="px-4 py-3 font-mono font-bold text-on-surface-variant">
                {(Array.isArray(staff.roles) && staff.roles[0]) || 'STAFF'}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`rounded-sm px-2 py-1 text-[10px] font-bold ${
                    staff.status === 'Active' || staff.status === 'active'
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                      : 'bg-error-container text-error'
                  }`}
                >
                  {staff.status?.toUpperCase() || '—'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() =>
                    setRoleModalData({
                      name: staff.fullName,
                      email: staff.email,
                      roles: staff.roles,
                    })
                  }
                  className="mr-3 rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-1 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  ĐỔI ROLE
                </button>
                <button
                  onClick={() => triggerTerminateStaff(staff)}
                  className="p-1 text-outline hover:text-error"
                  title="Terminate"
                >
                  <Icon name="user_x" size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderCommunityTable = () => {
    const filtered = community.filter(
      (u) =>
        !searchTerm ||
        (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (loading)
      return <div className="p-8 text-center text-xs text-on-surface-variant">Đang tải...</div>;
    if (filtered.length === 0)
      return (
        <div className="p-8 text-center text-xs text-on-surface-variant">Không có dữ liệu.</div>
      );
    return (
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
          {filtered.map((user) => (
            <tr key={user.userId} className="transition-colors hover:bg-surface-container-lowest">
              <td className="px-4 py-3">
                <div className="text-sm font-bold text-on-surface">
                  {user.fullName || user.email}
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-outline">
                  Reg: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                </div>
              </td>
              <td className="px-4 py-3 font-bold text-secondary-container">{user.status || '—'}</td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`rounded-sm px-2 py-1 text-[10px] font-bold ${
                    user.status === 'Active' || user.status === 'active'
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                      : 'bg-error-container text-error'
                  }`}
                >
                  {user.status?.toUpperCase() || '—'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => triggerDeactivateCommunity(user)}
                  className="p-1 text-outline hover:text-error"
                  title="Soft Delete"
                >
                  <Icon name="trash_2" size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

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
        {error && (
          <div className="m-3 rounded-md bg-error-container p-3 text-xs font-semibold text-error">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
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
        onSave={async (data) => {
          try {
            await (activeTab === 'community' ? createCommunity(data) : createStaff(data));
            fetchData();
            handleCloseModal();
          } catch (err) {
            console.error('Create account error:', err);
            alert(err.message || 'Tạo tài khoản thất bại');
          }
        }}
      />

      <ConfirmActionModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        title={modalConfig.data?.title}
        message={modalConfig.data?.message}
        warningNote={modalConfig.data?.warningNote}
        confirmText={modalConfig.data?.confirmText}
      />

      <ChangeRoleModal
        isOpen={!!roleModalData}
        onClose={handleCloseModal}
        staffData={roleModalData}
        onSave={async (newRoles) => {
          if (!roleModalData?.userId) {
            handleCloseModal();
            return;
          }
          try {
            const roles = Array.isArray(newRoles) ? newRoles : [newRoles];
            await updateStaff(roleModalData.userId, { roles });
            fetchData();
            handleCloseModal();
          } catch (err) {
            console.error('Update role error:', err);
            alert(err.message || 'Cập nhật role thất bại');
          }
        }}
      />
    </div>
  );
};

export default UserAccountsManagement;
