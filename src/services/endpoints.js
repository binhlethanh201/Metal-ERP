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
    STAFF_AVAILABLE_PERMISSIONS: '/api/owner/staffs/available-permissions',
  },

  // ============ INVENTORY (Tổng kho) ============
  INVENTORY: {
    // Dashboard
    DASHBOARD: '/inventory/dashboard',

    // ================= Products =================
    GET_PRODUCTS: '/api/Products',
    CREATE_PRODUCT: '/api/Products',
    GET_PRODUCT: (id) => `/api/Products/${id}`,
    UPDATE_PRODUCT: (id) => `/api/Products/${id}`,
    DELETE_PRODUCT: (id) => `/api/Products/${id}`,

    SEARCH_PRODUCTS: '/api/Products/search',
    SUGGEST_NEW_PRODUCT: '/api/Products/suggest-new-product',

    TOGGLE_PRODUCT_STATUS: (id) => `/api/Products/${id}/toggle-status`,
    TOGGLE_PRODUCT_STATUS_BULK: '/api/Products/toggle-status-bulk',

    // ================= Suppliers =================
    GET_SUPPLIERS: '/api/suppliers',
    CREATE_SUPPLIER: '/api/suppliers',
    GET_SUPPLIER: (id) => `/api/suppliers/${id}`,
    UPDATE_SUPPLIER: (id) => `/api/suppliers/${id}`,
    DELETE_SUPPLIER: (id) => `/api/suppliers/${id}`,

    // ================= Supplier Debt =================
    GET_SUPPLIER_DEBTS: '/api/supplierdebt',
    GET_SUPPLIER_DEBT: (supplierId) => `/api/supplierdebt/${supplierId}`,
    EXPORT_SUPPLIER_DEBT: '/api/supplierdebt/export',

    // ================= Supplier Payments =================
    GET_SUPPLIER_PAYMENTS: '/api/supplierpayments',
    CREATE_SUPPLIER_PAYMENT: '/api/supplierpayments',
    UPDATE_SUPPLIER_PAYMENT: (id) => `/api/supplierpayments/${id}`,
    DELETE_SUPPLIER_PAYMENT: (id) => `/api/supplierpayments/${id}`,

    // ================= Inward Inventory =================
    GET_INWARD_INVENTORIES: '/api/InwardInventory',
    CREATE_INWARD_INVENTORY: '/api/InwardInventory',
    GET_INWARD_INVENTORY: (id) => `/api/InwardInventory/${id}`,
    UPDATE_INWARD_INVENTORY: (id) => `/api/InwardInventory/${id}`,
    DELETE_INWARD_INVENTORY: (id) => `/api/InwardInventory/${id}`,

    // ================= Outward Inventory =================
    GET_OUTWARD_INVENTORIES: '/api/OutwardInventory',
    CREATE_OUTWARD_INVENTORY: '/api/OutwardInventory',
    GET_OUTWARD_INVENTORY: (id) => `/api/OutwardInventory/${id}`,
    UPDATE_OUTWARD_INVENTORY: (id) => `/api/OutwardInventory/${id}`,
    DELETE_OUTWARD_INVENTORY: (id) => `/api/OutwardInventory/${id}`,

    // ================= Inventory Check =================
    GET_INVENTORY_CHECKS: '/api/InventoryCheck',
    CREATE_INVENTORY_CHECK: '/api/InventoryCheck',
    GET_INVENTORY_CHECK: (id) => `/api/InventoryCheck/${id}`,
    UPDATE_INVENTORY_CHECK: (id) => `/api/InventoryCheck/${id}`,
    DELETE_INVENTORY_CHECK: (id) => `/api/InventoryCheck/${id}`,
    FILL_INVENTORY_CHECK: (id) => `/api/InventoryCheck/${id}/fill`,
    APPROVE_INVENTORY_CHECK: (id) => `/api/InventoryCheck/${id}/approve`,
    CANCEL_INVENTORY_CHECK: (id) => `/api/InventoryCheck/${id}/cancel`,
    REASONS_INVENTORY_CHECK: (id) => `/api/InventoryCheck/${id}/reasons`,

    // ================= Reports =================
    INVENTORY_SUMMARY_REPORT: '/api/inventory/summary-report',
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

    // Customers
    GET_CUSTOMERS: '/pos/customers',
    GET_CUSTOMER: (id) => `/pos/customers/${id}`,
    CREATE_CUSTOMER: '/pos/customers',
    UPDATE_CUSTOMER: (id) => `/pos/customers/${id}`,
    GET_CUSTOMER_ORDERS: (id) => `/pos/customers/${id}/orders`,
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
