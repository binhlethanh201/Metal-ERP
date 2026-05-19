/**
 * API Client tập trung - Điểm cấu hình duy nhất cho tất cả API calls
 * Sửa đổi tại đây sẽ ảnh hưởng đến toàn bộ ứng dụng
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Hàm wrapper cho tất cả API requests
 * @param {string} endpoint - Đường dẫn API (không cần base URL)
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise} Response data
 */
export const apiClient = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.baseURL}${endpoint}`;

  const config = {
    method: options.method || 'GET',
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
    timeout: API_CONFIG.timeout,
  };

  // Thêm body nếu là POST/PUT/PATCH
  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  // Thêm Authorization header nếu có token
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);

    // Xử lý lỗi HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Parse response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error [${config.method} ${endpoint}]:`, error);
    throw error;
  }
};

/**
 * GET request
 */
export const apiGet = (endpoint, options = {}) =>
  apiClient(endpoint, { ...options, method: 'GET' });

/**
 * POST request
 */
export const apiPost = (endpoint, body, options = {}) =>
  apiClient(endpoint, { ...options, method: 'POST', body });

/**
 * PUT request
 */
export const apiPut = (endpoint, body, options = {}) =>
  apiClient(endpoint, { ...options, method: 'PUT', body });

/**
 * PATCH request
 */
export const apiPatch = (endpoint, body, options = {}) =>
  apiClient(endpoint, { ...options, method: 'PATCH', body });

/**
 * DELETE request
 */
export const apiDelete = (endpoint, options = {}) =>
  apiClient(endpoint, { ...options, method: 'DELETE' });

export default apiClient;
