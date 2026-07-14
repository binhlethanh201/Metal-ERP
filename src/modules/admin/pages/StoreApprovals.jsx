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
        setError(err.message || 'Không tải được danh sách phê duyệt');
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

  // pendingCount = total records có status=PENDING (khi đang filter PENDING thì dùng totalCount)
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
      alert(err.message || 'Thao tác thất bại');
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
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
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
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Bị từ chối',
  };

  return (
    <div className="space-y-6 text-on-surface">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-on-surface">
            Duyệt Cửa Hàng Mới
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-on-surface-variant">
            Xét duyệt yêu cầu đăng ký Partner Owner & giấy tờ ĐKKD
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1.5 rounded-md bg-secondary-container px-3 py-1.5 text-xs font-bold text-on-secondary-container">
            <Icon name="clock" size={14} />
            {pendingCount} chờ duyệt
          </span>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center justify-between rounded-md border border-outline-variant bg-surface-container-lowest p-2 shadow-sm">
        <div className="relative w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            <Icon name="search" size={14} />
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên shop, MST, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 pl-9 text-xs font-semibold outline-none focus:border-primary focus:bg-surface-container-lowest"
          />
        </div>
        <div className="flex gap-1">
          {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-md px-5 py-2 text-xs font-bold transition-all ${
                filterStatus === status
                  ? 'bg-on-surface text-surface-container-lowest shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-md border border-outline-variant bg-surface-container-lowest shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              <th className="px-4 py-3">Mã hồ sơ</th>
              <th className="px-4 py-3">Tên cửa hàng</th>
              <th className="px-4 py-3">Chủ sở hữu</th>
              <th className="px-4 py-3">MST / GPKD</th>
              <th className="px-4 py-3">Ngày gửi</th>
              <th className="px-4 py-3">SLA</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {loading && (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-12 text-center text-sm font-semibold text-on-surface-variant"
                >
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-sm text-error">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && filteredApprovals.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-12 text-center text-sm font-semibold text-on-surface-variant"
                >
                  Không có hồ sơ nào khớp với bộ lọc hiện tại.
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
                    className="transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-4 py-3 font-mono text-[11px] text-primary">
                      #{String(approval.approvalId).slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 font-bold">{approval.storeName}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{approval.ownerName}</div>
                      <div className="text-[11px] text-outline">{approval.ownerEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-[11px]">{approval.taxCode || '—'}</div>
                      <div className="text-[10px] text-outline">
                        GPKD: {approval.businessLicense || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{formatDate(approval.createdAt)}</div>
                      <div className="text-[10px] text-outline">
                        {formatDateTime(approval.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {approval.status === 'PENDING' ? (
                        <span
                          className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${
                            isOverdue
                              ? 'bg-error-container text-error'
                              : 'bg-secondary-container text-on-secondary-container'
                          }`}
                        >
                          {waiting} ngày {isOverdue && '⚠'}
                        </span>
                      ) : approval.status === 'APPROVED' ? (
                        <span className="text-[10px] text-on-surface-variant">
                          Duyệt: {formatDate(approval.reviewedAt)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-on-surface-variant">
                          Từ chối: {formatDate(approval.reviewedAt)}
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
                              : 'bg-error-container text-error'
                        }`}
                      >
                        {STATUS_LABELS[approval.status] || approval.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleViewDetail(approval)}
                        className="mr-2 inline-flex items-center gap-1 rounded-md border border-outline-variant px-3 py-1 text-xs font-bold hover:bg-surface-container-high"
                      >
                        <Icon name="visibility" size={14} /> Xem
                      </button>
                      {approval.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => setActionModalData({ approval, type: 'approve' })}
                            className="mr-2 inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-xs font-bold text-on-primary hover:bg-on-primary-fixed-variant"
                          >
                            <Icon name="check" size={14} /> Duyệt
                          </button>
                          <button
                            onClick={() => setActionModalData({ approval, type: 'reject' })}
                            className="inline-flex items-center gap-1 rounded-md border border-error-container bg-error-container/30 px-3 py-1 text-xs font-bold text-error hover:bg-error-container"
                          >
                            <Icon name="x" size={14} /> Từ chối
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
