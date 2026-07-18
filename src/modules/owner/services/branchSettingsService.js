import { apiGet, apiPut } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

export const branchSettingsService = {
  // GET /api/owner/branches/{branchId}/settings
  getSettings: (branchId) => apiGet(ENDPOINTS.OWNER.BRANCH_SETTINGS(branchId)),

  // PUT /api/owner/branches/{branchId}/settings
  updateSettings: (branchId, data) =>
    apiPut(ENDPOINTS.OWNER.BRANCH_SETTINGS(branchId), {
      returnDaysAllowed: data.returnDaysAllowed,
      exchangeDaysAllowed: data.exchangeDaysAllowed,
    }),

  // GET /api/owner/branches/{branchId}/return-policies/categories
  getCategoryPolicies: (branchId) => apiGet(ENDPOINTS.OWNER.CATEGORY_RETURN_POLICIES(branchId)),

  // PUT /api/owner/branches/{branchId}/return-policies/categories
  updateCategoryPolicies: (branchId, policies) =>
    apiPut(ENDPOINTS.OWNER.CATEGORY_RETURN_POLICIES(branchId), { policies }),
};

export default branchSettingsService;
