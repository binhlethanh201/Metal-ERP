import { apiGet, apiPut, apiPost } from './apiClient';

export const accountService = {
  // GET /account-settings/me
  getProfile: () => apiGet('/api/account-settings/me'),

  // PUT /account-settings/me
  updateProfile: (data) =>
    apiPut('/api/account-settings/me', {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
    }),

  //POST /account-settings/me/change-password
  changePassword: (data) =>
    apiPost('/api/account-settings/me/change-password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    }),
};

export default accountService;
