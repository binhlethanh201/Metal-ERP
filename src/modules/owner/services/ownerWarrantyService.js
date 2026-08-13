import { apiGet } from '../../../services/apiClient';

export const getOwnerDefectiveItems = async (params) => {
  return await apiGet('/api/pos/returns/defective-items', { params });
};
