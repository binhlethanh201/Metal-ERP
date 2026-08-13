import { apiPosGet } from '../../../services/apiClient';

/**
 * Lấy danh sách hàng hóa bảo hành / đổi trả do lỗi (EXCHANGE)
 * @param {Object} params - Các tham số query string (page, pageSize, search, fromDate, toDate)
 */
export const getDefectiveItems = async (params) => {
  const qs = new URLSearchParams(params).toString();
  return await apiPosGet(`/pos/returns/defective-items${qs ? '?' + qs : ''}`);
};
