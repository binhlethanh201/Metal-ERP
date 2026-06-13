/**
 * OrderList - Trang Quản lý Đơn hàng (orchestrator)
 * Kết hợp tất cả các component con đã được tách nhỏ.
 */
import React, { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { useOrderFilters } from '../hooks/useOrderFilters';
import { useOrderColumns } from '../hooks/useOrderColumns';
import { useReconciliation } from '../hooks/useReconciliation';
import { useOrderStats } from '../hooks/useOrderStats';
import OrderToolbar from '../components/order/OrderToolbar';
import OrderFilters from '../components/order/OrderFilters';
import OrderSplitTable from '../components/order/OrderSplitTable';
import OrderDetailPanel from '../components/order/OrderDetailPanel';
import OrderPagination from '../components/order/OrderPagination';
import OrderLabelFilterModal from '../components/order/OrderLabelFilterModal';
import OrderColumnModal from '../components/order/OrderColumnModal';
import OrderReconciliationModal from '../components/order/OrderReconciliationModal';
import OrderProductStatsModal from '../components/order/OrderProductStatsModal';
import OrderStatsModal from '../components/order/OrderStatsModal';

const OrderList = () => {
  const filters = useOrderFilters();
  const columns = useOrderColumns();
  const recon = useReconciliation(
    filters.filteredOrders,
    filters.selectedOrders,
    filters.updateOrderReconciliation
  );
  const stats = useOrderStats(filters.filteredOrders);

  const [showProductStats, setShowProductStats] = useState(false);
  const [showOrderStats, setShowOrderStats] = useState(false);

  const handlePageChange = (p) => {
    filters.setPage(p);
  };

  const handlePageSizeChange = (size) => {
    filters.setPageSize(size);
    filters.setPage(1);
  };

  return (
    <div className={`space-y-4 ${filters.selectedOrder ? 'pb-[45vh]' : ''}`}>
      {/* Tiêu đề */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Đơn hàng</h1>
        <p className="mt-1 text-gray-600">Quản lý và theo dõi tất cả đơn hàng trong hệ thống</p>
      </div>

      {/* Card: toolbar + filter + table + pagination */}
      <Card padding="p-0">
        <OrderToolbar
          onReconciliation={recon.openReconciliation}
          onProductStats={() => setShowProductStats(true)}
          onOrderStats={() => setShowOrderStats(true)}
        />

        <OrderFilters
          dateCriteria={filters.dateCriteria}
          setDateCriteria={filters.setDateCriteria}
          quickDate={filters.quickDate}
          handleQuickDateChange={filters.handleQuickDateChange}
          fromDate={filters.fromDate}
          setFromDate={filters.setFromDate}
          toDate={filters.toDate}
          setToDate={filters.setToDate}
          selectedTags={filters.selectedTags}
          onOpenLabelFilter={() => filters.setShowLabelFilter(true)}
          onFetchData={filters.refreshData}
          isFetching={filters.isLoading}
          onOpenColumnModal={() => {
            columns.openColumnModal();
            filters.setShowColumnModal(true);
          }}
        />

        <OrderSplitTable
          frozenCols={columns.frozenCols}
          scrollCols={columns.scrollCols}
          pagedOrders={filters.pagedOrders}
          columnFilters={filters.columnFilters}
          selectedOrders={filters.selectedOrders}
          selectedOrder={filters.selectedOrder}
          footerTotals={filters.footerTotals}
          onSelectOrder={filters.setSelectedOrder}
          onColumnFilterChange={filters.handleColumnFilterChange}
          onToggleSelectAll={filters.toggleSelectAll}
          onToggleSelectOrder={filters.toggleSelectOrder}
        />

        <OrderPagination
          page={filters.page}
          totalPages={filters.totalPages}
          pageSize={filters.pageSize}
          filteredCount={filters.filteredOrders.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </Card>

      {/* Detail Panel */}
      <OrderDetailPanel
        order={filters.selectedOrder}
        detailTab={filters.detailTab}
        onTabChange={filters.setDetailTab}
        onClose={() => filters.setSelectedOrder(null)}
      />

      {/* Label Filter Modal */}
      <OrderLabelFilterModal
        isOpen={filters.showLabelFilter}
        onClose={() => filters.setShowLabelFilter(false)}
        selectedTags={filters.selectedTags}
        onToggleTag={(label) =>
          filters.setSelectedTags((prev) =>
            prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
          )
        }
        onClear={() => {
          filters.setSelectedTags([]);
          filters.setShowLabelFilter(false);
        }}
      />

      {/* Column Config Modal */}
      <OrderColumnModal
        isOpen={filters.showColumnModal}
        onClose={() => filters.setShowColumnModal(false)}
        editColConfig={columns.editColConfig}
        setEditColConfig={columns.setEditColConfig}
        editColOrder={columns.editColOrder}
        setEditColOrder={columns.setEditColOrder}
        selectedColKey={columns.selectedColKey}
        setSelectedColKey={columns.setSelectedColKey}
        onSave={() => {
          columns.saveColumnConfig();
          filters.setShowColumnModal(false);
        }}
        onReset={columns.resetColumnConfig}
      />

      {/* Reconciliation Modal */}
      <OrderReconciliationModal
        isOpen={recon.showReconciliation}
        step={recon.reconciliationStep}
        onClose={recon.closeReconciliation}
        onStepChange={recon.setReconciliationStep}
        unreconciledOrders={recon.unreconciledOrders}
        searchedOrders={recon.searchedOrders}
        reconSearch={recon.reconSearch}
        onSearchChange={recon.setReconSearch}
        reconciliationOrderIds={recon.reconciliationOrderIds}
        reconciliationOrders={recon.reconciliationOrders}
        reconciliationData={recon.reconciliationData}
        setReconciliationData={recon.setReconciliationData}
        summary={recon.reconciliationSummary}
        canProceed={recon.canProceed}
        onToggleOrder={recon.toggleReconciliationOrder}
        onToggleAll={recon.toggleAllReconciliationOrders}
        onSubmit={recon.submitReconciliation}
      />

      {/* Product Statistics Modal */}
      <OrderProductStatsModal
        isOpen={showProductStats}
        onClose={() => setShowProductStats(false)}
        stats={stats}
      />

      {/* Order Statistics Modal */}
      <OrderStatsModal
        isOpen={showOrderStats}
        onClose={() => setShowOrderStats(false)}
        stats={stats}
      />
    </div>
  );
};

export default OrderList;
