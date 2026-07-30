import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Icon from '../../../shared/components/Icon';
import {
  getApprovalList,
  getApprovalDetail,
  approveStore,
  rejectStore,
} from '../services/adminService';
import StoreApprovalDetailModal from '../components/store/StoreApprovalDetailModal';
import ApprovalActionModal from '../components/store/ApprovalActionModal';

const StoreApprovals = () => {
  const [approvals, setApprovals] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailModalData, setDetailModalData] = useState(null);
  const [actionModalData, setActionModalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApprovals = useCallback(() => {
    setLoading(true);
    setError(null);
    getApprovalList({ status: filterStatus })
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.items || [];
        setApprovals(items);
        setTotalCount(data?.totalCount ?? items.length);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Approvals API error:', err);
        setError(err.message || 'KhÃ´ng táº£i Ä‘Æ°á»£c danh sÃ¡ch phÃª duyá»‡t');
        setLoading(false);
      });
  }, [filterStatus]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const filteredApprovals = useMemo(() => {
    return approvals.filter((a) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        (a.storeName || '').toLowerCase().includes(q) ||
        (a.taxCode || '').toLowerCase().includes(q) ||
        (a.ownerEmail || '').toLowerCase().includes(q) ||
        (a.ownerName || '').toLowerCase().includes(q) ||
        (a.businessLicense || '').toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [approvals, searchTerm]);

  // pendingCount = total records cÃ³ status=PENDING (khi Ä‘ang filter PENDING thÃ¬ dÃ¹ng totalCount)
  const pendingCount = useMemo(() => {
    if (filterStatus === 'PENDING') return totalCount;
    return 0;
  }, [filterStatus, totalCount]);

  const handleAction = async (formValues) => {
    const { approval, type } = actionModalData;
    try {
      if (type === 'approve') await approveStore(approval.approvalId, formValues.notes);
      else if (type === 'reject') await rejectStore(approval.approvalId, formValues.reason);
      setActionModalData(null);
      fetchApprovals();
    } catch (err) {
      console.error('Approval action error:', err);
      alert(err.message || 'Thao tÃ¡c tháº¥t báº¡i');
    }
  };

  const handleViewDetail = async (approval) => {
    try {
      const detail = await getApprovalDetail(approval.approvalId);
      setDetailModalData(detail || approval);
    } catch (err) {
      console.error('Fetch approval detail error:', err);
      setDetailModalData(approval); // fallback to row data
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'â€”';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'â€”';
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const daysWaiting = (createdAt) => {
    if (!createdAt) return 0;
    const ms = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  };

  const STATUS_LABELS = {
    PENDING: 'Chá» duyá»‡t',
    APPROVED: 'ÄÃ£ duyá»‡t',
    REJECTED: 'Bá»‹ tá»« chá»‘i',
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-[#e5e5e5]">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-[#e5e5e5]">
            Duyá»‡t Cá»­a HÃ ng Má»›i
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-slate-500 dark:text-[#999999]">
            XÃ©t duyá»‡t yÃªu cáº§u Ä‘Äƒng kÃ½ Partner Owner & giáº¥y tá» ÄKKD
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1.5 rounded-md bg-secondary-container px-3 py-1.5 text-xs font-bold text-on-secondary-container">
            <Icon name="clock" size={14} />
            {pendingCount} chá» duyá»‡t
          </span>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center justify-between rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-2 shadow-sm">
        <div className="relative w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#666666]">
            <Icon name="search" size={14} />
          </span>
          <input
            type="text"
            placeholder="TÃ¬m theo tÃªn shop, MST, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] px-3 py-2 pl-9 text-xs font-semibold outline-none focus:border-primary focus:bg-white dark:bg-[#0f0f0f]"
          />
        </div>
        <div className="flex gap-1">
          {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-md px-5 py-2 text-xs font-bold transition-all ${
                filterStatus === status
                  ? 'bg-[#004785] text-white shadow-sm'
                  : 'text-slate-500 dark:text-[#999999] hover:bg-slate-50 dark:bg-[#1a1a1a] hover:text-slate-900 dark:text-[#e5e5e5]'
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
              <th className="px-4 py-3">MÃ£ há»“ sÆ¡</th>
              <th className="px-4 py-3">TÃªn cá»­a hÃ ng</th>
              <th className="px-4 py-3">Chá»§ sá»Ÿ há»¯u</th>
              <th className="px-4 py-3">MST / GPKD</th>
              <th className="px-4 py-3">NgÃ y gá»­i</th>
              <th className="px-4 py-3">SLA</th>
              <th className="px-4 py-3">Tráº¡ng thÃ¡i</th>
              <th className="px-4 py-3 text-right">Thao tÃ¡c</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#333333]">
            {loading && (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-12 text-center text-sm font-semibold text-slate-500 dark:text-[#999999]"
                >
                  Äang táº£i...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-sm text-red-600 dark:text-red-500">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && filteredApprovals.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-12 text-center text-sm font-semibold text-slate-500 dark:text-[#999999]"
                >
                  KhÃ´ng cÃ³ há»“ sÆ¡ nÃ o khá»›p vá»›i bá»™ lá»c hiá»‡n táº¡i.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              filteredApprovals.map((approval) => {
                const waiting = daysWaiting(approval.createdAt);
                const isOverdue = approval.status === 'PENDING' && waiting > 3;
                return (
                  <tr
                    key={approval.approvalId}
                    className="transition-colors hover:bg-slate-50 dark:bg-[#1a1a1a]"
                  >
                    <td className="px-4 py-3 font-mono text-[11px] text-[#004785] dark:text-blue-400">
                      #{String(approval.approvalId).slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 font-bold">{approval.storeName}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{approval.ownerName}</div>
                      <div className="text-[11px] text-slate-400 dark:text-[#666666]">{approval.ownerEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-[11px]">{approval.taxCode || 'â€”'}</div>
                      <div className="text-[10px] text-slate-400 dark:text-[#666666]">
                        GPKD: {approval.businessLicense || 'â€”'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{formatDate(approval.createdAt)}</div>
                      <div className="text-[10px] text-slate-400 dark:text-[#666666]">
                        {formatDateTime(approval.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {approval.status === 'PENDING' ? (
                        <span
                          className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${
                            isOverdue
                              ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-500'
                              : 'bg-secondary-container text-on-secondary-container'
                          }`}
                        >
                          {waiting} ngÃ y {isOverdue && 'âš '}
                        </span>
                      ) : approval.status === 'APPROVED' ? (
                        <span className="text-[10px] text-slate-500 dark:text-[#999999]">
                          Duyá»‡t: {formatDate(approval.reviewedAt)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 dark:text-[#999999]">
                          Tá»« chá»‘i: {formatDate(approval.reviewedAt)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${
                          approval.status === 'PENDING'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : approval.status === 'APPROVED'
                              ? 'bg-tertiary-container text-on-tertiary-container'
                              : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-500'
                        }`}
                      >
                        {STATUS_LABELS[approval.status] || approval.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleViewDetail(approval)}
                        className="mr-2 inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-[#333333] px-3 py-1 text-xs font-bold hover:bg-slate-100 dark:bg-[#272727]"
                      >
                        <Icon name="visibility" size={14} /> Xem
                      </button>
                      {approval.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => setActionModalData({ approval, type: 'approve' })}
                            className="mr-2 inline-flex items-center gap-1 rounded-md bg-[#004785] dark:bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-on-primary-fixed-variant"
                          >
                            <Icon name="check" size={14} /> Duyá»‡t
                          </button>
                          <button
                            onClick={() => setActionModalData({ approval, type: 'reject' })}
                            className="inline-flex items-center gap-1 rounded-md border border-error-container bg-red-50 dark:bg-red-900/30/30 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-500 hover:bg-red-50 dark:bg-red-900/30"
                          >
                            <Icon name="x" size={14} /> Tá»« chá»‘i
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      <StoreApprovalDetailModal data={detailModalData} onClose={() => setDetailModalData(null)} />
      <ApprovalActionModal
        data={actionModalData}
        onClose={() => setActionModalData(null)}
        onConfirm={handleAction}
      />
    </div>
  );
};

export default StoreApprovals;

