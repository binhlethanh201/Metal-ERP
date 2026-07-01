import { apiPost } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

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
