import { apiPost, apiGet } from '../../../services/apiClient';
import { ENDPOINTS } from '../../../services/endpoints';

/**
 * 1. Báo cáo cuối ngày (Chốt ca)
 */
export const getDailyEndReport = (payload) => {
  return apiPost(ENDPOINTS.REPORTS.DAILY_END, payload);
};

/**
 * 2. Báo cáo xuất nhập tồn
 */
export const getStockMovementReport = (payload) => {
  return apiPost(ENDPOINTS.REPORTS.STOCK_MOVEMENT, payload);
};

/**
 * 3. Báo cáo doanh thu theo thời gian
 */
export const getRevenueByTimeReport = (payload) => {
  return apiPost(ENDPOINTS.REPORTS.REVENUE_BY_TIME, payload);
};

/**
 * 4. Báo cáo tồn kho sắp hết
 */
export const getLowStockReport = (payload) => {
  return apiPost(ENDPOINTS.REPORTS.LOW_STOCK, payload);
};

/**
 * 5. Báo cáo doanh thu/lợi nhuận theo sản phẩm
 */
export const getProductProfitReport = (payload) => {
  return apiPost(ENDPOINTS.REPORTS.PRODUCT_PROFIT, payload);
};

/**
 * 6. Chi tiết nhà cung cấp (Công nợ / Lịch sử nhập)
 */
export const getSupplierDetailReport = (payload) => {
  return apiPost(ENDPOINTS.REPORTS.SUPPLIER_DETAIL, payload);
};

/**
 * 7. Thẻ kho chi tiết (Drill-down)
 */
export const getStockLedger = (branchProductId, params = {}) => {
  const clean = {};
  if (params.fromDate) clean.fromDate = new Date(params.fromDate).toLocaleDateString('sv-SE'); // yyyy-MM-dd
  if (params.toDate) clean.toDate = new Date(params.toDate).toLocaleDateString('sv-SE');
  if (params.pageSize) clean.pageSize = params.pageSize;
  const qs = new URLSearchParams(clean).toString();
  const url = `${ENDPOINTS.REPORTS.STOCK_LEDGER(branchProductId)}${qs ? '?' + qs : ''}`;
  return apiGet(url);
};

/**
 * 8. Chốt tồn kho cuối ngày
 */
export const createDailySnapshot = (branchId) => {
  const qs = branchId ? `?branchIdOverride=${branchId}` : '';
  return apiPost(ENDPOINTS.REPORTS.SNAPSHOT_DAILY + qs);
};
