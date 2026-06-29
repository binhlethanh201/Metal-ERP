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
  POS: {
    // Products
    GET_POS_PRODUCTS: '/api/pos/products',
    GET_PRODUCT_PRICE: (productId) => `/api/pos/products/${productId}/price`,
    GET_PRODUCT_STOCK: (productId) => `/api/pos/products/${productId}/stock`,
    // Tìm sản phẩm: dùng GET_POS_PRODUCTS với query param (không có endpoint riêng)
    GET_PRODUCT_BY_BARCODE: (barcode) => `/api/pos/products/barcode/${barcode}`,

    // Invoices (thay thế Cart/Orders cũ)
    CREATE_INVOICE: '/api/pos/invoices',
    GET_INVOICE: (invoiceId) => `/api/pos/invoices/${invoiceId}`,
    GET_INVOICE_HISTORY: '/api/pos/invoices',
    GET_INVOICES_ON_HOLD: '/api/pos/invoices/on-hold',

    // Invoice Items
    ADD_ITEM: (invoiceId) => `/api/pos/invoices/${invoiceId}/items`,
    SCAN_ITEM: (invoiceId) => `/api/pos/invoices/${invoiceId}/items/scan`,
    SEARCH_ITEM: (invoiceId) => `/api/pos/invoices/${invoiceId}/items/search`,
    GET_ITEMS: (invoiceId) => `/api/pos/invoices/${invoiceId}/items`,

    // Invoice Actions
    FINALIZE_INVOICE: (invoiceId) => `/api/pos/invoices/${invoiceId}/finalize`,
    CANCEL_INVOICE: (invoiceId) => `/api/pos/invoices/${invoiceId}/cancel`,
    HOLD_INVOICE: (invoiceId) => `/api/pos/invoices/${invoiceId}/hold`,
    RESUME_INVOICE: (invoiceId) => `/api/pos/invoices/${invoiceId}/resume`,

    // Payments
    CREATE_PAYMENT: (invoiceId) => `/api/pos/invoices/${invoiceId}/payments`,
    GET_PAYMENT_QR: (paymentId) => `/api/pos/payments/${paymentId}/qr`,
    CONFIRM_TRANSFER: (paymentId) => `/api/pos/payments/${paymentId}/confirm-transfer`,
    RECORD_DEBT: '/api/pos/payments/debt',

    // Promotions
    APPLY_PROMO: (invoiceId) => `/api/pos/invoices/${invoiceId}/promo`,
    REMOVE_PROMO: (invoiceId) => `/api/pos/invoices/${invoiceId}/promo`,

    // Printing
    PRINT_INVOICE: (invoiceId) => `/api/pos/invoices/${invoiceId}/print`,
    DOWNLOAD_PDF: (invoiceId) => `/api/pos/invoices/${invoiceId}/print.pdf`,

    // Shift Management
    START_SHIFT: '/api/pos/shifts/start',
    END_SHIFT: (shiftId) => `/api/pos/shifts/${shiftId}/end`,
    GET_SHIFT_SUMMARY: (shiftId) => `/api/pos/shifts/${shiftId}/summary`,
    LIST_SHIFTS: '/api/pos/shifts',

    // Customers
    GET_CUSTOMERS: '/api/pos/customers',
    GET_CUSTOMER: (id) => `/api/pos/customers/${id}`,
    CREATE_CUSTOMER: '/api/pos/customers',
    UPDATE_CUSTOMER: (id) => `/api/pos/customers/${id}`,
    GET_CUSTOMER_ORDERS: (id) => `/api/pos/customers/${id}/orders`,
    GET_CUSTOMER_POINTS: (id) => `/api/pos/customers/${id}/points`,

    // Returns (Đổi trả hàng - UC46-50)
    CREATE_RETURN: '/api/pos/returns',
    GET_RETURN: (id) => `/api/pos/returns/${id}`,
    LIST_RETURNS: '/api/pos/returns',
    ADD_RETURN_ITEM: (id) => `/api/pos/returns/${id}/items`,
    FINALIZE_RETURN: (id) => `/api/pos/returns/${id}/finalize`,
    CANCEL_RETURN: (id) => `/api/pos/returns/${id}/cancel`,
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

  // ============ ADMIN (Quản trị hệ thống) ============
  ADMIN: {
    // Dashboard
    DASHBOARD_STATS: '/api/admin/dashboard/stats',
    DASHBOARD_REVENUE: '/api/admin/dashboard/revenue-chart',
    DASHBOARD_EVENTS: '/api/admin/dashboard/recent-events',
    DASHBOARD_EXPORT: '/api/admin/dashboard/export',

    // Staff Accounts
    STAFF_LIST: '/api/admin/staff',
    STAFF_DETAIL: (id) => `/api/admin/staff/${id}`,
    STAFF_CREATE: '/api/admin/staff',
    STAFF_UPDATE: (id) => `/api/admin/staff/${id}`,
    STAFF_STATUS: (id) => `/api/admin/staff/${id}/status`,
    STAFF_BAN: (id) => `/api/admin/staff/${id}/ban`,

    // Community Users
    COMMUNITY_LIST: '/api/admin/community-users',
    COMMUNITY_DETAIL: (id) => `/api/admin/community-users/${id}`,
    COMMUNITY_CREATE: '/api/admin/community-users',
    COMMUNITY_UPDATE: (id) => `/api/admin/community-users/${id}`,
    COMMUNITY_STATUS: (id) => `/api/admin/community-users/${id}/status`,
    COMMUNITY_BAN: (id) => `/api/admin/community-users/${id}/ban`,

    // Store Approvals
    APPROVAL_LIST: '/api/admin/store-approvals',
    APPROVAL_DETAIL: (id) => `/api/admin/store-approvals/${id}`,
    APPROVAL_APPROVE: (id) => `/api/admin/store-approvals/${id}/approve`,
    APPROVAL_REJECT: (id) => `/api/admin/store-approvals/${id}/reject`,

    // System Notifications
    NOTIF_LIST: '/api/admin/notifications',
    NOTIF_CREATE: '/api/admin/notifications',
    NOTIF_UPDATE: (id) => `/api/admin/notifications/${id}`,
    NOTIF_SEND: (id) => `/api/admin/notifications/${id}/send`,
    NOTIF_CANCEL: (id) => `/api/admin/notifications/${id}/cancel`,
    NOTIF_DELETE: (id) => `/api/admin/notifications/${id}`,

    // System Logs
    LOG_LIST: '/api/admin/system-logs',
    LOG_DETAIL: (id) => `/api/admin/system-logs/${id}`,
    LOG_EXPORT: '/api/admin/system-logs/export',

    // Community Categories
    CATEGORY_LIST: '/api/admin/community-categories',
    CATEGORY_CREATE: '/api/admin/community-categories',
    CATEGORY_UPDATE: (id) => `/api/admin/community-categories/${id}`,
    CATEGORY_REORDER: (id) => `/api/admin/community-categories/${id}/reorder`,
    CATEGORY_DELETE: (id) => `/api/admin/community-categories/${id}`,

    // Posts Moderation
    POST_LIST: '/api/admin/posts',
    POST_LOCK: (id) => `/api/admin/posts/${id}/lock`,
    POST_UNLOCK: (id) => `/api/admin/posts/${id}/unlock`,
    POST_PIN: (id) => `/api/admin/posts/${id}/pin`,
    POST_UNPIN: (id) => `/api/admin/posts/${id}/unpin`,
    POST_HIDE: (id) => `/api/admin/posts/${id}/hide`,

    // Violation Reports
    REPORT_LIST: '/api/admin/violation-reports',
    REPORT_DETAIL: (id) => `/api/admin/violation-reports/${id}`,
    REPORT_RESOLVE: (id) => `/api/admin/violation-reports/${id}/resolve`,
  },

  // ============ COMMON (Chung) ============
  COMMON: {
    HEALTH: '/health',
    STATS: '/stats',
  },
};

export default ENDPOINTS;
