/**
 * Tập trung định nghĩa tất cả API endpoints
 * Dễ dàng thay đổi URL tại một chỗ duy nhất
 */

export const ENDPOINTS = {
  // ============ OWNER (Quản lý) ============
  OWNER: {
    // Branches
    BRANCHES: '/api/owner/branches',
    BRANCH_DETAIL: (id) => `/api/owner/branches/${id}`,
    BRANCH_HISTORY: (id) => `/api/owner/branches/${id}/history`,

    // Staffs
    STAFFS: '/api/owner/staffs',
    STAFF_DETAIL: (id) => `/api/owner/staffs/${id}`,
    STAFF_ASSIGN_BRANCH: (id) => `/api/owner/staffs/${id}/assign-branch`,
    STAFF_UNASSIGN_BRANCH: (id, branchId) => `/api/owner/staffs/${id}/unassign-branch/${branchId}`,
    STAFF_TOGGLE_STATUS: (id) => `/api/owner/staffs/${id}/toggle-status`,
  },

  // ============ INVENTORY (Tổng kho) ============
  INVENTORY: {
    // Dashboard
    DASHBOARD: '/inventory/dashboard',

    // Products
    GET_PRODUCTS: '/api/products',
    GET_PRODUCT: (id) => `/api/products/${id}`,
    CREATE_PRODUCT: '/api/products',
    UPDATE_PRODUCT: (id) => `/api/products/${id}`,
    DELETE_PRODUCT: (id) => `/api/products/${id}`,
    TOGGLE_PRODUCT_STATUS: (id) => `/api/products/${id}/toggle-status`,

    // Stock
    GET_STOCK: '/inventory/stock',
    GET_STOCK_BY_PRODUCT: (productId) => `/inventory/stock/${productId}`,
    UPDATE_STOCK: (productId) => `/inventory/stock/${productId}`,

    // Stock Import/Export
    GET_IMPORTS: '/inventory/imports',
    CREATE_IMPORT: '/inventory/imports',
    GET_IMPORT: (id) => `/inventory/imports/${id}`,

    GET_EXPORTS: '/inventory/exports',
    CREATE_EXPORT: '/inventory/exports',
    GET_EXPORT: (id) => `/inventory/exports/${id}`,

    // Alerts & Warnings
    GET_LOW_STOCK_ALERTS: '/inventory/alerts/low-stock',

    // Reports
    GET_STOCK_REPORT: '/inventory/reports/stock',
    GET_MOVEMENT_REPORT: '/inventory/reports/movement',
    GET_IMPORT_SUGGESTIONS: '/inventory/suggestions/imports',
  },

  // ============ POS (Bán hàng) ============
  // Backend: http://localhost:5100/api/pos/*
  // Auth: Bearer token. Test: sale.bac01@mep.vn / MEP@2026
  POS: {
    // --- Products ---
    GET_POS_PRODUCTS: '/pos/products',
    GET_PRODUCT_PRICE: (productId) => `/pos/products/${productId}/price`,
    GET_PRODUCT_STOCK: (productId) => `/pos/products/${productId}/stock`,

    // --- Invoices (Hóa đơn) - Invoice-based flow ---
    // Flow: POST /invoices → items → hold|resume → payments → POST /finalize
    GET_ORDERS: '/pos/invoices', // GET với filter status=Completed → lịch sử đơn
    CREATE_INVOICE: '/pos/invoices',
    GET_INVOICE: (invoiceId) => `/pos/invoices/${invoiceId}`,
    GET_INVOICES_ON_HOLD: '/pos/invoices/on-hold',
    ADD_INVOICE_ITEM: (invoiceId) => `/pos/invoices/${invoiceId}/items`,
    SCAN_BARCODE: (invoiceId) => `/pos/invoices/${invoiceId}/items/scan`,
    HOLD_INVOICE: (invoiceId) => `/pos/invoices/${invoiceId}/hold`,
    RESUME_INVOICE: (invoiceId) => `/pos/invoices/${invoiceId}/resume`,
    FINALIZE_INVOICE: (invoiceId) => `/pos/invoices/${invoiceId}/finalize`,
    CANCEL_INVOICE: (invoiceId) => `/pos/invoices/${invoiceId}/cancel`,

    // --- Payments (nested under Invoice) ---
    CREATE_PAYMENT: (invoiceId) => `/pos/invoices/${invoiceId}/payments`,
    GET_PAYMENT_QR: (paymentId) => `/pos/payments/${paymentId}/qr`,
    CONFIRM_TRANSFER: (paymentId) => `/pos/payments/${paymentId}/confirm-transfer`,

    // --- Shift Management ---
    START_SHIFT: '/pos/shifts/start',
    GET_SHIFTS: '/pos/shifts',
    GET_SHIFT_SUMMARY: (shiftId) => `/pos/shifts/${shiftId}/summary`,
    END_SHIFT: (shiftId) => `/pos/shifts/${shiftId}/end`,

    // --- Customers ---
    GET_CUSTOMERS: '/pos/customers',
    GET_CUSTOMER: (customerId) => `/pos/customers/${customerId}`,
    CREATE_CUSTOMER: '/pos/customers',
    UPDATE_CUSTOMER: (customerId) => `/pos/customers/${customerId}`,
    GET_CUSTOMER_ORDERS: (customerId) => `/pos/customers/${customerId}/orders`,

    // --- Returns (Đổi trả) ---
    GET_RETURNS: '/pos/returns',
    GET_RETURN: (returnId) => `/pos/returns/${returnId}`,
    CREATE_RETURN: '/pos/returns',
    ADD_RETURN_ITEM: (returnId) => `/pos/returns/${returnId}/items`,
    FINALIZE_RETURN: (returnId) => `/pos/returns/${returnId}/finalize`,
    CANCEL_RETURN: (returnId) => `/pos/returns/${returnId}/cancel`,

    // --- Settings ---
    GET_SETTINGS: '/pos/settings',
    UPDATE_SETTINGS: '/pos/settings',
  },

  // ============ FORUM (Diễn đàn) ============
  FORUM: {
    // Categories
    GET_CATEGORIES: '/forum/categories',
    GET_CATEGORY: (id) => `/forum/categories/${id}`,

    // Posts
    GET_POSTS: '/forum/posts',
    GET_POST: (id) => `/forum/posts/${id}`,
    CREATE_POST: '/forum/posts',
    UPDATE_POST: (id) => `/forum/posts/${id}`,
    DELETE_POST: (id) => `/forum/posts/${id}`,

    // Comments
    GET_COMMENTS: (postId) => `/forum/posts/${postId}/comments`,
    CREATE_COMMENT: (postId) => `/forum/posts/${postId}/comments`,
    UPDATE_COMMENT: (commentId) => `/forum/comments/${commentId}`,
    DELETE_COMMENT: (commentId) => `/forum/comments/${commentId}`,

    // Votes/Likes
    VOTE_POST: (postId) => `/forum/posts/${postId}/votes`,
    UNVOTE_POST: (postId) => `/forum/posts/${postId}/votes`,

    // Trends & Insights
    GET_TRENDS: '/forum/trends',
    GET_PRODUCT_SUGGESTIONS: '/forum/suggestions/products',
    GET_TRENDING_CATEGORIES: '/forum/categories/trending',
  },

  // ============ AUTH (Xác thực) ============
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    REGISTER_START: '/register/start',
    REGISTER_VERIFY: '/register/verify',
    REFRESH_TOKEN: '/refresh',
    GET_PROFILE: '/profile',
    UPDATE_PROFILE: '/profile',
  },

  // ============ GOODS ISSUE (Xuất Kho) ============
  GOODS_ISSUE: {
    // Danh sách & CRUD phiếu xuất
    GET_LIST: '/goods-issue',
    GET_DETAIL: (id) => `/goods-issue/${id}`,
    CREATE: '/goods-issue',
    UPDATE: (id) => `/goods-issue/${id}`,
    DELETE: (id) => `/goods-issue/${id}`,

    // Tra cứu sản phẩm
    SEARCH_PRODUCTS: '/goods-issue/products/search',

    // Khách hàng
    GET_CUSTOMERS: '/goods-issue/customers',
    CREATE_CUSTOMER: '/goods-issue/customers',

    // Kho
    GET_WAREHOUSES: '/goods-issue/warehouses',

    // File đính kèm
    UPLOAD_ATTACHMENT: (id) => `/goods-issue/${id}/attachments`,
  },

  // ============ COMMON (Chung) ============
  COMMON: {
    HEALTH: '/health',
    STATS: '/stats',
  },
};

export default ENDPOINTS;
