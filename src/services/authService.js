/**
 * Auth Service - Xử lý đăng nhập/đăng ký qua API backend.
 */

import ENDPOINTS from './endpoints';
import { MOCK_USERS } from '../shared/data/mockUsers';

const firstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== '');

const normalizeBaseUrl = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/\/index\.html?$/i, '')
    .replace(/\/$/, '');
};

const getAuthBaseUrl = () => {
  // Lấy domain gốc từ .env (Ví dụ: http://localhost:5100)
  const envUrl =
    normalizeBaseUrl(process.env.REACT_APP_AUTH_URL) ||
    normalizeBaseUrl(process.env.REACT_APP_API_URL) ||
    'http://localhost:5100';

  // Xóa bỏ /api hoặc /api/Auth ở cuối nếu lỡ nhập vào .env để lấy domain thuần
  const cleanDomain = envUrl.replace(/\/api(\/Auth)?$/, '');

  // Tự động nối /api/Auth cho toàn bộ các request liên quan đến Authentication
  return `${cleanDomain}/api/Auth`;
};

const authRequest = async (endpoint, body) => {
  const url = `${getAuthBaseUrl()}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST', // Đăng nhập, Đăng ký (Start/Verify) đều dùng POST
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  const responseText = await response.text();
  if (!responseText) return null;

  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    return responseText;
  }
};

const stripSensitiveFields = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const {
    token,
    accessToken,
    jwt,
    refreshToken,
    password,
    Password,
    passwordHash,
    PasswordHash,
    ...rest
  } = obj;

  return rest;
};

const normalizeLoginResponse = (response) => {
  const rawUser =
    firstDefined(
      response?.user,
      response?.data?.user,
      response?.result?.user,
      response?.data,
      response?.result
    ) || null;

  const token = firstDefined(
    response?.accessToken,
    response?.token,
    response?.jwt,
    response?.data?.accessToken,
    response?.data?.token,
    response?.data?.jwt,
    response?.result?.accessToken,
    response?.result?.token,
    response?.result?.jwt
  );

  let finalUser = rawUser;

  if (!finalUser && response && typeof response === 'object') {
    const { message, ...rest } = stripSensitiveFields(response);
    if (Object.keys(rest).length) {
      finalUser = { ...rest };
    }
  }

  // Luôn strip token/password ra khỏi user, bất kể user đến từ nhánh nào ở trên
  // (response.user, response.data, response.data.user, ...) — tránh lưu trùng
  // token bên trong localStorage['user'].
  finalUser = stripSensitiveFields(finalUser);

  if (finalUser) {
    if (finalUser.phoneNumber && !finalUser.phone) finalUser.phone = finalUser.phoneNumber;
    if (finalUser.PhoneNumber && !finalUser.phone) finalUser.phone = finalUser.PhoneNumber;
    if (!finalUser.email) finalUser.email = finalUser.phone || finalUser.username || '';
    if (!finalUser.role) finalUser.role = finalUser.roleId || finalUser.role || 'store_owner';
  }

  return {
    user: finalUser,
    token,
    raw: response,
  };
};

export const loginRequest = async (credentials) => {
  try {
    // API mới yêu cầu truyền "email" thay vì "PhoneNumber"
    const payload = {};

    if (credentials.email || credentials.username) {
      payload.email = credentials.email || credentials.username;
    }
    if (credentials.password) {
      payload.password = credentials.password;
    }

    const bodyToSend = Object.keys(payload).length ? payload : credentials;

    const response = await authRequest(ENDPOINTS.AUTH.LOGIN, bodyToSend);
    const normalized = normalizeLoginResponse(response);

    if (!normalized.token) {
      throw new Error('API đăng nhập không trả về token hợp lệ');
    }

    return normalized;
  } catch (error) {
    // Giữ lại cơ chế fallback mock data khi API chưa sẵn sàng (Status 404)
    if (error?.status !== 404) {
      throw error;
    }

    const lookup = credentials.email || credentials.phone || credentials.username || '';
    const foundUser = MOCK_USERS.find((user) => {
      return (
        ((user.email && user.email === lookup) || (user.phone && user.phone === lookup)) &&
        user.password === credentials.password
      );
    });

    if (!foundUser) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
    }

    return {
      user: stripSensitiveFields({ ...foundUser }),
      token: `mock_token_${Date.now()}`,
      raw: { fallback: true },
    };
  }
};

export const registerStartRequest = async (payload) => {
  // Gửi đúng payload { email } theo API Doc
  return authRequest(ENDPOINTS.AUTH.REGISTER_START, payload);
};

export const registerVerifyRequest = async (payload) => {
  // Gửi đúng payload { email, otpCode, password, fullName, branchName }
  return authRequest(ENDPOINTS.AUTH.REGISTER_VERIFY, payload);
};

const authService = {
  loginRequest,
  registerStartRequest,
  registerVerifyRequest,
};

export default authService;
