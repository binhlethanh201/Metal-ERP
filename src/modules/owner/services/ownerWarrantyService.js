import { apiGet, apiPost, apiPut } from '../../../services/apiClient';

/**
 * Warranty Service - căn cứ theo BE hiện tại (WarrantyController, route /api/warranty).
 *
 * Lưu ý quan trọng: BE hiện chỉ quản lý WarrantyClaim (tạo claim + đổi trạng thái).
 * KHÔNG có endpoint gán Nhà cung cấp (assign-supplier) hay nhận hàng (accept) cho claim.
 * Do đó workflow "chọn NCC -> gửi BH -> nhận hàng về" của FE cũ được map sang:
 *   - init    -> createWarrantyClaim  (tạo claim, trả về claimId)
 *   - assign  -> updateWarrantyClaimStatus(claimId, 'AWAITING_SUPPLIER', notes)
 *   - accept  -> updateWarrantyClaimStatus(claimId, 'COMPLETED')
 * Việc chọn NCC cụ thể KHÔNG được BE persist (gap chức năng - cần BE bổ sung nếu muốn).
 */

// Hàng lỗi/hỏng (lấy từ ReturnsController, đã có sẵn)
export const getOwnerDefectiveItems = async (params) => {
  return await apiGet('/api/pos/returns/defective-items', { params });
};

/**
 * Tạo phiếu bảo hành (WarrantyClaim) từ một return item.
 * POST /api/warranty?productId=&ticketItemId=
 * @param {Object} args - { productId, ticketItemId, quantity, claimType?, issueDescription?, customerName?, customerPhone?, replacementProductId? }
 * @returns { claimId, claimCode, status, remainingWarranty }
 */
export const createWarrantyClaim = async ({
  productId,
  ticketItemId,
  quantity,
  claimType = 'REPAIR',
  issueDescription,
  customerName,
  customerPhone,
  replacementProductId,
}) => {
  const qs = new URLSearchParams({
    productId,
    ticketItemId,
  }).toString();
  const body = {
    quantity: Number(quantity) || 1,
    claimType,
    ...(issueDescription ? { issueDescription } : {}),
    ...(customerName ? { customerName } : {}),
    ...(customerPhone ? { customerPhone } : {}),
    ...(replacementProductId ? { replacementProductId } : {}),
  };
  return await apiPost(`/api/warranty?${qs}`, body);
};

/**
 * Cập nhật trạng thái WarrantyClaim.
 * PUT /api/warranty/claims/{claimId}/status
 * @param {string} claimId
 * @param {string} status - PENDING / AWAITING_SUPPLIER / COMPLETED / REJECTED ... (BE uppercase, free-form)
 * @param {string?} processNotes
 */
export const updateWarrantyClaimStatus = async (claimId, status, processNotes) => {
  const body = { status };
  if (processNotes) body.processNotes = processNotes;
  return await apiPut(`/api/warranty/claims/${claimId}/status`, body);
};

/** GET /api/warranty/claims?productId=&status= */
export const getWarrantyClaims = async ({ productId, status } = {}) => {
  const params = new URLSearchParams();
  if (productId) params.set('productId', productId);
  if (status) params.set('status', status);
  const qs = params.toString();
  return await apiGet(`/api/warranty/claims${qs ? `?${qs}` : ''}`);
};

/** GET /api/warranty/claims/{claimId} */
export const getWarrantyClaim = async (claimId) => {
  return await apiGet(`/api/warranty/claims/${claimId}`);
};

// --- Các endpoint đọc (giữ nguyên như cũ) ---

export const getSuggestedSuppliers = async (productId) => {
  return await apiGet(`/api/warranty/${productId}/suggested-suppliers`);
};

export const getSupplierWarrantyBatches = async (params) => {
  const qs = new URLSearchParams(params).toString();
  return await apiGet(`/api/warranty/supplier-batches${qs ? `?${qs}` : ''}`);
};
