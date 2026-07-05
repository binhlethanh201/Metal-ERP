import React, { useState, useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
import { Card } from '../../../shared/components/Card';
import { useInventoryCheckManager } from '../hooks/useInventoryCheckManager';
import InventoryCheckTable from '../components/check/InventoryCheckTable';
import CreateCheckModal from '../components/check/CreateCheckModal';
import InventoryCheckDetailModal from '../components/check/InventoryCheckDetailModal';
import { useAuth } from '../../../shared/hooks/useAuth';
import EditCheckModal from '../components/check/EditCheckModal';
import { Filter, Layers, RotateCcw, RefreshCw, Calendar, Building2 } from 'lucide-react';

const InventoryCheckList = () => {
  const { user } = useAuth(); // Bổ sung check quyền
  const isOwner = user?.roles?.includes('Owner') || user?.role === 'Owner';

  const {
    checks,
    loading,
    status,
    setStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    branchId,
    setBranchId,
    branches,
    pageNumber,
    setPageNumber,
    paginationMeta,
    handleCreateCheck,
    handleUpdateCheck,
    handleDeleteCheck,
    handleFillCheck,
    handleApproveCheck,
    handleRejectCheck,
    handleCancelCheck,
    refetch,
    // handleReasonCheck,
  } = useInventoryCheckManager();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicketData, setSelectedTicketData] = useState(null);
  const [editTicketData, setEditTicketData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const openCreateModal = () => {
    // Chặn Owner nếu chưa chọn chi nhánh
    // if (isOwner && !branchId) {
    //   alert('Vui lòng chọn chi nhánh trước khi tạo phiếu!');
    //   return;
    // }
    setIsCreateModalOpen(true);
  };
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openDetailModal = (row, ticketId) => {
    setSelectedTicketId(ticketId || row?.ticketId || row?.id || row?.stockTicketId || null);
    setSelectedTicketData(row || null);
  };
  const closeDetailModal = () => {
    setSelectedTicketId(null);
    setSelectedTicketData(null);
  };

  const summary = useMemo(() => {
    const qty = checks.reduce((total, item) => total + Number(item.detailCount || 0), 0);
    return { totalChecks: checks.length, totalQuantity: qty, monthlyCount: checks.length };
  }, [checks]);

  return (
    <div className="animate-fade-in w-full space-y-4 text-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kiểm kê kho</h1>
          <p className="mt-1 text-gray-600">
            Quản lý các đợt kiểm đếm và điều chỉnh tồn kho thực tế
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Icon name="add" size={20} />
            <span>Tạo phiếu kiểm kê</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{summary.totalChecks}</div>
            <p className="mt-1 text-sm text-gray-600">Tổng phiếu kiểm kê</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-green-600">{summary.totalQuantity}</div>
            <p className="mt-1 text-sm text-gray-600">Tổng số lượng kiểm</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{summary.monthlyCount}</div>
            <p className="mt-1 text-sm text-gray-600">Trong tháng</p>
          </div>
        </Card>
      </div>

      {/* KHU VỰC BỘ LỌC */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Filter size={14} /> Lọc trạng thái:
            </span>
            {[
              { value: '', label: 'Mặc định' },
              { value: 'Draft', label: 'Phiếu Nháp' },
              { value: 'WaitingForApproval', label: 'Chờ duyệt' },
              { value: 'Completed', label: 'Hoàn tất' },
              { value: 'Cancelled', label: 'Đã hủy' },
            ].map((item) => {
              const isActive = (status || '') === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setStatus(item.value)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Layers size={14} className="text-sky-600" />{' '}
              {isExpanded ? 'Thu gọn bộ lọc' : 'Lọc nâng cao'}
            </button>

            {(status || startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStatus('');
                  setStartDate('');
                  setEndDate('');
                }}
                className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                title="Xóa toàn bộ bộ lọc"
              >
                <RotateCcw size={13} /> Đặt lại
              </button>
            )}
          </div>
        </div>

        {/* Hàng 2: Bộ lọc nâng cao (Mở rộng) */}
        {isExpanded && (
          <div className="animate-in fade-in grid grid-cols-1 gap-3 border-t border-slate-200/80 pt-3 duration-200 sm:grid-cols-2 lg:grid-cols-3">
            {/* Lọc theo thời gian */}
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-600">
                <Calendar size={13} /> Thời gian tạo:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <InventoryCheckTable
          rows={checks}
          loading={loading}
          onRowClick={openDetailModal}
          isOwner={isOwner}
          onApprove={(id) => handleApproveCheck(id, () => {})}
          onCancel={(id) => handleCancelCheck(id, '', () => {})}
        />
      </div>

      {paginationMeta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => p - 1)}
            className="rounded border p-2 hover:bg-slate-50 disabled:opacity-50"
          >
            <Icon name="chevron_left" />
          </button>
          <span className="text-sm font-semibold">
            Trang {pageNumber} / {paginationMeta.totalPages}
          </span>
          <button
            disabled={pageNumber >= paginationMeta.totalPages}
            onClick={() => setPageNumber((p) => p + 1)}
            className="rounded border p-2 hover:bg-slate-50 disabled:opacity-50"
          >
            <Icon name="chevron_right" />
          </button>
        </div>
      )}

      <CreateCheckModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        initialBranchId={branchId}
        branches={branches}
        onSave={(productIds, notes, assigneeUserId, selectedBranchId) =>
          handleCreateCheck(productIds, notes, assigneeUserId, selectedBranchId, closeCreateModal)
        }
      />

      <InventoryCheckDetailModal
        isOpen={!!selectedTicketId || !!selectedTicketData}
        onClose={closeDetailModal}
        ticketId={selectedTicketId}
        ticketData={selectedTicketData}
        onFillSubmit={handleFillCheck}
        onApproveSubmit={handleApproveCheck}
        onRejectSubmit={handleRejectCheck}
        onCancelSubmit={handleCancelCheck}
        onDeleteSubmit={handleDeleteCheck}
        onEditClick={(data) => {
          setEditTicketData(data);
          closeDetailModal();
        }}
      />

      <EditCheckModal
        isOpen={!!editTicketData}
        onClose={() => setEditTicketData(null)}
        detailData={editTicketData}
        branches={branches}
        onSave={(id, payload) => {
          handleUpdateCheck(id, payload, () => {
            setEditTicketData(null);
            setSelectedTicketId(id);
          });
        }}
      />
    </div>
  );
};

export default InventoryCheckList;
