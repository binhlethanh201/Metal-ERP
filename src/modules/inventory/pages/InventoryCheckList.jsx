import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import { useInventoryCheckManager } from '../hooks/useInventoryCheckManager';
import InventoryCheckTable from '../components/check/InventoryCheckTable';
import CreateCheckModal from '../components/check/CreateCheckModal';
import InventoryCheckDetailModal from '../components/check/InventoryCheckDetailModal';
import { useAuth } from '../../../shared/hooks/useAuth';
import EditCheckModal from '../components/check/EditCheckModal';

const InventoryCheckList = () => {
  const { user } = useAuth(); // Bổ sung check quyền
  const isOwner = user?.roles?.includes('Owner') || user?.role === 'Owner';

  const {
    checks,
    loading,
    status,
    setStatus,
    branchId,
    setBranchId,
    branches,
    pageNumber,
    setPageNumber,
    paginationMeta,
    handleCreateCheck,
    handleFillCheck,
    handleApproveCheck,
    handleRejectCheck,
  } = useInventoryCheckManager();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [editTicketData, setEditTicketData] = useState(null);
  const { handleUpdateCheck } = useInventoryCheckManager();

  const openCreateModal = () => {
    // Chặn Owner nếu chưa chọn chi nhánh
    if (isOwner && !branchId) {
      alert('Vui lòng chọn chi nhánh trước khi tạo phiếu!');
      return;
    }
    setIsCreateModalOpen(true);
  };
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openDetailModal = (ticketId) => setSelectedTicketId(ticketId);
  const closeDetailModal = () => setSelectedTicketId(null);

  return (
    <div className="animate-fade-in w-full space-y-4 text-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kiểm kê kho</h1>
          <p className="mt-1 text-gray-600">
            Quản lý các đợt kiểm đếm và điều chỉnh tồn kho thực tế
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Icon name="add" size={20} />
          <span>Tạo phiếu kiểm kê</span>
        </button>
      </div>

      {/* KHU VỰC BỘ LỌC */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Dropdown Chi nhánh (Chỉ hiện cho Owner) */}
        {isOwner && (
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <label className="text-sm font-semibold text-slate-600">Chi nhánh:</label>
            <select
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm font-medium focus:border-blue-500 focus:outline-none"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
            >
              <option value="">-- Chọn chi nhánh --</option>
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName || b.branchCode}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex w-fit items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <label className="text-sm font-semibold text-slate-600">Lọc trạng thái:</label>
          <select
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm font-medium focus:border-blue-500 focus:outline-none"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Draft">Phiếu Nháp</option>
            <option value="WaitingForApproval">Chờ Duyệt</option>
            <option value="Completed">Đã Hoàn Thành</option>
            <option value="Cancelled">Đã Hủy</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <InventoryCheckTable rows={checks} loading={loading} onRowClick={openDetailModal} />
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
        isOpen={!!selectedTicketId}
        onClose={closeDetailModal}
        ticketId={selectedTicketId}
        onFillSubmit={handleFillCheck}
        onApproveSubmit={handleApproveCheck}
        onRejectSubmit={handleRejectCheck}
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
