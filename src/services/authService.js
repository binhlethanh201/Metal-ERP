/**
 * Auth Service - Xử lý đăng nhập/đăng ký qua API backend
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
  const authUrl = normalizeBaseUrl(process.env.REACT_APP_AUTH_URL);
  if (authUrl) return authUrl;

  const apiUrl = normalizeBaseUrl(process.env.REACT_APP_API_URL);
  if (apiUrl) return apiUrl;

  return 'http://localhost:3000/api';
};

const authRequest = async (endpoint, body) => {
  const url = `${getAuthBaseUrl()}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
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

const normalizeLoginResponse = (response) => {
  const user =
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

  let finalUser = user;

  // If API returned top-level user fields (e.g., PhoneNumber, phoneNumber, userId, role),
  // construct a user object to keep the client expectations consistent.
  if (!finalUser && response && typeof response === 'object') {
    const { accessToken, token: tkn, jwt, Password, PasswordHash, message, ...rest } = response;

    // rest now contains non-token fields like phoneNumber, userId, role, branchId, etc.
    if (Object.keys(rest).length) {
      finalUser = { ...rest };
    }
  }

  // Normalize common field names
  if (finalUser) {
    // phoneNumber -> phone / sdt
    if (finalUser.phoneNumber && !finalUser.phone) finalUser.phone = finalUser.phoneNumber;
    if (finalUser.PhoneNumber && !finalUser.phone) finalUser.phone = finalUser.PhoneNumber;
    // ensure email exists (some client logic expects it)
    if (!finalUser.email) finalUser.email = finalUser.phone || finalUser.username || '';
    // ensure role exists
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
    // Normalize payload to backend expectations. Some backends expect
    // PascalCase keys like { PhoneNumber, Password } (see Swagger screenshot).
    const payload = {};

    if (credentials.sdt || credentials.phone) {
      payload.PhoneNumber = credentials.sdt || credentials.phone;
    }
    if (credentials.password) {
      payload.Password = credentials.password;
    }

    // fallback to original keys if nothing mapped
    const bodyToSend = Object.keys(payload).length ? payload : credentials;

    const response = await authRequest(ENDPOINTS.AUTH.LOGIN, bodyToSend);
    const normalized = normalizeLoginResponse(response);

    if (!normalized.token) {
      throw new Error('API đăng nhập không trả về token hợp lệ');
    }

    return normalized;
  } catch (error) {
    if (error?.status !== 404) {
      throw error;
    }

    const lookup = credentials.sdt || credentials.phone || credentials.email || '';

    const foundUser = MOCK_USERS.find((user) => {
      // allow fallback lookup by email or phone-like value provided by UI
      return (
        ((user.email && user.email === lookup) || (user.phone && user.phone === lookup)) &&
        user.password === credentials.password
      );
    });

    if (!foundUser) {
      throw new Error('Backend chưa có auth API và email/mật khẩu không khớp dữ liệu mẫu');
    }

    const fakeToken = `mock_token_${Date.now()}`;
    const { password, ...userInfo } = foundUser;

    return {
      user: userInfo,
      token: fakeToken,
      raw: { fallback: true },
    };
  }
};

export const registerStartRequest = async (payload) => {
  return authRequest(ENDPOINTS.AUTH.REGISTER_START, payload);
};

export const registerVerifyRequest = async (payload) => {
  return authRequest(ENDPOINTS.AUTH.REGISTER_VERIFY, payload);
};

const authService = {
  loginRequest,
  registerStartRequest,
  registerVerifyRequest,
};

export default authService;
