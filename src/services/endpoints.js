/**
 * Tập trung định nghĩa tất cả API endpoints
 * Dễ dàng thay đổi URL tại một chỗ duy nhất
 */

export const ENDPOINTS = {
  // ============ REPORTS (Báo cáo) ============
  REPORTS: {
    DAILY_END: '/api/reports/daily-end',
    STOCK_MOVEMENT: '/api/reports/stock-movement',
    REVENUE_BY_TIME: '/api/reports/revenue-by-time',
    LOW_STOCK: '/api/reports/low-stock',
    PRODUCT_PROFIT: '/api/reports/product-profit',
    SUPPLIER_DETAIL: '/api/reports/supplier-detail',
  },

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
    STAFF_CHECK_RELATIONS: (id) => `/api/owner/staffs/${id}/check-relations`,

    // Discount Tiers (Chiết khấu theo giá trị đơn hàng)
    ORDER_DISCOUNT_TIERS: '/api/order-discount-tiers',
    ORDER_DISCOUNT_TIER_DETAIL: (id) => `/api/order-discount-tiers/${id}`,
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
    TOGGLE_PRODUCT_STATUS: (id) => `/api/Products/${id}/toggle-status`,
    TOGGLE_PRODUCT_STATUS_BULK: '/api/Products/toggle-status-bulk',

    // ================= Locations =================
    GET_PRODUCT_LOCATIONS: '/api/products/locations',
    CREATE_PRODUCT_LOCATION: '/api/products/locations',
    RENAME_PRODUCT_LOCATION: '/api/products/locations',
    DELETE_PRODUCT_LOCATION: (name) => `/api/products/locations/${encodeURIComponent(name)}`,

    // ================= Attribute Types =================
    GET_ATTRIBUTE_TYPES: '/api/products/attribute-types',
    CREATE_ATTRIBUTE_TYPE: '/api/products/attribute-types',
    UPDATE_ATTRIBUTE_TYPE: (id) => `/api/products/attribute-types/${id}`,
    DELETE_ATTRIBUTE_TYPE: (id) => `/api/products/attribute-types/${id}`,

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

    // ================= KIỂM KÊ KHO =================
    REJECT_INVENTORY_CHECK: (id) => `/api/InventoryCheck/${id}/reject`,
    GET_NOTIFICATIONS: '/api/InventoryCheck/notifications',
    MARK_NOTIFICATION_READ: '/api/InventoryCheck/notifications/read',

    // ================= Stock =================
    GET_STOCK: '/api/Stock',
    GET_STOCK_BY_PRODUCT: (productId) => `/api/Stock/product/${productId}`,
    UPDATE_STOCK: (productId) => `/api/Stock/${productId}`,

    // ================= Stock Import (legacy) =================
    GET_IMPORTS: '/api/StockImport',
    CREATE_IMPORT: '/api/StockImport',
    GET_IMPORT: (id) => `/api/StockImport/${id}`,

    // ================= Alerts =================
    GET_LOW_STOCK_ALERTS: '/api/inventory/low-stock-alerts',

    // ================= Reports =================
    GET_STOCK_REPORT: '/api/inventory/stock-report',
    GET_MOVEMENT_REPORT: '/api/inventory/movement-report',
    GET_IMPORT_SUGGESTIONS: '/api/inventory/import-suggestions',
  },

  // ============ EXPENSE ============
  EXPENSE: {
    GET_LIST: '/api/expense',
    GET_DETAIL: (id) => `/api/expense/${id}`,
    CREATE: '/api/expense',
    CONFIRM: (id) => `/api/expense/${id}/confirm`,
    CANCEL: (id) => `/api/expense/${id}/cancel`,

    GET_CATEGORIES: '/api/expense/categories',
    CREATE_CATEGORY: '/api/expense/categories',
    UPDATE_CATEGORY: (id) => `/api/expense/categories/${id}`,
    DELETE_CATEGORY: (id) => `/api/expense/categories/${id}`,
  },

  // ============ POS (Bán hàng) ============
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
    CANCEL_PAYMENT: (paymentId) => `/pos/payments/${paymentId}/cancel`,

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

  // ============ ADMIN (Quản trị hệ thống) ============
  ADMIN: {
    // Dashboard
    DASHBOARD_STATS: '/api/admin/dashboard/stats',
    DASHBOARD_REVENUE: '/api/admin/dashboard/revenue-chart',
    DASHBOARD_EVENTS: '/api/admin/dashboard/recent-events',
    DASHBOARD_EXPORT: '/api/admin/dashboard/export',

    // User Accounts (Quản lý Người dùng)
    USER_LIST: '/api/admin/users',
    USER_DETAIL: (id) => `/api/admin/users/${id}`,
    USER_CREATE: '/api/admin/users',
    USER_UPDATE: (id) => `/api/admin/users/${id}`,
    USER_ROLES: (id) => `/api/admin/users/${id}/roles`,
    USER_STATUS: (id) => `/api/admin/users/${id}/status`,
    USER_RESET_PASSWORD: (id) => `/api/admin/users/${id}/reset-password`,
    USER_ACTIVITIES: (id) => `/api/admin/users/${id}/activities`,

    // Roles & Permissions (Quản lý Quyền)
    ROLE_LIST: '/api/admin/roles',
    ROLE_PERMISSIONS: '/api/admin/roles/permissions',
    ROLE_MATRIX: '/api/admin/roles/permission-matrix',
    ROLE_UPDATE_PERMISSIONS: (id) => `/api/admin/roles/${id}/permissions`,

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

  // ============ CHATBOT (Trợ lý AI) ============
  CHATBOT: {
    SEND_MESSAGE: '/api/chatbot/message',
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
