/**
 * Tập trung định nghĩa tất cả API endpoints
 * Dễ dàng thay đổi URL tại một chỗ duy nhất
 */

export const ENDPOINTS = {
  // ============ INVENTORY (Tổng kho) ============
  INVENTORY: {
    // Dashboard
    DASHBOARD: '/inventory/dashboard',

    // Products
    GET_PRODUCTS: '/inventory/products',
    GET_PRODUCT: (id) => `/inventory/products/${id}`,
    CREATE_PRODUCT: '/inventory/products',
    UPDATE_PRODUCT: (id) => `/inventory/products/${id}`,
    DELETE_PRODUCT: (id) => `/inventory/products/${id}`,

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
    GET_POS_PRODUCTS: '/pos/products',
    SEARCH_PRODUCTS: '/pos/products/search',
    GET_PRODUCT_BY_BARCODE: (barcode) => `/pos/products/barcode/${barcode}`,

    // Cart
    GET_CART: '/pos/cart',
    ADD_TO_CART: '/pos/cart/items',
    UPDATE_CART_ITEM: (itemId) => `/pos/cart/items/${itemId}`,
    REMOVE_FROM_CART: (itemId) => `/pos/cart/items/${itemId}`,
    CLEAR_CART: '/pos/cart/clear',

    // Checkout & Orders
    CREATE_ORDER: '/pos/orders',
    GET_ORDER: (id) => `/pos/orders/${id}`,
    GET_ORDER_HISTORY: '/pos/orders/history',
    GET_RECENT_ORDERS: '/pos/orders/recent',

    // Payment
    PROCESS_PAYMENT: '/pos/payments',
    GET_PAYMENT_METHODS: '/pos/payments/methods',

    // Receipt
    GENERATE_RECEIPT: (orderId) => `/pos/receipts/${orderId}`,
    PRINT_RECEIPT: (orderId) => `/pos/receipts/${orderId}/print`,

    // Shift Management
    START_SHIFT: '/pos/shifts/start',
    END_SHIFT: '/pos/shifts/end',
    GET_SHIFT_SUMMARY: (shiftId) => `/pos/shifts/${shiftId}/summary`,
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
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    GET_PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile',
  },

  // ============ COMMON (Chung) ============
  COMMON: {
    HEALTH: '/health',
    STATS: '/stats',
  },
};

export default ENDPOINTS;
