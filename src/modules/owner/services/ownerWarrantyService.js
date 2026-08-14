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

export const assignSupplier = async (warrantyId, supplierId) => {
  return await apiPost(`/api/warranty/${warrantyId}/assign-supplier`, { supplierId });
};

export const acceptWarrantyReturn = async (warrantyId) => {
  return await apiPost(`/api/warranty/${warrantyId}/accept`);
};

export const getSupplierWarrantyBatches = async (params) => {
  const qs = new URLSearchParams(params).toString();
  return await apiGet(`/api/warranty/supplier-batches?${qs}`);
};
