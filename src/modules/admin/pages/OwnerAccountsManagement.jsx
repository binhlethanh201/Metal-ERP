import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../shared/components/Icon';
import ConfirmActionModal from '../components/ConfirmActionModal';
import CreateAccountModal from '../components/account/CreateAccountModal';
import { getOwnerList, createOwner, banOwner } from '../services/adminService';

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
        setError(err.message || 'KhÃ´ng táº£i Ä‘Æ°á»£c danh sÃ¡ch tÃ i khoáº£n');
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
      alert(err.message || 'Thao tÃ¡c tháº¥t báº¡i');
    }
  };

  const triggerFreezeOwner = (owner) => {
    setModalConfig({
      isOpen: true,
      type: 'freeze',
      data: {
        title: 'KhÃ³a toÃ n bá»™ Tenant (Master Account)',
        message: `Báº¡n Ä‘ang thá»±c hiá»‡n khÃ³a luá»“ng truy cáº­p cá»§a Tenant: ${owner.fullName || owner.email}.`,
        warningNote:
          'BR-45: Khi Master Partner bá»‹ khÃ³a, tráº¡ng thÃ¡i nÃ y sáº½ cascade tá»›i TOÃ€N Bá»˜ chi nhÃ¡nh, kho hÃ ng vÃ  token cá»§a nhÃ¢n viÃªn trá»±c thuá»™c láº­p tá»©c.',
        confirmText: 'Thá»±c thi KhÃ³a',
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
      return <div className="p-8 text-center text-xs text-slate-500 dark:text-[#999999]">Äang táº£i...</div>;
    if (filtered.length === 0)
      return (
        <div className="p-8 text-center text-xs text-slate-500 dark:text-[#999999]">KhÃ´ng cÃ³ dá»¯ liá»‡u.</div>
      );
    return (
      <table className="w-full text-left text-xs text-slate-900 dark:text-[#e5e5e5]">
        <thead>
          <tr className="border-b border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            <th className="px-4 py-3">Tenant / Corporate ID</th>
            <th className="px-4 py-3">Subscription Tier</th>
            <th className="px-4 py-3 text-center">Master Status</th>
            <th className="px-4 py-3 text-right">Thao tÃ¡c</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-[#333333]">
          {filtered.map((owner) => (
            <tr key={owner.userId} className="transition-colors hover:bg-white dark:bg-[#0f0f0f]">
              <td className="px-4 py-3">
                <div className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
                  {owner.fullName || owner.email}
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-slate-400 dark:text-[#666666]">
                  ID: {owner.userId} | {owner.email}
                </div>
              </td>
              <td className="px-4 py-3 font-bold text-[#004785] dark:text-blue-400">{owner.subscriptionPlan || 'â€”'}</td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`rounded-sm px-2 py-1 text-[10px] font-bold ${
                    owner.status === 'Active' || owner.status === 'active' || owner.status === 1
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-500'
                  }`}
                >
                  {owner.status === 1 ? 'ACTIVE' : owner.status?.toUpperCase() || 'â€”'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => triggerFreezeOwner(owner)}
                  className="p-1 text-slate-400 dark:text-[#666666] hover:text-red-600 dark:text-red-500"
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
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-[#e5e5e5]">
            Quáº£n lÃ½ Chá»§ Cá»­a HÃ ng (Owner)
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-slate-500 dark:text-[#999999]">
            CRUD & KIá»‚M SOÃT QUYá»€N TRUY Cáº¬P TOÃ€N Ná»€N Táº¢NG
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-md bg-[#004785] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90"
        >
          + Táº O TÃ€I KHOáº¢N Má»šI
        </button>
      </div>

      <div className="flex items-center justify-between rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-2 shadow-sm">
        <div className="relative w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#666666]">
            <Icon name="search" size={14} />
          </span>
          <input
            type="text"
            placeholder="TÃ¬m kiáº¿m Email, ID, TÃªn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] px-3 py-2 pl-9 text-xs font-semibold outline-none focus:border-primary focus:bg-white dark:bg-[#0f0f0f]"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] shadow-sm">
        {error && (
          <div className="m-3 rounded-md bg-red-50 dark:bg-red-900/30 p-3 text-xs font-semibold text-red-600 dark:text-red-500">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">{renderOwnersTable()}</div>
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
            alert(err.message || 'Táº¡o tÃ i khoáº£n tháº¥t báº¡i');
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

