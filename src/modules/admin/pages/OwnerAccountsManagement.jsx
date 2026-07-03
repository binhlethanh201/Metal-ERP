import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../shared/components/Icon';
import ConfirmActionModal from '../components/ConfirmActionModal';
import CreateAccountModal from '../components/account/CreateAccountModal';
import {
  getOwnerList,
  createOwner,
  changeOwnerStatus,
  banOwner,
} from '../services/adminService';

const OwnerAccountsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    getOwnerList()
      .then((ownerData) => {
        const ownerList = Array.isArray(ownerData) ? ownerData : ownerData?.items || [];
        setOwners(ownerList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Owner accounts API error:', err);
        setError(err.message || 'Không tải được danh sách tài khoản');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false, type: null, data: null });
    setIsCreateModalOpen(false);
  };

  const handleConfirmAction = async () => {
    try {
      const { type, target } = modalConfig.data || {};
      if (type === 'freeze' && target?.userId) {
        await banOwner(target.userId, 'Admin terminated');
      }
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
        message: `Bạn đang thực hiện khóa luồng truy cập của Tenant: ${owner.fullName || owner.email}.`,
        warningNote:
          'BR-45: Khi Master Partner bị khóa, trạng thái này sẽ cascade tới TOÀN BỘ chi nhánh, kho hàng và token của nhân viên trực thuộc lập tức.',
        confirmText: 'Thực thi Khóa',
        target: owner,
      },
    });
  };

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
                    owner.status === 'Active' || owner.status === 'active' || owner.status === 1
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                      : 'bg-error-container text-error'
                  }`}
                >
                  {owner.status === 1 ? 'ACTIVE' : (owner.status?.toUpperCase() || '—')}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-on-surface">
            Quản lý Chủ Cửa Hàng (Owner)
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-on-surface-variant">
            CRUD & KIỂM SOÁT QUYỀN TRUY CẬP TOÀN NỀN TẢNG
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-md bg-on-surface px-4 py-2.5 text-xs font-bold text-surface-container-lowest shadow-sm transition-all hover:opacity-90"
        >
          + TẠO TÀI KHOẢN MỚI
        </button>
      </div>

      <div className="flex items-center justify-between rounded-md border border-outline-variant bg-surface-container-lowest p-2 shadow-sm">
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
      </div>

      <div className="overflow-hidden rounded-md border border-outline-variant bg-surface-container-lowest shadow-sm">
        {error && (
          <div className="m-3 rounded-md bg-error-container p-3 text-xs font-semibold text-error">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          {renderOwnersTable()}
        </div>
      </div>

      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        initialTab="owners"
        onSave={async (data) => {
          try {
            data.role = 'Owner';
            await createOwner(data);
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
    </div>
  );
};

export default OwnerAccountsManagement;
