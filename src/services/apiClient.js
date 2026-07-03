/**
 * API Client tập trung - Điểm cấu hình duy nhất cho tất cả API calls
 * Sửa đổi tại đây sẽ ảnh hưởng đến toàn bộ ứng dụng
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5100/api';

const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

const getAuthToken = () => {
  try {
    return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  } catch (error) {
    return null;
  }
};

/**
 * Hàm wrapper cho tất cả API requests
 * @param {string} endpoint - Đường dẫn API (không cần base URL)
 * @param {object} options - Fetch options (method, body, headers, baseURL, etc.)
 * @returns {Promise} Response data
 */
export const apiClient = async (endpoint, options = {}) => {
  const baseURL = options.baseURL || API_CONFIG.baseURL;
  const url = `${baseURL}${endpoint}`;

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
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);

    // Xử lý lỗi HTTP
    if (!response.ok) {
      // 401 → redirect login
      if (response.status === 401) {
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      // 403 → throw với message rõ
      if (response.status === 403) {
        const error403 = new Error('Không có quyền thực hiện thao tác này');
        error403.status = 403;
        throw error403;
      }
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Handle blob response (e.g., file downloads)
    if (options.responseType === 'blob') {
      const blob = await response.blob();
      return blob;
    }

    // Parse response linh hoạt theo JSON hoặc text
    const responseText = await response.text();
    if (!responseText) {
      return null;
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      data = responseText;
    }

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

// ============= POS-specific helpers =============
// Backend POS chạy ở localhost:5100, khác với inventory (localhost:3000)
const POS_BASE_URL = process.env.REACT_APP_POS_API_URL || 'http://localhost:5100/api';

/**
 * GET request cho POS backend
 */
export const apiPosGet = (endpoint, options = {}) =>
  apiClient(endpoint, { ...options, method: 'GET', baseURL: POS_BASE_URL });

/**
 * POST request cho POS backend
 */
export const apiPosPost = (endpoint, body, options = {}) =>
  apiClient(endpoint, { ...options, method: 'POST', body, baseURL: POS_BASE_URL });

/**
 * PUT request cho POS backend
 */
export const apiPosPut = (endpoint, body, options = {}) =>
  apiClient(endpoint, { ...options, method: 'PUT', body, baseURL: POS_BASE_URL });

/**
 * PATCH request cho POS backend
 */
export const apiPosPatch = (endpoint, body, options = {}) =>
  apiClient(endpoint, { ...options, method: 'PATCH', body, baseURL: POS_BASE_URL });

export default apiClient;
