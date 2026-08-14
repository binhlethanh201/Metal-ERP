/**
 * StorePolicyModal - Hiển thị Chính sách cửa hàng (View-only) cho thu ngân tại POS.
 * Bao gồm: Chính sách đổi/trả hàng theo nhóm và Mức chiết khấu đơn hàng.
 */
import React, { useState, useEffect } from 'react';
import Modal from '../../../shared/components/Modal';
import Icon from '../../../shared/components/Icon';
import { apiGet } from '../../../services/apiClient';

const formatDuration = (totalDays) => {
  if (!totalDays) return 'Không cho phép';
  let remaining = parseInt(totalDays);
  const years = Math.floor(remaining / 365);
  remaining %= 365;
  const months = Math.floor(remaining / 30);
  const days = remaining % 30;
  const parts = [];
  if (years) parts.push(`${years} năm`);
  if (months) parts.push(`${months} tháng`);
  if (days) parts.push(`${days} ngày`);
  return parts.join(' ') || '0 ngày';
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value || 0) + ' đ';
};

const TABS = [
  { key: 'return', label: 'Chính sách đổi/trả', icon: 'sync_alt' },
  { key: 'discount', label: 'Mức chiết khấu', icon: 'percent' },
];

const StorePolicyModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('return');
  const [returnPolicies, setReturnPolicies] = useState([]);
  const [discountTiers, setDiscountTiers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchPolicies = async () => {
      setLoading(true);
      try {
        const policies = await apiGet('/api/pos/returns/return-policies');
        setReturnPolicies(Array.isArray(policies) ? policies : []);
      } catch (e) {
        console.error('Failed to fetch return policies:', e);
      }
      try {
        const tiersRes = await apiGet('/api/order-discount-tiers');
        const tiers = tiersRes?.data || tiersRes;
        setDiscountTiers(Array.isArray(tiers) ? tiers : []);
      } catch (e) {
        console.error('Failed to fetch discount tiers:', e);
      }
      setLoading(false);
    };
    fetchPolicies();
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chính sách cửa hàng" size="lg">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-[#1a1a1a]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-[#004785] shadow-sm dark:bg-[#272727] dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-[#808080] dark:hover:text-[#b3b3b3]'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#004785] border-t-transparent" />
            <span className="ml-2 text-sm text-slate-500">Đang tải...</span>
          </div>
        ) : activeTab === 'return' ? (
          <div>
            {returnPolicies.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400 dark:text-[#808080]">
                <Icon name="info" size={32} className="mx-auto mb-2 text-slate-300 dark:text-[#666666]" />
                <p>Chưa có chính sách đổi/trả nào được thiết lập.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-[#333333]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#999999]">
                      <th className="px-4 py-3">Nhóm hàng</th>
                      <th className="px-4 py-3">Trả hàng (hoàn tiền)</th>
                      <th className="px-4 py-3">Bảo hành</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                    {returnPolicies.map((policy, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-[#e5e5e5]">
                          {policy.categoryName || '—'}
                        </td>
                        <td className="px-4 py-3">
                          {policy.returnDays ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <Icon name="check_circle" size={12} />
                              {formatDuration(policy.returnDays)}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-[#666666]">Không cho phép</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {policy.exchangeDays ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              <Icon name="swap_horiz" size={12} />
                              {formatDuration(policy.exchangeDays)}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-[#666666]">Không cho phép</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-3 text-xs text-slate-400 dark:text-[#808080]">
              Sản phẩm không thuộc nhóm hàng trên sẽ không được phép đổi/trả.
            </p>
          </div>
        ) : (
          <div>
            {discountTiers.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400 dark:text-[#808080]">
                <Icon name="info" size={32} className="mx-auto mb-2 text-slate-300 dark:text-[#666666]" />
                <p>Chưa có mức chiết khấu nào được thiết lập.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-[#333333]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#999999]">
                      <th className="px-4 py-3">Tổng giá trị tối thiểu</th>
                      <th className="px-4 py-3">Chiết khấu</th>
                      <th className="px-4 py-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                    {discountTiers.map((tier, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-[#e5e5e5]">
                          {formatCurrency(tier.minOrderValue)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            {tier.discountPercent}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {tier.isActive !== false ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                              <Icon name="check_circle" size={14} />
                              Đang áp dụng
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Tạm ngưng</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-3 text-xs text-slate-400 dark:text-[#808080]">
              Chiết khấu được tự động áp dụng khi tổng giá trị đơn hàng đạt mức tối thiểu.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StorePolicyModal;
