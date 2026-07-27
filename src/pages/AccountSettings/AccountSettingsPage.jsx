import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '../../shared/components/Button';
import Icon from '../../shared/components/Icon';
import Badge from '../../shared/components/Badge';
import { useAuth } from '../../shared/hooks/useAuth';
import { useAccountSettings } from '../../shared/hooks/useAccountSettings';
import { formatAccountStatus, getStatusBadgeVariant } from '../../shared/utils/accountValidation';

// FieldInput
const FieldInput = ({ label, error, disabled, type = 'text', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#808080]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          disabled={disabled}
          className={[
            'w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2',
            error
              ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-[#004785] focus:ring-blue-50 dark:border-[#404040]',
            disabled ? 'cursor-not-allowed bg-slate-50 text-slate-400 dark:bg-[#1a1a1a] dark:text-[#808080]' : 'bg-white text-slate-800 dark:bg-[#0f0f0f] dark:text-[#e5e5e5]',
            isPassword ? 'pr-10' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-[#808080] dark:hover:text-[#b3b3b3]"
          >
            <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={15} />
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
          <Icon name="error" size={12} />
          {error}
        </p>
      )}
    </div>
  );
};

// AlertBanner
const AlertBanner = ({ message }) => {
  if (!message) return null;
  const isSuccess = message.type === 'success';
  return (
    <div
      className={[
        'flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium',
        isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700',
      ].join(' ')}
    >
      <Icon name={isSuccess ? 'check_circle' : 'error'} size={15} />
      {message.text}
    </div>
  );
};

// ChangePasswordModal
const ChangePasswordModal = ({ isOpen, onClose, hook }) => {
  const {
    passwordForm,
    passwordSaving,
    passwordErrors,
    passwordMessage,
    setPasswordField,
    changePassword,
    resetPasswordState,
  } = hook;

  // Tự đóng modal 1.2s sau khi đổi mật khẩu thành công
  React.useEffect(() => {
    if (!isOpen) return;
    if (passwordMessage?.type === 'success') {
      const timer = setTimeout(() => {
        resetPasswordState();
        onClose();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [passwordMessage, isOpen, onClose, resetPasswordState]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetPasswordState();
    onClose();
  };
  const handleSubmit = () => changePassword();

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm dark:bg-[#0a0a0a]/70" onClick={handleClose} />
      {/* Modal panel */}
      <div className="relative z-10 mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#0f0f0f]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-[#333333]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#004785]/10">
              <Icon name="shield" size={16} className="text-[#004785]" />
            </div>
            <span className="font-bold text-slate-800 dark:text-[#e5e5e5]">Đổi mật khẩu</span>
          </div>
          <button
            onClick={handleClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-[#808080] dark:hover:bg-[#333333] dark:hover:text-[#b3b3b3]"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Hint */}
          <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500 dark:bg-[#1a1a1a] dark:text-[#999999]">
            Mật khẩu mới phải có ít nhất{' '}
            <span className="font-semibold text-slate-700 dark:text-[#b3b3b3]">6 ký tự</span>. Sau khi đổi thành công,
            bạn sẽ dùng mật khẩu mới để đăng nhập lần tiếp theo.
          </p>

          <FieldInput
            label="Mật khẩu hiện tại"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordField('currentPassword', e.target.value)}
            error={passwordErrors.currentPassword}
            placeholder="Nhập mật khẩu hiện tại"
          />
          <FieldInput
            label="Mật khẩu mới"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordField('newPassword', e.target.value)}
            error={passwordErrors.newPassword}
            placeholder="Ít nhất 6 ký tự"
          />
          <FieldInput
            label="Xác nhận mật khẩu mới"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordField('confirmPassword', e.target.value)}
            error={passwordErrors.confirmPassword}
            placeholder="Nhập lại mật khẩu mới"
          />

          <AlertBanner message={passwordMessage} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-[#333333] dark:bg-[#1a1a1a]/60">
          <Button variant="secondary" onClick={handleClose} size="md">
            Huỷ
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={passwordSaving} size="md">
            Xác nhận đổi mật khẩu
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// InfoRow
const InfoRow = ({ label, children }) => (
  <div className="flex items-start gap-4 border-b border-slate-100 py-3 last:border-0 dark:border-[#333333]">
    <span className="w-32 shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#808080]">
      {label}
    </span>
    <div className="flex-1 text-sm text-slate-800 dark:text-[#e5e5e5]">{children}</div>
  </div>
);

// Main Page
const AccountSettingsPage = () => {
  const { user, setUser } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleProfileUpdated = ({ fullName }) => {
    if (typeof setUser === 'function') {
      setUser((prev) => ({ ...prev, fullName }));
    }
  };

  const hook = useAccountSettings(handleProfileUpdated);
  const {
    profile,
    profileLoading,
    profileSaving,
    profileErrors,
    profileMessage,
    setProfileField,
    saveProfile,
  } = hook;

  const displayName = profile.fullName || user?.fullName || user?.name || 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const roles = profile.roles || (user?.roles ? user.roles : user?.role ? [user.role] : []);

  return (
    <>
      <div className="animate-fade-in mx-auto w-full max-w-2xl space-y-5 pb-10">
        {/* ── Page header ── */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e5e5e5]">Cài đặt tài khoản</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-[#999999]">Quản lý thông tin cá nhân của bạn</p>
        </div>

        {/* ── Profile card ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
          {/* Avatar banner */}
          <div className="bg-gradient-to-r from-[#004785] to-[#0066b8] px-6 pb-10 pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white ring-2 ring-white/30">
                {avatarLetter}
              </div>
              <div>
                <p className="text-lg font-bold leading-tight text-white">{displayName}</p>
                <p className="mt-0.5 text-sm text-blue-200">{profile.email || user?.email || ''}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {roles.map((role) => (
                    <span
                      key={role}
                      className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Read-only info block */}
          <div className="mx-4 -mt-4 mb-0 rounded-xl border border-slate-200 bg-slate-50 px-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
            <InfoRow label="Email">
              <span className="text-slate-500 dark:text-[#999999]">{profile.email || user?.email || '—'}</span>
            </InfoRow>
            {profile.username && (
              <InfoRow label=" Tên đăng nhập">
                <span className="text-slate-500 dark:text-[#999999]">{profile.username}</span>
              </InfoRow>
            )}
            <InfoRow label="Vai trò">
              <div className="flex flex-wrap gap-1">
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <Badge key={role} variant="primary" size="sm">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <span className="text-slate-400 dark:text-[#808080]">—</span>
                )}
              </div>
            </InfoRow>
            <InfoRow label="Trạng thái">
              <Badge variant={getStatusBadgeVariant(profile.status)} size="sm">
                {formatAccountStatus(profile.status)}
              </Badge>
            </InfoRow>
          </div>

          {/* Editable fields */}
          <div className="px-6 py-5">
            {profileLoading ? (
              <div className="flex justify-center py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#004785] border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FieldInput
                    label="Họ và tên"
                    value={profile.fullName || ''}
                    onChange={(e) => setProfileField('fullName', e.target.value)}
                    error={profileErrors.fullName}
                    placeholder="Nhập họ và tên"
                  />
                  <FieldInput
                    label="Số điện thoại"
                    value={profile.phoneNumber || ''}
                    onChange={(e) => setProfileField('phoneNumber', e.target.value)}
                    error={profileErrors.phoneNumber}
                    placeholder="0xxxxxxxxx"
                  />
                </div>

                <AlertBanner message={profileMessage} />

                {/* Action row: Đổi mật khẩu (trái) + Lưu thay đổi (phải) */}
                <div className="flex items-center justify-between pt-1">
                  {/* Đã chuyển sang component Button cùng size="md" */}
                  <Button
                    type="button"
                    variant="secondary" // Hoặc đổi thành "primary" nếu bạn muốn nó vẫn màu xanh dương đặc
                    onClick={() => setIsPasswordModalOpen(true)}
                    size="md"
                    className="flex items-center gap-2"
                  >
                    <Icon name="shield" size={16} />
                    <span>Đổi mật khẩu</span>
                  </Button>

                  <Button variant="primary" onClick={saveProfile} loading={profileSaving} size="md">
                    Lưu thay đổi
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal đổi mật khẩu ── */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        hook={hook}
      />
    </>
  );
};

export default AccountSettingsPage;
