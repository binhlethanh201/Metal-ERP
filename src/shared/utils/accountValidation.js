/**
 * Validate thông tin cá nhân (profile)
 */
export const validateAccountProfile = ({ fullName, phoneNumber }) => {
  const errors = {};

  // fullName: required, 1-100 ký tự
  if (!fullName || fullName.trim().length === 0) {
    errors.fullName = 'Họ tên không được để trống.';
  } else if (fullName.trim().length > 100) {
    errors.fullName = 'Họ tên không được vượt quá 100 ký tự.';
  }

  // phoneNumber: optional, nhưng nếu nhập thì phải đúng format VN (10 số, bắt đầu 0[35789])
  if (phoneNumber && phoneNumber.trim().length > 0) {
    const phoneRegex = /^0[35789]\d{8}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam 10 chữ số.';
    }
  }

  return errors;
};

/**
 * Validate form đổi mật khẩu
 */
export const validatePasswordChange = ({ currentPassword, newPassword, confirmPassword }) => {
  const errors = {};

  if (!currentPassword || currentPassword.trim().length === 0) {
    errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
  }

  if (!newPassword || newPassword.trim().length === 0) {
    errors.newPassword = 'Vui lòng nhập mật khẩu mới.';
  } else if (newPassword.length < 6) {
    errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
  }

  if (!confirmPassword || confirmPassword.trim().length === 0) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
  } else if (newPassword && confirmPassword !== newPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
  }

  return errors;
};

/**
 * Helper: format trạng thái tài khoản sang tiếng Việt
 */
export const formatAccountStatus = (status) => {
  const map = {
    ACTIVE: 'Hoạt động',
    INACTIVE: 'Không hoạt động',
    SUSPENDED: 'Tạm khóa',
    PENDING: 'Chờ duyệt',
  };
  return map[status] || status || 'Không xác định';
};

/**
 * Helper: lấy Badge variant tương ứng với status
 */
export const getStatusBadgeVariant = (status) => {
  const map = {
    ACTIVE: 'success',
    INACTIVE: 'secondary',
    SUSPENDED: 'danger',
    PENDING: 'warning',
  };
  return map[status] || 'secondary';
};
