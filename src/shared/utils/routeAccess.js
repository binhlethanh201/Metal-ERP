/**
 * Phân quyền truy cập theo permission (động, do Owner/Admin cấu hình).
 * Mỗi module/route yêu cầu người dùng có ÍT NHẤT 1 trong các permission liệt kê.
 */
import { hasAnyPermission } from './permissions';

// --- Quyền cấp MODULE ---
export const POS_PERMISSIONS = [
  'SALE_CREATE',
  'SALE_VIEW',
  'SALE_UPDATE',
  'SALE_DELETE',
  'CUSTOMER_VIEW',
  'CUSTOMER_CREATE',
  'CUSTOMER_UPDATE',
  'CUSTOMER_DELETE',
  'SHIFT_VIEW',
  'SHIFT_CREATE',
  'SHIFT_UPDATE',
  'SHIFT_DELETE',
  'LOYALTY_VIEW',
  'PROMOTION_VIEW',
  'PAYMENT_VIEW',
  'PAYMENT_CREATE',
];

export const INVENTORY_PERMISSIONS = [
  'STOCK_VIEW',
  'PRODUCT_VIEW',
  'PRODUCT_CREATE',
  'PRODUCT_UPDATE',
  'PRODUCT_DELETE',
  'STOCK_INWARD_CREATE',
  'STOCK_INWARD_UPDATE',
  'STOCK_INWARD_DELETE',
  'STOCK_OUTWARD_CREATE',
  'STOCK_OUTWARD_UPDATE',
  'STOCK_OUTWARD_DELETE',
  'STOCK_OUTWARD_CONFIRM',
  'STOCK_CHECK_CREATE',
  'STOCK_CHECK_VIEW',
  'STOCK_CHECK_APPROVE',
  'STOCK_CHECK_CANCEL',
  'SUPPLIER_VIEW',
  'SUPPLIER_CREATE',
  'SUPPLIER_UPDATE',
  'SUPPLIER_DELETE',
  'SUPPLIER_PAYMENT_VIEW',
  'SUPPLIER_PAYMENT_CREATE',
  'SUPPLIER_PAYMENT_UPDATE',
  'SUPPLIER_PAYMENT_DELETE',
  'REPORT_VIEW',
];

export const ADMIN_PERMISSIONS = ['SYSTEM_MANAGE'];
export const OWNER_PERMISSIONS = ['OWNER_MANAGE'];

// --- Quyền tối thiểu cho từng route con ---
export const ROUTE_PERMISSIONS = {
  // POS
  pos: ['SALE_CREATE', 'SALE_VIEW', 'SALE_UPDATE', 'SALE_DELETE'],
  posOrders: ['SALE_VIEW'],
  posShift: ['SHIFT_VIEW', 'SHIFT_CREATE', 'SHIFT_UPDATE', 'SHIFT_DELETE'],
  posCustomers: ['CUSTOMER_VIEW', 'CUSTOMER_CREATE', 'CUSTOMER_UPDATE', 'CUSTOMER_DELETE'],
  posReturns: ['SALE_UPDATE', 'SALE_DELETE'],

  // Inventory
  inventoryDashboard: ['STOCK_VIEW'],
  inventoryOwnerDashboard: OWNER_PERMISSIONS,
  inventoryProducts: ['PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE'],
  inventoryImport: ['STOCK_INWARD_CREATE', 'STOCK_INWARD_UPDATE', 'STOCK_INWARD_DELETE'],
  inventoryExport: [
    'STOCK_OUTWARD_CREATE',
    'STOCK_OUTWARD_UPDATE',
    'STOCK_OUTWARD_DELETE',
    'STOCK_OUTWARD_CONFIRM',
  ],
  inventoryReports: ['REPORT_VIEW'],
  inventoryTransactions: ['STOCK_VIEW'],
  inventoryCheck: ['STOCK_CHECK_VIEW', 'STOCK_CHECK_CREATE', 'STOCK_CHECK_APPROVE', 'STOCK_CHECK_CANCEL'],
  goodsIssue: ['STOCK_OUTWARD_CREATE', 'STOCK_OUTWARD_CONFIRM'],
  goodsIssueList: ['STOCK_OUTWARD_CREATE', 'STOCK_OUTWARD_UPDATE', 'STOCK_OUTWARD_CONFIRM'],
  orderList: ['SALE_VIEW'],
  suppliers: ['SUPPLIER_VIEW', 'SUPPLIER_CREATE', 'SUPPLIER_UPDATE', 'SUPPLIER_DELETE'],
  supplierDebt: ['SUPPLIER_PAYMENT_VIEW'],
  supplierPayments: [
    'SUPPLIER_PAYMENT_VIEW',
    'SUPPLIER_PAYMENT_CREATE',
    'SUPPLIER_PAYMENT_UPDATE',
    'SUPPLIER_PAYMENT_DELETE',
  ],
  expenses: ['PAYMENT_VIEW', 'PAYMENT_CREATE', 'SUPPLIER_PAYMENT_VIEW'],
  expenseCategories: ['PAYMENT_VIEW', 'PAYMENT_CREATE'],
  ownerReports: ['REPORT_VIEW', 'OWNER_MANAGE'],
  shiftHistory: ['SHIFT_VIEW'],
  returnHistory: ['SALE_VIEW'],
  storeSettings: OWNER_PERMISSIONS,
  printTemplates: ['PRINT_VIEW'],
  staffManagement: ['STAFF_VIEW', 'STAFF_CREATE', 'STAFF_UPDATE', 'STAFF_DELETE', 'STAFF_ASSIGN_BRANCH'],
  auditLogs: ['SYSTEM_MANAGE', 'OWNER_MANAGE'],
  outwardExcel: ['STOCK_OUTWARD_CREATE', 'STOCK_OUTWARD_UPDATE', 'STOCK_OUTWARD_DELETE'],

  // Admin
  admin: ADMIN_PERMISSIONS,
};

export const canAccessRoute = (user, routeKey) => {
  const permissions = ROUTE_PERMISSIONS[routeKey];
  if (!permissions) return true;
  return hasAnyPermission(user, permissions);
};

export const canAccess = (user, permissions) => hasAnyPermission(user, permissions);