import { apiGet, apiPost } from '../../../services/apiClient';

export const getOwnerDefectiveItems = async (params) => {
  return await apiGet('/api/pos/returns/defective-items', { params });
};

export const initWarrantyFromReturn = async (returnItemId) => {
  return await apiPost(`/api/warranty/init/${returnItemId}`);
};

export const getSuggestedSuppliers = async (productId) => {
  return await apiGet(`/api/warranty/${productId}/suggested-suppliers`);
};

export const assignSupplier = async (warrantyId, supplierId, totalClaimQty) => {
  const body = { supplierId };
  // Cho phép chọn SL gửi BH (BH một phần). totalClaimQty theo ĐVT cơ bản (cái).
  if (totalClaimQty != null && !Number.isNaN(Number(totalClaimQty))) {
    body.totalClaimQty = Number(totalClaimQty);
  }
  return await apiPost(`/api/warranty/${warrantyId}/assign-supplier`, body);
};

export const acceptWarrantyReturn = async (warrantyId) => {
  return await apiPost(`/api/warranty/${warrantyId}/accept`);
};

export const getSupplierWarrantyBatches = async (params) => {
  const qs = new URLSearchParams(params).toString();
  return await apiGet(`/api/warranty/supplier-batches${qs ? `?${qs}` : ''}`);
};
