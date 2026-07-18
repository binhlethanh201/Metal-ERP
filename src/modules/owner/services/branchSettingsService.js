import { apiGet, apiPut } from '../../../services/apiClient';

export const branchSettingsService = {
  // GET /api/owner/branches/{branchId}/settings
  getSettings: (branchId) => apiGet(`/api/owner/branches/${branchId}/settings`),

  // PUT /api/owner/branches/{branchId}/settings
  updateSettings: (branchId, data) =>
    apiPut(`/api/owner/branches/${branchId}/settings`, {
      returnDaysAllowed: data.returnDaysAllowed,
      exchangeDaysAllowed: data.exchangeDaysAllowed,
    }),
};

export default branchSettingsService;
