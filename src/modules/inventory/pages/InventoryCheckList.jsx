import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import { useInventoryCheckManager } from '../hooks/useInventoryCheckManager';
import InventoryCheckTable from '../components/check/InventoryCheckTable';
import CreateCheckModal from '../components/check/CreateCheckModal';
import InventoryCheckDetailModal from '../components/check/InventoryCheckDetailModal';

const InventoryCheckList = () => {
  const {
    checks,
    loading,
    status,
    setStatus,
    branchId,
    pageNumber,
    setPageNumber,
    paginationMeta,
    handleCreateCheck,
    handleFillCheck,
  } = useInventoryCheckManager();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const openCreateModal = () => setIsCreateModalOpen(true);
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

      <div className="flex w-fit items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <label className="ml-1 text-sm font-semibold text-slate-600">Lọc trạng thái:</label>
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
        branchId={branchId}
        onSave={(productIds, notes) => handleCreateCheck(productIds, notes, null, closeCreateModal)}
      />

      <InventoryCheckDetailModal
        isOpen={!!selectedTicketId}
        onClose={closeDetailModal}
        ticketId={selectedTicketId}
        onFillSubmit={handleFillCheck}
      />
    </div>
  );
};

export default InventoryCheckList;
