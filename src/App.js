import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './shared/hooks/useAuth';
import { hasRole } from './shared/utils/roleRedirect';
import { ThemeProvider } from './shared/contexts/ThemeContext';

// Layouts
import PrivateRoute from './shared/components/layout/PrivateRoute';

//Timeout
import IdleTimeout from './shared/components/auth/IdleTimeout';

// Static Pages
import LandingPage from './pages/LandingPage';
import NotFound from './pages/errors/NotFound';
import AccessDenied from './pages/errors/AccessDenied';
import ServerError from './pages/errors/ServerError';

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
const InventoryReports = lazy(() => import('./modules/inventory/pages/InventoryReports'));
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

// Report Module
const OwnerReports = lazy(() => import('./modules/report/pages/OwnerReports'));

const InventoryRedirect = () => {
  const { user } = useAuth();
  const roles = Array.isArray(user?.roles) ? user.roles : user?.role ? [user.role] : [];
  const isOwner = hasRole(roles, 'Owner');
  return <Navigate to={isOwner ? 'owner-dashboard' : 'dashboard'} replace />;
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
          <Route
            element={
              <PrivateRoute allowedRoles={['Owner', 'SalesStaff', 'InventoryStaff', 'Admin']} />
            }
          >
            <Route path="/account-settings" element={<AccountSettingsLayout />}>
              <Route index element={<AccountSettingsPage />} />
            </Route>
          </Route>

          {/* MODULE POS */}
          <Route element={<PrivateRoute allowedRoles={['Owner', 'SalesStaff']} />}>
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
          <Route element={<PrivateRoute allowedRoles={['Owner', 'InventoryStaff']} />}>
            <Route path="/inventory" element={<InventoryLayout />}>
              <Route index element={<InventoryRedirect />} />

              {/* --- ROUTE INVENTORY STAFF & OWNER --- */}
              <Route element={<PrivateRoute allowedRoles={['Owner', 'InventoryStaff']} />}>
                <Route path="dashboard" element={<InventoryDashboard />} />
              </Route>

              {/* --- ROUTE OWNER --- */}
              <Route element={<PrivateRoute allowedRoles={['Owner']} />}>
                <Route path="owner-dashboard" element={<OwnerDashboard />} />
                <Route path="branches" element={<BranchManagement />} />
                <Route path="store-settings" element={<StoreSettings />} />
                <Route path="employees" element={<StaffManagement />} />
                <Route path="owner-reports" element={<OwnerReports />} />
                <Route path="shift-history" element={<ShiftHistory />} />
                <Route path="return-history" element={<ReturnHistory />} />
                <Route path="suppliers" element={<SupplierManagement />} />
                <Route path="supplier-debt" element={<SupplierDebtManagement />} />
                <Route path="supplier-payments" element={<SupplierPaymentManagement />} />
                <Route path="expenses" element={<ExpenseManagement />} />
                <Route path="expense-categories" element={<ExpenseCategoryManagement />} />
                <Route path="audit-logs" element={<OwnerAuditLogsPage />} />
                <Route path="outward-excel" element={<OwnerOutwardExcelPage />} />
                <Route path="transactions" element={<InventoryTransactionManagement />} />
                <Route path="audit-logs" element={<OwnerAuditLog />} />
              </Route>

              {/* --- ROUTE OWNER & STAFF --- */}
              <Route path="products" element={<InventoryProduct />} />
              <Route path="import" element={<StockImport />} />
              <Route path="export" element={<StockExport />} />
              <Route path="reports" element={<InventoryReports />} />
              <Route path="inventory-check" element={<InventoryCheckList />} />
              <Route path="goods-issue" element={<GoodsIssueList />} />
              <Route path="goods-issue/create" element={<GoodsIssueCreate />} />
              <Route path="orders" element={<OrderList />} />
            </Route>
          </Route>

          {/* MODULE ADMIN  */}
          <Route element={<PrivateRoute allowedRoles={['Admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUserManagement />} />
              <Route path="users/:id" element={<AdminUserDetail />} />
              <Route path="roles" element={<AdminRoleManagement />} />
              <Route path="approvals" element={<StoreApprovals />} />
              <Route path="notifications" element={<SystemNotifications />} />
              <Route path="logs" element={<SystemLog />} />
            </Route>
          </Route>

          {/* ROUTE ERROR */}
          <Route path="/403" element={<AccessDenied />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
