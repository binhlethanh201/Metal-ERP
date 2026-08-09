import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './shared/hooks/useAuth';
import { hasAnyPermission } from './shared/utils/permissions';
import {
  POS_PERMISSIONS,
  INVENTORY_PERMISSIONS,
  ADMIN_PERMISSIONS,
  OWNER_PERMISSIONS,
  ROUTE_PERMISSIONS,
} from './shared/utils/routeAccess';
import { ThemeProvider } from './shared/contexts/ThemeContext';

// Layouts
import PrivateRoute from './shared/components/layout/PrivateRoute';

//Timeout
import IdleTimeout from './shared/components/auth/IdleTimeout';

// Static Pages
import LandingPage from './pages/LandingPage';
import ErrorToast from './shared/components/ErrorToast';

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));


// Account settings
const AccountSettingsPage = lazy(() => import('./pages/AccountSettings/AccountSettingsPage'));
const AccountSettingsLayout = lazy(() => import('./pages/AccountSettings/AccountSettingsLayout'));

// Inventory Module
const InventoryLayout = lazy(() => import('./modules/inventory/layouts/InventoryLayout'));
const InventoryDashboard = lazy(() => import('./modules/inventory/pages/InventoryDashboard'));
const InventoryProduct = lazy(() => import('./modules/inventory/pages/InventoryProduct'));
const StockImport = lazy(() => import('./modules/inventory/pages/StockImport'));
const StockExport = lazy(() => import('./modules/inventory/pages/StockExport'));
const InventoryTransactionManagement = lazy(
  () => import('./modules/inventory/pages/InventoryTransactionManagement')
);
const InventoryCheckList = lazy(() => import('./modules/inventory/pages/InventoryCheckList'));
const GoodsIssueList = lazy(() => import('./modules/inventory/pages/GoodsIssueList'));
const GoodsIssueCreate = lazy(() => import('./modules/inventory/pages/GoodsIssueCreate'));
const OrderList = lazy(() => import('./modules/inventory/pages/OrderList'));
const SupplierManagement = lazy(() => import('./modules/inventory/pages/SupplierManagement'));
const SupplierDebtManagement = lazy(
  () => import('./modules/inventory/pages/SupplierDebtManagement')
);
const SupplierPaymentManagement = lazy(
  () => import('./modules/inventory/pages/SupplierPaymentManagement')
);
const ExpenseManagement = lazy(() => import('./modules/inventory/pages/ExpenseManagement'));
const ExpenseCategoryManagement = lazy(
  () => import('./modules/inventory/pages/ExpenseCategoryManagement')
);

// POS Module
const PosLayout = lazy(() => import('./modules/pos/layouts/PosLayout'));
const PosScreen = lazy(() => import('./modules/pos/pages/POSScreen'));
const CheckoutPage = lazy(() => import('./modules/pos/pages/CheckoutPage'));
const OrderHistory = lazy(() => import('./modules/pos/pages/OrderHistory'));
const ShiftManagement = lazy(() => import('./modules/pos/pages/ShiftManagement'));
const CustomerManagement = lazy(() => import('./modules/pos/pages/CustomerManagement'));
const ReturnOrderPage = lazy(() => import('./modules/pos/pages/ReturnOrderPage'));

// Admin Module
const AdminLayout = lazy(() => import('./modules/admin/layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./modules/admin/pages/AdminDashboard'));
const AdminUserManagement = lazy(() => import('./modules/admin/pages/AdminUserManagement'));
const AdminUserDetail = lazy(() => import('./modules/admin/pages/AdminUserDetail'));
const AdminRoleManagement = lazy(() => import('./modules/admin/pages/AdminRoleManagement'));
const StoreApprovals = lazy(() => import('./modules/admin/pages/StoreApprovals'));
const SystemNotifications = lazy(() => import('./modules/admin/pages/SystemNotifications'));
const SystemLog = lazy(() => import('./modules/admin/pages/SystemLog'));
const AdminBranchManagement = lazy(() => import('./modules/admin/pages/AdminBranchManagement'));

// Owner Module
const OwnerAuditLog = lazy(() => import('./modules/owner/pages/OwnerAuditLog'));
const OwnerDashboard = lazy(() => import('./modules/owner/pages/Dashboard'));
const BranchManagement = lazy(() => import('./modules/owner/pages/BranchManagement'));
const StaffManagement = lazy(() => import('./modules/owner/pages/StaffManagement'));
const OwnerAuditLogsPage = lazy(() => import('./modules/owner/pages/OwnerAuditLogsPage'));
const OwnerOutwardExcelPage = lazy(() => import('./modules/owner/pages/OwnerOutwardExcelPage'));
const ShiftHistory = lazy(() => import('./modules/owner/pages/ShiftHistory'));
const ReturnHistory = lazy(() => import('./modules/owner/pages/ReturnHistory'));
const StoreSettings = lazy(() => import('./modules/owner/pages/StoreSettings'));
const PrintTemplateSettings = lazy(() => import('./modules/owner/pages/PrintTemplateSettings'));

// Report Module
const OwnerReports = lazy(() => import('./modules/report/pages/OwnerReports'));

const InventoryRedirect = () => {
  const { user } = useAuth();
  if (hasAnyPermission(user, OWNER_PERMISSIONS)) {
    return <Navigate to="owner-dashboard" replace />;
  }
  // Dashboard luon la default cho moi inventory staff
  return <Navigate to="dashboard" replace />;
};

function App() {
  const LoadingSpinner = (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0f0f0f]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#004785]" />
        <p className="text-sm font-semibold text-slate-600 dark:text-[#999999]">Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <ThemeProvider>
        <IdleTimeout timeoutMinutes={30} />
        <Suspense fallback={LoadingSpinner}>
          <Routes>
          {/* PUBLIC ROUTE */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* PRIVATE & PROTECTED ROUTES */}
          {/* ACCOUNT SETTINGS ROUTE */}
          <Route element={<PrivateRoute />}>
            <Route path="/account-settings" element={<AccountSettingsLayout />}>
              <Route index element={<AccountSettingsPage />} />
            </Route>
          </Route>

          {/* MODULE POS */}
          <Route element={<PrivateRoute allowedPermissions={[...POS_PERMISSIONS, ...OWNER_PERMISSIONS]} />}>
            <Route path="/pos" element={<PosLayout />}>
              <Route index element={<PosScreen />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="shift" element={<ShiftManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="returns" element={<ReturnOrderPage />} />
            </Route>
          </Route>

          {/* MODULE INVENTORY */}
          <Route element={<PrivateRoute allowedPermissions={[...INVENTORY_PERMISSIONS, ...OWNER_PERMISSIONS]} />}>
            <Route path="/inventory" element={<InventoryLayout />}>
              <Route index element={<InventoryRedirect />} />

              {/* --- ROUTE INVENTORY STAFF & OWNER --- */}
              {/* Dashboard luon truy cap duoc cho moi inventory staff */}
              <Route path="dashboard" element={<InventoryDashboard />} />

              {/* --- ROUTE OWNER --- */}
              <Route element={<PrivateRoute allowedPermissions={OWNER_PERMISSIONS} />}>
                <Route path="owner-dashboard" element={<OwnerDashboard />} />
                <Route path="branches" element={<BranchManagement />} />
                <Route path="store-settings" element={<StoreSettings />} />
                <Route path="print-templates" element={<PrintTemplateSettings />} />
                <Route path="employees" element={<StaffManagement />} />
                <Route path="owner-reports" element={<OwnerReports />} />
                <Route path="shift-history" element={<ShiftHistory />} />
                <Route path="return-history" element={<ReturnHistory />} />
                <Route path="audit-logs" element={<OwnerAuditLogsPage />} />
                <Route path="outward-excel" element={<OwnerOutwardExcelPage />} />
                <Route path="audit-logs" element={<OwnerAuditLog />} />
              </Route>

              {/* --- ROUTE REPORT --- */}
              <Route element={<PrivateRoute allowedPermissions={['REPORT_VIEW']} />}>
                <Route path="reports" element={<OwnerReports />} />
              </Route>

              {/* --- ROUTE REPORT --- */}
              <Route element={<PrivateRoute allowedPermissions={['REPORT_VIEW']} />}>
                <Route path="reports" element={<OwnerReports />} />
              </Route>

              <Route element={<PrivateRoute allowedPermissions={ROUTE_PERMISSIONS.inventoryTransactions} />}>
                <Route path="transactions" element={<InventoryTransactionManagement />} />
              </Route>

              {/* --- ROUTE SUPPLIER --- */}
              <Route element={<PrivateRoute allowedPermissions={ROUTE_PERMISSIONS.suppliers} />}>
                <Route path="suppliers" element={<SupplierManagement />} />
              </Route>
              <Route element={<PrivateRoute allowedPermissions={ROUTE_PERMISSIONS.supplierDebt} />}>
                <Route path="supplier-debt" element={<SupplierDebtManagement />} />
              </Route>
              <Route element={<PrivateRoute allowedPermissions={ROUTE_PERMISSIONS.supplierPayments} />}>
                <Route path="supplier-payments" element={<SupplierPaymentManagement />} />
              </Route>

              {/* --- ROUTE EXPENSE --- */}
              <Route element={<PrivateRoute allowedPermissions={ROUTE_PERMISSIONS.expenses} />}>
                <Route path="expenses" element={<ExpenseManagement />} />
              </Route>
              <Route element={<PrivateRoute allowedPermissions={ROUTE_PERMISSIONS.expenseCategories} />}>
                <Route path="expense-categories" element={<ExpenseCategoryManagement />} />
              </Route>

              {/* --- ROUTE OWNER & STAFF --- */}
              <Route element={<PrivateRoute allowedPermissions={ROUTE_PERMISSIONS.inventoryProducts} />}>
                <Route path="products" element={<InventoryProduct />} />
              </Route>
              <Route element={<PrivateRoute allowedPermissions={ROUTE_PERMISSIONS.inventoryImport} />}>
                <Route path="import" element={<StockImport />} />
              </Route>
              <Route element={<PrivateRoute allowedPermissions={ROUTE_PERMISSIONS.inventoryExport} />}>
                <Route path="export" element={<StockExport />} />
              </Route>
              <Route element={<PrivateRoute allowedPermissions={ROUTE_PERMISSIONS.inventoryCheck} />}>
                <Route path="inventory-check" element={<InventoryCheckList />} />
              </Route>
              <Route element={<PrivateRoute allowedPermissions={ROUTE_PERMISSIONS.goodsIssueList} />}>
                <Route path="goods-issue" element={<GoodsIssueList />} />
              </Route>
              <Route element={<PrivateRoute allowedPermissions={ROUTE_PERMISSIONS.goodsIssue} />}>
                <Route path="goods-issue/create" element={<GoodsIssueCreate />} />
              </Route>
              <Route element={<PrivateRoute allowedPermissions={ROUTE_PERMISSIONS.orderList} />}>
                <Route path="orders" element={<OrderList />} />
              </Route>
            </Route>
          </Route>

          {/* MODULE ADMIN  */}
          <Route element={<PrivateRoute allowedPermissions={ADMIN_PERMISSIONS} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUserManagement />} />
              <Route path="users/:id" element={<AdminUserDetail />} />
              <Route path="roles" element={<AdminRoleManagement />} />
              <Route path="branches" element={<AdminBranchManagement />} />
              <Route path="approvals" element={<StoreApprovals />} />
              <Route path="notifications" element={<SystemNotifications />} />
              <Route path="logs" element={<SystemLog />} />
            </Route>
          </Route>

          {/* ROUTE ERROR - redirect kèm toast */}
          <Route path="/403" element={<ErrorToast message="Bạn không có quyền truy cập trang này!" redirectTo="/" />} />
          <Route path="/500" element={<ErrorToast message="Lỗi máy chủ! Vui lòng thử lại sau." redirectTo="/" />} />
          <Route path="*" element={<ErrorToast message="Không tìm thấy trang yêu cầu!" redirectTo="/" />} />
        </Routes>
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
