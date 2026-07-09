import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
import { Card } from '../../../shared/components/Card';
import CreateCheckModal from '../components/check/CreateCheckModal';
import InventoryCheckDetailModal from '../components/check/InventoryCheckDetailModal';
import EditCheckModal from '../components/check/EditCheckModal';
import {
  getInventoryChecks,
  createInventoryCheck,
  updateInventoryCheck,
} from '../services/inventoryCheckService';
import {
  Filter,
  RefreshCw,
  AlertCircle,
  X,
  Eye,
  CheckCircle2,
  Clock,
  FileEdit,
  XCircle,
  Layers,
  RotateCcw,
} from 'lucide-react';

// Import Shared Components
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import Table from '../../../shared/components/Table';
import Badge from '../../../shared/components/Badge';
import Drawer from '../../../shared/components/Drawer';
import IconButton from '../../../shared/components/IconButton';

// ==================== FORMAT DATE ====================
const formatDateTime = (dateString) => {
  if (!dateString) return '---';
  const date = new Date(dateString.endsWith('Z') ? dateString : `${dateString}Z`);
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
};

const formatUserName = (name) => {
  if (!name) return '';
  // Nếu là email, chỉ lấy phần trước @
  let username = name;
  const atIndex = name.indexOf('@');
  if (atIndex > 0) username = name.slice(0, atIndex);

  // Chuyển "tran_van_bac", "tran.van.bac", "tranvanbac" → "Trần Văn Bắc"
  return username
    .replace(/[._]/g, ' ') // thay . _ bằng khoảng trắng
    .replace(/([a-z])([A-Z])/g, '$1 $2') // tách camelCase
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};
const InventoryCheckList = () => {
  // ---- Trạng thái danh sách ----
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // ---- Bộ lọc ----
  const [searchCode, setSearchCode] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State quản lý Drawer bộ lọc thay vì hiển thị inline
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // ---- Phân trang ----
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [paginationMeta, setPaginationMeta] = useState({ totalCount: 0, totalPages: 1 });

  // Khi đổi pageSize thì về trang 1
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPageNumber(1);
  };

  // ---- Modal tạo phiếu ----
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ---- Chi tiết phiếu ----
  const [selectedCheckId, setSelectedCheckId] = useState(null);

  // ---- Modal sửa phiếu ----
  const [editTicketData, setEditTicketData] = useState(null);

  // ==================== LỌC STATUS BADGE BẰNG SHARED COMPONENT ====================
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Draft':
        return (
          <Badge variant="secondary" size="sm" className="inline-flex items-center gap-1">
            <FileEdit size={12} /> Nháp
          </Badge>
        );
      case 'WaitingForApproval':
        return (
          <Badge variant="warning" size="sm" className="inline-flex items-center gap-1">
            <Clock size={12} className="animate-pulse" /> Chờ duyệt
          </Badge>
        );
      case 'Completed':
        return (
          <Badge variant="success" size="sm" className="inline-flex items-center gap-1">
            <CheckCircle2 size={12} /> Hoàn thành
          </Badge>
        );
      case 'Cancelled':
        return (
          <Badge variant="danger" size="sm" className="inline-flex items-center gap-1">
            <XCircle size={12} /> Đã hủy
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" size="sm" className="inline-flex items-center gap-1">
            {status}
          </Badge>
        );
    }
  };

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

  useEffect(() => {
    setPageNumber(1);
  }, [searchCode, statusFilter, startDate, endDate]);

  // ==================== ACTION HANDLERS ====================
  const handleCreate = async (productIds, notes, assigneeUserId) => {
    setLoading(true);
    setGlobalError('');
    try {
      const res = await createInventoryCheck(productIds, notes, assigneeUserId);
      if (res?.success && res.data) {
        setIsCreateModalOpen(false);
        await fetchChecks();
        const newTicketId = res.data.ticketId;
        if (newTicketId) {
          setSelectedCheckId(newTicketId);
        }
      }
    } catch (err) {
      setGlobalError(err?.data?.message || err?.message || 'Lỗi khi tạo phiếu kiểm kê.');
    } finally {
      setLoading(false);
    }
  };

  const handleDetailActionSuccess = useCallback(() => {
    fetchChecks();
  }, [fetchChecks]);

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

  // Đếm số lượng bộ lọc nâng cao đang áp dụng để hiển thị Badge
  let activeFilterCount = 0;
  if (searchCode) activeFilterCount++;
  if (startDate) activeFilterCount++;
  if (endDate) activeFilterCount++;

  // ==================== CẤU HÌNH CỘT CHO SHARED TABLE ====================
  const tableColumns = [
    {
      key: 'ticketCode',
      header: 'Mã phiếu',
      render: (_, row) => (
        <div className="flex flex-col items-start gap-1">
          <button
            type="button"
            onClick={() => setSelectedCheckId(row.ticketId || row.id || row.inventoryCheckId)}
            className="text-left font-bold text-[#004785] transition-colors hover:underline"
            title="Click để xem chi tiết"
          >
            {row.ticketCode}
          </button>
          {row.recountNumber > 0 && (
            <span className="w-fit rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
              Đếm lại (Lần {row.recountNumber})
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (_, row) => (
        <span className="text-xs text-slate-500">
          {row.createdAt ? formatDateTime(row.createdAt) : '---'}
        </span>
      ),
    },
    {
      key: 'createdByUserName',
      header: 'Người tạo',
      render: (_, row) => (
        <span className="text-slate-700">{formatUserName(row.createdByUserName) || '---'}</span>
      ),
    },
    {
      key: 'assigneeUserName',
      header: 'Người phụ trách',
      render: (_, row) => (
        <span className={!row.assigneeUserName ? 'italic text-slate-400' : 'text-slate-700'}>
          {formatUserName(row.assigneeUserName) || 'Chưa gán'}
        </span>
      ),
    },
    {
      key: 'detailCount',
      header: 'Sản phẩm',
      render: (_, row) => (
        <div className="text-center font-semibold text-slate-700">{row.detailCount ?? '---'}</div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (_, row) => (
        <div className="flex justify-center">{renderStatusBadge(row.status)}</div>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (_, row) => {
        const checkId = row.ticketId || row.id || row.inventoryCheckId;
        return (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCheckId(checkId)}
              className="flex items-center gap-1 !border-none !bg-blue-50 text-blue-600 hover:!bg-blue-100"
              title="Xem chi tiết"
            >
              <Eye size={14} /> Xem
            </Button>
          </div>
        );
      },
    },
  ];

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
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Icon name="add" size={20} />
          Tạo phiếu kiểm kê mới
        </Button>
      </div>

      {/* ==================== STATS CARDS ==================== */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <div className="py-3 text-center">
            <div className="text-2xl font-bold text-[#004785]">{summary.totalCount}</div>
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
          <IconButton icon={X} variant="ghost" size="sm" onClick={() => setGlobalError('')} />
        </div>
      )}

      {/* ==================== FILTERS (Tích hợp Shared Button & Drawer) ==================== */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Lọc trạng thái (Truy cập nhanh) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Filter size={14} /> Trạng thái:
            </span>
            {[
              { value: '', label: 'Tất cả' },
              { value: 'Draft', label: 'Nháp' },
              { value: 'WaitingForApproval', label: 'Chờ duyệt' },
              { value: 'Completed', label: 'Hoàn thành' },
              { value: 'Cancelled', label: 'Đã hủy' },
            ].map((item) => {
              const isActive = statusFilter === item.value;
              return (
                <Button
                  key={item.value}
                  variant={isActive ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(item.value)}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Hành động nhanh */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchChecks}
              disabled={loading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Layers size={14} className="text-[#004785]" />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#004785] px-1 text-[11px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {(statusFilter || startDate || endDate || searchCode) && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setStatusFilter('');
                  setStartDate('');
                  setEndDate('');
                  setSearchCode('');
                  setPageNumber(1);
                }}
                className="flex items-center gap-1"
                title="Xóa toàn bộ bộ lọc"
              >
                <RotateCcw size={13} /> Đặt lại
              </Button>
            )}
          </div>
        </div>

        {/* ==================== DRAWER LỌC NÂNG CAO ==================== */}
        <Drawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          title="Bộ lọc phiếu kiểm kê"
          widthClass="max-w-sm"
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchCode('');
                  setStartDate('');
                  setEndDate('');
                  setIsFilterDrawerOpen(false);
                }}
              >
                Đặt lại
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsFilterDrawerOpen(false)}>
                Đóng
              </Button>
            </>
          }
        >
          <div className="space-y-5">
            <Input
              label="Tìm mã phiếu"
              placeholder="VD: KKK00001..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
            />
            <Input
              type="date"
              label="Từ ngày"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              label="Đến ngày"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </Drawer>
      </div>

      {/* ==================== BẢNG DANH SÁCH BẰNG SHARED TABLE ==================== */}
      <Table
        columns={tableColumns}
        data={checks}
        loading={loading}
        emptyMessage="Không tìm thấy phiếu kiểm kê nào."
      />

      {/* ==================== PHÂN TRANG ==================== */}
      {!loading && paginationMeta.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary"
              >
                <option value={20}>20 dòng</option>
                <option value={50}>50 dòng</option>
                <option value={100}>100 dòng</option>
              </select>
            </div>
            <span>
              {(pageNumber - 1) * pageSize + 1} -{' '}
              {Math.min(pageNumber * pageSize, paginationMeta.totalCount)} trong tổng số{' '}
              {paginationMeta.totalCount} phiếu
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </button>
            <div className="px-3 text-sm text-slate-700">
              Trang {pageNumber} / {paginationMeta.totalPages}
            </div>
            <button
              type="button"
              onClick={() => setPageNumber((p) => p + 1)}
              disabled={pageNumber >= paginationMeta.totalPages}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      <CreateCheckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
      />

      <InventoryCheckDetailModal
        isOpen={!!selectedCheckId}
        onClose={() => setSelectedCheckId(null)}
        ticketId={selectedCheckId}
        onActionSuccess={handleDetailActionSuccess}
        onEditClick={(data) => {
          setSelectedCheckId(null);
          setEditTicketData(data);
        }}
      />

      <EditCheckModal
        isOpen={!!editTicketData}
        onClose={() => setEditTicketData(null)}
        detailData={editTicketData}
        onSave={(id, payload) => {
          updateInventoryCheck(id, payload)
            .then((res) => {
              if (res?.success) {
                setEditTicketData(null);
                fetchChecks();
              }
            })
            .catch((err) =>
              setGlobalError(err?.data?.message || err?.message || 'Lỗi cập nhật phiếu.')
            );
        }}
      />
    </div>
  );
};

export default InventoryCheckList;
