import { useState, useEffect, useCallback } from 'react';
import { accountService } from '../../services/accountService';
import { validateAccountProfile, validatePasswordChange } from '../utils/accountValidation';

export const useAccountSettings = (onProfileUpdated) => {
  // ─── Profile state ───────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    username: '',
    roles: [],
    status: '',
    createdAt: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [profileMessage, setProfileMessage] = useState(null);

  // ─── Password state ──────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState(null);

  // ─── Load profile ────────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileMessage(null);
    try {
      const res = await accountService.getProfile();
      if (res?.data) {
        setProfile(res.data);
      }
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: err?.message || 'Không thể tải thông tin tài khoản.',
      });
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ─── Update profile field ────────────────────────────────────────────────
  const setProfileField = useCallback((field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    // Xoá lỗi field đó khi user bắt đầu nhập lại
    setProfileErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  // ─── Save profile ────────────────────────────────────────────────────────
  const saveProfile = useCallback(async () => {
    const errors = validateAccountProfile(profile);
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileSaving(true);
    setProfileMessage(null);
    try {
      const res = await accountService.updateProfile({
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
      });
      if (res?.data) {
        setProfile(res.data);
      }
      setProfileMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      if (typeof onProfileUpdated === 'function') {
        onProfileUpdated({ fullName: profile.fullName });
      }
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: err?.message || 'Cập nhật thất bại. Vui lòng thử lại.',
      });
    } finally {
      setProfileSaving(false);
    }
  }, [profile, onProfileUpdated]);

  // ─── Update password field ───────────────────────────────────────────────
  const setPasswordField = useCallback((field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  // ─── Change password ─────────────────────────────────────────────────────
  const changePassword = useCallback(async () => {
    const errors = validatePasswordChange(passwordForm);
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordSaving(true);
    setPasswordMessage(null);
    try {
      await accountService.changePassword(passwordForm);
      setPasswordMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: err?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.',
      });
    } finally {
      setPasswordSaving(false);
    }
  }, [passwordForm]);

  return {
    profile,
    profileLoading,
    profileSaving,
    profileErrors,
    profileMessage,
    setProfileField,
    saveProfile,
    reloadProfile: loadProfile,
    passwordForm,
    passwordSaving,
    passwordErrors,
    passwordMessage,
    setPasswordField,
    changePassword,
    resetPasswordState: () => {
      setPasswordMessage(null);
      setPasswordErrors({});
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
  };
};

export default useAccountSettings;
