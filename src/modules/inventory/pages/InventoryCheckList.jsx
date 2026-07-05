import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
import { Card } from '../../../shared/components/Card';
import { useAuth } from '../../../shared/hooks/useAuth';
import CreateCheckModal from '../components/check/CreateCheckModal';
import InventoryCheckDetailModal from '../components/check/InventoryCheckDetailModal';
import EditCheckModal from '../components/check/EditCheckModal';
import {
  getInventoryChecks,
  getInventoryCheckDetail,
  createInventoryCheck,
  updateInventoryCheck,
  deleteInventoryCheck,
  fillInventoryCheck,
  approveInventoryCheck,
  rejectInventoryCheck,
  cancelInventoryCheck,
} from '../services/inventoryCheckService';
import { apiGet } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';
import {
  Filter,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  Eye,
  CheckCircle2,
  Clock,
  FileEdit,
  XCircle,
  Ban,
  Trash2,
  Send,
  RotateCcw,
} from 'lucide-react';

// ==================== RENDER STATUS BADGE ====================
const renderStatusBadge = (status) => {
  switch (status) {
    case 'Draft':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
          <FileEdit size={12} /> Nháp
        </span>
      );
    case 'WaitingForApproval':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
          <Clock size={12} /> Chờ duyệt
        </span>
      );
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          <CheckCircle2 size={12} /> Hoàn thành
        </span>
      );
    case 'Cancelled':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
          <XCircle size={12} /> Đã hủy
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
          {status}
        </span>
      );
  }
};

// ==================== FORMAT DATE ====================
const formatDateTime = (dateString) => {
  if (!dateString) return '---';
  const date = new Date(dateString.endsWith('Z') ? dateString : `${dateString}Z`);
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
};

// ==================== MAIN COMPONENT ====================
const InventoryCheckList = () => {
  const { user } = useAuth();
  const isOwner = user?.roles?.includes('Owner') || user?.role === 'Owner';
  const currentUserId = user?.userId || user?.id;

  // ---- Trạng thái danh sách ----
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // ---- Bộ lọc ----
  const [searchCode, setSearchCode] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);

  // ---- Phân trang ----
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [paginationMeta, setPaginationMeta] = useState({ totalCount: 0, totalPages: 1 });

  // ---- Chi nhánh (Owner) ----
  const [branches, setBranches] = useState([]);

  // ---- Modal tạo phiếu ----
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ---- Chi tiết phiếu ----
  const [selectedCheckId, setSelectedCheckId] = useState(null);
  const [selectedCheckData, setSelectedCheckData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  // ---- Form đếm thực tế ----
  const [actualValues, setActualValues] = useState({});

  // ---- Form reject (yêu cầu đếm lại) ----
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // ---- Modal sửa phiếu ----
  const [editTicketData, setEditTicketData] = useState(null);

  // ==================== FETCH BRANCHES ====================
  useEffect(() => {
    if (isOwner) {
      apiGet(ENDPOINTS.OWNER.BRANCHES)
        .then((res) => {
          if (res?.success && res.data) {
            const list = res.data.items || res.data;
            setBranches(list);
          }
        })
        .catch((err) => console.error('Lỗi lấy chi nhánh:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner]);

  // ==================== FETCH LIST ====================
  const fetchChecks = useCallback(async () => {
    setLoading(true);
    setGlobalError('');
    try {
      const filters = {
        ...(searchCode && { ticketCode: searchCode }),
        ...(statusFilter && { status: statusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        pageNumber,
        pageSize,
      };

      const response = await getInventoryChecks(filters);
      if (response?.success && response?.data) {
        setChecks(response.data.items || []);
        setPaginationMeta({
          totalCount: response.data.totalCount || 0,
          totalPages: response.data.totalPages || 1,
        });
      } else {
        setChecks([]);
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Không thể tải danh sách phiếu kiểm kê.';
      setGlobalError(msg);
      setChecks([]);
    } finally {
      setLoading(false);
    }
  }, [searchCode, statusFilter, startDate, endDate, pageNumber, pageSize]);

  useEffect(() => {
    fetchChecks();
  }, [fetchChecks]);

  // Reset trang khi đổi bộ lọc
  useEffect(() => {
    setPageNumber(1);
  }, [searchCode, statusFilter, startDate, endDate]);

  // ==================== FETCH DETAIL ====================
  const openDetail = async (row) => {
    const checkId = row?.ticketId || row?.id || row?.inventoryCheckId;
    if (!checkId) return;

    setSelectedCheckId(checkId);
    setSelectedCheckData(null);
    setDetailLoading(true);
    setDetailError('');
    setShowRejectForm(false);
    setRejectReason('');
    setActualValues({});

    try {
      const res = await getInventoryCheckDetail(checkId);
      if (res?.success && res.data) {
        setSelectedCheckData(res.data);
        // Init giá trị thực tế
        const initValues = {};
        (res.data.details || []).forEach((item) => {
          initValues[item.detailId] = item.isCounted ? item.actualQuantity : '';
        });
        setActualValues(initValues);
      } else {
        setDetailError('Không thể tải chi tiết phiếu kiểm kê.');
      }
    } catch (err) {
      setDetailError(err?.data?.message || err?.message || 'Lỗi khi tải chi tiết.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedCheckId(null);
    setSelectedCheckData(null);
    setDetailLoading(false);
    setDetailError('');
    setShowRejectForm(false);
    setRejectReason('');
    setActualValues({});
  };

  // ==================== ACTION HANDLERS ====================

  const handleFillSubmit = async (ticketId, details, onCloseCallback) => {
    if (!ticketId) return;

    setDetailLoading(true);
    setDetailError('');
    try {
      const res = await fillInventoryCheck(ticketId, details);
      if (res?.success) {
        alert('Đã gửi kết quả kiểm đếm thành công! Phiếu chuyển sang trạng thái Chờ duyệt.');
        onCloseCallback?.();
        fetchChecks();
      }
    } catch (err) {
      setDetailError(err?.data?.message || err?.message || 'Lỗi khi gửi kết quả kiểm kê.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Approve - Duyệt phiếu
  const handleApprove = async (ticketId = selectedCheckId, onCloseCallback) => {
    if (!ticketId) return;
    if (
      !window.confirm(
        'Bạn có chắc chắn muốn duyệt phiếu này? Tồn kho sẽ được điều chỉnh ngay lập tức.'
      )
    )
      return;

    setDetailLoading(true);
    setDetailError('');
    try {
      const res = await approveInventoryCheck(ticketId);
      if (res?.success) {
        alert('Đã duyệt phiếu kiểm kê! Tồn kho đã được cập nhật.');
        onCloseCallback?.();
        fetchChecks();
      }
    } catch (err) {
      setDetailError(err?.data?.message || err?.message || 'Lỗi khi duyệt phiếu.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Reject - Yêu cầu đếm lại
  const handleReject = async (ticketId = selectedCheckId, reasonParam, onCloseCallback) => {
    if (!ticketId) return;
    const reason = typeof reasonParam === 'string' ? reasonParam : rejectReason;
    if (!reason?.trim()) {
      setDetailError('Vui lòng nhập lý do yêu cầu đếm lại!');
      return;
    }
    if (!window.confirm('Xác nhận yêu cầu đếm lại phiếu này?')) return;

    setDetailLoading(true);
    setDetailError('');
    try {
      const res = await rejectInventoryCheck(ticketId, reason);
      if (res?.success) {
        alert('Đã yêu cầu đếm lại. Phiếu được chuyển về trạng thái Nháp.');
        onCloseCallback?.();
        fetchChecks();
      }
    } catch (err) {
      setDetailError(err?.data?.message || err?.message || 'Lỗi khi yêu cầu đếm lại.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Cancel - Hủy phiếu
  const handleCancel = async (ticketId = selectedCheckId, onCloseCallback) => {
    if (!ticketId) return;
    if (!window.confirm('Bạn có chắc chắn muốn hủy phiếu kiểm kê này?')) return;

    setDetailLoading(true);
    setDetailError('');
    try {
      const res = await cancelInventoryCheck(ticketId);
      if (res?.success) {
        alert('Đã hủy phiếu kiểm kê thành công.');
        onCloseCallback?.();
        fetchChecks();
      }
    } catch (err) {
      setDetailError(err?.data?.message || err?.message || 'Lỗi khi hủy phiếu.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Delete - Xóa phiếu
  const handleDelete = async (ticketId = selectedCheckId, onCloseCallback) => {
    if (!ticketId) return;
    if (
      !window.confirm(
        'Bạn có chắc chắn muốn xóa phiếu kiểm kê nháp này? Hành động này không thể hoàn tác.'
      )
    )
      return;

    setDetailLoading(true);
    setDetailError('');
    try {
      const res = await deleteInventoryCheck(ticketId);
      if (res?.success) {
        alert('Đã xóa phiếu kiểm kê thành công.');
        onCloseCallback?.();
        fetchChecks();
      }
    } catch (err) {
      setDetailError(err?.data?.message || err?.message || 'Lỗi khi xóa phiếu.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Create - Tạo phiếu mới
  const handleCreate = async (productIds, notes, assigneeUserId) => {
    setLoading(true);
    setGlobalError('');
    try {
      const res = await createInventoryCheck(productIds, notes, assigneeUserId);
      if (res?.success) {
        alert('Tạo phiếu kiểm kê thành công! (Trạng thái: Nháp)');
        fetchChecks();
      }
    } catch (err) {
      setGlobalError(err?.data?.message || err?.message || 'Lỗi khi tạo phiếu kiểm kê.');
    } finally {
      setLoading(false);
    }
  };

  // ==================== DERIVED STATE ====================
  const currentStatus = selectedCheckData?.status;
  const isDraft = currentStatus === 'Draft';
  const isWaiting = currentStatus === 'WaitingForApproval';
  const isCompleted = currentStatus === 'Completed';
  const isCancelled = currentStatus === 'Cancelled';

  // Check quyền fill: Draft + (Owner hoặc assignee)
  const canFill = isDraft && (isOwner || currentUserId === selectedCheckData?.assigneeUserId);
  // Check quyền modify/delete: Draft + (Owner hoặc người tạo)
  const canModify = isDraft && (isOwner || currentUserId === selectedCheckData?.createdByUserId);

  // ==================== SUMMARY STATS ====================
  const summary = useMemo(() => {
    const totalItems = checks.reduce((sum, c) => sum + Number(c.detailCount || 0), 0);
    const drafts = checks.filter((c) => c.status === 'Draft').length;
    const waiting = checks.filter((c) => c.status === 'WaitingForApproval').length;
    return {
      total: checks.length,
      totalItems,
      drafts,
      waiting,
      totalCount: paginationMeta.totalCount,
    };
  }, [checks, paginationMeta.totalCount]);

  // ==================== RENDER ====================
  return (
    <div className="animate-fade-in w-full space-y-4 text-slate-800">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Kiểm kê kho</h1>
          <p className="mt-1 text-gray-600">
            Theo dõi, tạo mới và xử lý các phiếu kiểm đếm tồn kho
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Icon name="add" size={20} />
          Tạo phiếu kiểm kê mới
        </button>
      </div>

      {/* ==================== STATS CARDS ==================== */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <div className="py-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
            <p className="mt-0.5 text-xs text-gray-600">Tổng phiếu</p>
          </div>
        </Card>
        <Card>
          <div className="py-3 text-center">
            <div className="text-2xl font-bold text-slate-600">{summary.totalItems}</div>
            <p className="mt-0.5 text-xs text-gray-600">Sản phẩm kiểm</p>
          </div>
        </Card>
        <Card>
          <div className="py-3 text-center">
            <div className="text-2xl font-bold text-amber-500">{summary.drafts}</div>
            <p className="mt-0.5 text-xs text-gray-600">Phiếu nháp</p>
          </div>
        </Card>
        <Card>
          <div className="py-3 text-center">
            <div className="text-2xl font-bold text-orange-500">{summary.waiting}</div>
            <p className="mt-0.5 text-xs text-gray-600">Chờ duyệt</p>
          </div>
        </Card>
      </div>

      {/* ==================== GLOBAL ERROR BANNER ==================== */}
      {globalError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <AlertCircle className="mt-0.5 flex-shrink-0 text-red-500" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-red-800">Đã xảy ra lỗi</p>
            <p className="mt-1 text-sm text-red-700">{globalError}</p>
          </div>
          <button
            onClick={() => setGlobalError('')}
            className="flex-shrink-0 text-red-400 hover:text-red-600"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ==================== KHU VỰC 1: HEADER & FILTERS ==================== */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Lọc trạng thái */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Filter size={14} /> Trạng thái:
            </span>
            {[
              { value: '', label: 'Tất cả' },
              { value: 'Draft', label: 'Nháp' },
              { value: 'WaitingForApproval', label: 'Chờ duyệt' },
              { value: 'Completed', label: 'Hoàn thành' },
              { value: 'Cancelled', label: 'Đã hủy' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setStatusFilter(item.value)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === item.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Hành động nhanh */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchChecks}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
            </button>
            <button
              onClick={() => setShowAdvanceFilters(!showAdvanceFilters)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Calendar size={14} className="text-blue-500" />{' '}
              {showAdvanceFilters ? 'Thu gọn' : 'Lọc nâng cao'}
            </button>
            {(statusFilter || startDate || endDate || searchCode) && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setStartDate('');
                  setEndDate('');
                  setSearchCode('');
                  setPageNumber(1);
                }}
                className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                title="Xóa bộ lọc"
              >
                <X size={13} /> Đặt lại
              </button>
            )}
          </div>
        </div>

        {/* Hàng 2: Tìm kiếm + Lọc nâng cao */}
        {showAdvanceFilters && (
          <div className="grid grid-cols-1 gap-3 border-t border-slate-200/80 pt-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Tìm kiếm mã phiếu */}
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">Tìm mã phiếu:</label>
              <input
                type="text"
                placeholder="VD: PKK-001..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Ngày bắt đầu */}
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">Từ ngày:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Ngày kết thúc */}
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">Đến ngày:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* ==================== KHU VỰC 2: BẢNG DANH SÁCH PHIẾU KIỂM KÊ ==================== */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-slate-600">
                <th className="px-4 py-3 font-semibold">Mã phiếu</th>
                <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                <th className="px-4 py-3 font-semibold">Người tạo</th>
                <th className="px-4 py-3 font-semibold">Người phụ trách</th>
                <th className="px-4 py-3 text-center font-semibold">Sản phẩm</th>
                <th className="px-4 py-3 text-center font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Icon name="sync" className="mb-2 animate-spin text-3xl" />
                    <p>Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : checks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy phiếu kiểm kê nào.
                  </td>
                </tr>
              ) : (
                checks.map((row) => {
                  const checkId = row.ticketId || row.id || row.inventoryCheckId || row.checkId;
                  return (
                    <tr
                      key={checkId || row.ticketCode}
                      className="cursor-pointer border-b border-slate-100 transition-colors last:border-b-0 hover:bg-blue-50/30"
                      onClick={() => openDetail(row)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-blue-600 hover:underline">
                            {row.ticketCode}
                          </span>
                          {row.recountNumber > 0 && (
                            <span className="w-fit rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
                              Đếm lại (Lần {row.recountNumber})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {row.createdAt ? formatDateTime(row.createdAt) : '---'}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{row.createdByUserName || '---'}</td>
                      <td className="px-4 py-3 text-slate-700">
                        <span className={!row.assigneeUserName ? 'italic text-slate-400' : ''}>
                          {row.assigneeUserName || 'Chưa gán'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-700">
                        {row.detailCount ?? '---'}
                      </td>
                      <td className="px-4 py-3 text-center">{renderStatusBadge(row.status)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(row);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                          title="Xem chi tiết"
                        >
                          <Eye size={14} /> Xem
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginationMeta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
            <span className="text-sm text-slate-500">
              Hiển thị {(pageNumber - 1) * pageSize + 1} -{' '}
              {Math.min(pageNumber * pageSize, paginationMeta.totalCount)} /{' '}
              {paginationMeta.totalCount} phiếu
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                className="rounded border p-1.5 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 text-sm font-semibold">
                Trang {pageNumber} / {paginationMeta.totalPages}
              </span>
              <button
                disabled={pageNumber >= paginationMeta.totalPages}
                onClick={() => setPageNumber((p) => p + 1)}
                className="rounded border p-1.5 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== MODALS ==================== */}
      <CreateCheckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={(productIds, notes, assigneeUserId) => {
          handleCreate(productIds, notes, assigneeUserId);
          setIsCreateModalOpen(false);
        }}
      />

      <InventoryCheckDetailModal
        isOpen={!!selectedCheckId}
        onClose={closeDetail}
        ticketId={selectedCheckId}
        ticketData={selectedCheckData}
        onFillSubmit={handleFillSubmit}
        onApproveSubmit={handleApprove}
        onRejectSubmit={handleReject}
        onCancelSubmit={handleCancel}
        onDeleteSubmit={handleDelete}
        onEditClick={(data) => {
          setEditTicketData(data);
          closeDetail();
        }}
      />

      <EditCheckModal
        isOpen={!!editTicketData}
        onClose={() => setEditTicketData(null)}
        detailData={editTicketData}
        branches={branches}
        onSave={(id, payload) => {
          updateInventoryCheck(id, payload)
            .then((res) => {
              if (res?.success) {
                alert('Cập nhật phiếu kiểm kê thành công!');
                fetchChecks();
              }
            })
            .catch((err) => alert(err?.data?.message || err?.message || 'Lỗi cập nhật phiếu.'));
          setEditTicketData(null);
        }}
      />
    </div>
  );
};

export default InventoryCheckList;
