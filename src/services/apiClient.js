/**
 * API Client tập trung - Điểm cấu hình duy nhất cho tất cả API calls
 * Sửa đổi tại đây sẽ ảnh hưởng đến toàn bộ ứng dụng
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5100';

const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

const getAuthToken = () => {
  try {
    return localStorage.getItem('authToken');
  } catch (error) {
    return null;
  }
};

/**
 * Dịch thông báo lỗi tiếng Anh từ backend sang tiếng Việt
 */
const translateErrorMessage = (msg) => {
  if (!msg || typeof msg !== 'string') return msg;

  const translations = [
    [
      /[Pp]roduct\/?[Bb]ranch[Pp]roduct\s+with\s+(?:ID\/Code|ID|Code)\s+['"]([^'"]+)['"]\s+was\s+not\s+found/i,
      "Không tìm thấy sản phẩm có mã '$1' trong hệ thống.",
    ],
    [
      /[Pp]roduct\s+with\s+(?:ID|Code)\s+['"]([^'"]+)['"]\s+was\s+not\s+found/i,
      "Không tìm thấy sản phẩm có mã '$1'.",
    ],
    [
      /[Ss]upplier\s+with\s+ID\s+['"]([^'"]+)['"]\s+was\s+not\s+found/i,
      "Không tìm thấy nhà cung cấp có mã '$1'.",
    ],
    [/not found/i, 'Không tìm thấy.'],
    [/invalid/i, 'Dữ liệu không hợp lệ.'],
    [/unauthorized/i, 'Không có quyền truy cập.'],
    [/internal server error/i, 'Lỗi máy chủ nội bộ.'],
    [/bad request/i, 'Yêu cầu không hợp lệ.'],
    [/conflict/i, 'Dữ liệu bị trùng lặp.'],
    [/forbidden/i, 'Không có quyền thực hiện thao tác này.'],
    [
      /an item with the same key has already been added/i,
      'Dữ liệu bị trùng lặp, vui lòng tải lại trang.',
    ],
  ];

  for (const [pattern, replacement] of translations) {
    const translated = msg.replace(pattern, replacement);
    if (translated !== msg) return translated;
  }

  return msg;
};

/**
 * Hàm wrapper cho tất cả API requests
 * @param {string} endpoint - Đường dẫn API (không cần base URL)
 * @param {object} options - Fetch options (method, body, headers, baseURL, etc.)
 * @returns {Promise} Response data
 */
export const apiClient = async (endpoint, options = {}) => {
  const baseURL = options.baseURL || API_CONFIG.baseURL;
  let url = `${baseURL}${endpoint}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.keys(options.params).forEach((key) => {
      if (
        options.params[key] !== undefined &&
        options.params[key] !== null &&
        options.params[key] !== ''
      ) {
        searchParams.append(key, options.params[key]);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

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
    config.body = options.body instanceof FormData ? options.body : JSON.stringify(options.body);
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
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
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
      const validationErrors = errorData.errors;
      let detail = '';
      if (validationErrors && typeof validationErrors === 'object') {
        detail = Object.entries(validationErrors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('; ');
      }
      const rawMsg =
        detail ||
        errorData.message ||
        errorData.title ||
        errorData.detail ||
        errorData.error?.message ||
        errorData.Error?.Message ||
        `HTTP ${response.status}`;
      const msg = translateErrorMessage(rawMsg);
      const error = new Error(msg);
      error.status = response.status;
      error.data = errorData;
      console.warn('[DEBUG apiClient] Full error response:', {
        status: response.status,
        body: errorData,
        detail,
        msg,
      });
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
