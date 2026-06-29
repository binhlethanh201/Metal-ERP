import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Inventory Module
const InventoryLayout = lazy(() => import('./modules/inventory/layouts/InventoryLayout'));
const InventoryDashboard = lazy(() => import('./modules/inventory/pages/InventoryDashboard'));
const InventoryProduct = lazy(() => import('./modules/inventory/pages/InventoryProduct'));
const StockImport = lazy(() => import('./modules/inventory/pages/StockImport'));
const StockExport = lazy(() => import('./modules/inventory/pages/StockExport'));
const InventoryReports = lazy(() => import('./modules/inventory/pages/InventoryReports'));
const InventorySummaryReport = lazy(
  () => import('./modules/inventory/pages/InventorySummaryReport')
);
const InventoryCountList = lazy(() => import('./modules/inventory/pages/InventoryCountList'));
// Goods Issue (Xuat Kho) - part of Inventory module
const GoodsIssueList = lazy(() => import('./modules/inventory/pages/GoodsIssueList'));
const GoodsIssueCreate = lazy(() => import('./modules/inventory/pages/GoodsIssueCreate'));
// Order Management - part of Inventory module
const OrderList = lazy(() => import('./modules/inventory/pages/OrderList'));

// POS Module
const PosLayout = lazy(() => import('./modules/pos/layouts/PosLayout'));
const PosScreen = lazy(() => import('./modules/pos/pages/POSScreen'));
const CheckoutPage = lazy(() => import('./modules/pos/pages/CheckoutPage'));
const OrderHistory = lazy(() => import('./modules/pos/pages/OrderHistory'));
const ShiftManagement = lazy(() => import('./modules/pos/pages/ShiftManagement'));
const CustomerManagement = lazy(() => import('./modules/pos/pages/CustomerManagement'));
const ReturnOrderPage = lazy(() => import('./modules/pos/pages/ReturnOrderPage'));

// Forum Module
const ForumLayout = lazy(() => import('./modules/forum/layouts/ForumLayout'));
const ForumHome = lazy(() => import('./modules/forum/pages/ForumHome'));
const PostDetail = lazy(() => import('./modules/forum/pages/PostDetail'));
const CreatePost = lazy(() => import('./modules/forum/pages/CreatePost'));
const ForumCategory = lazy(() => import('./modules/forum/pages/ForumCategory'));
const ForumNews = lazy(() => import('./modules/forum/pages/ForumNews'));
const ForumTrends = lazy(() => import('./modules/forum/pages/ForumTrends'));
const ForumSupply = lazy(() => import('./modules/forum/pages/ForumSupply'));
const ForumMyPosts = lazy(() => import('./modules/forum/pages/ForumMyPosts'));
const ForumSaved = lazy(() => import('./modules/forum/pages/ForumSaved'));
const ForumTopProducts = lazy(() => import('./modules/forum/pages/ForumTopProducts'));
const ForumNewProducts = lazy(() => import('./modules/forum/pages/ForumNewProducts'));
const ForumImportSuggest = lazy(() => import('./modules/forum/pages/ForumImportSuggest'));
const ForumProfile = lazy(() => import('./modules/forum/pages/ForumProfile'));
const ForumDiscussion = lazy(() => import('./modules/forum/pages/ForumDiscussion'));

// Admin Module
const AdminLayout = lazy(() => import('./modules/admin/layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./modules/admin/pages/AdminDashboard'));
const UserAccountsManagement = lazy(() => import('./modules/admin/pages/UserAccountsManagement'));
const CategoryManagement = lazy(() => import('./modules/admin/pages/CategoryManagement'));
const PostModeration = lazy(() => import('./modules/admin/pages/PostModeration'));
const SystemNotifications = lazy(() => import('./modules/admin/pages/SystemNotifications'));
const SystemLog = lazy(() => import('./modules/admin/pages/SystemLog'));
const StoreApprovals = lazy(() => import('./modules/admin/pages/StoreApprovals'));

// Owner Module
const BranchManagement = lazy(() => import('./modules/owner/pages/BranchManagement'));
const StaffManagement = lazy(() => import('./modules/owner/pages/StaffManagement'));

function App() {
  const LoadingSpinner = (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#004785]" />
        <p className="text-sm font-semibold text-slate-600">Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <IdleTimeout timeoutMinutes={30} />
      <Suspense fallback={LoadingSpinner}>
        <Routes>
          {/* PUBLIC ROUTE */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* PRIVATE & PROTECTED ROUTES */}
          {/* MODULE FORUM */}
          <Route element={<PrivateRoute />}>
            <Route path="/forum" element={<ForumLayout />}>
              <Route index element={<ForumHome />} />
              <Route path="post/:id" element={<PostDetail />} />
              <Route path="create" element={<CreatePost />} />
              <Route path="category/:id" element={<ForumCategory />} />
              <Route path="news" element={<ForumNews />} />
              <Route path="discussion" element={<ForumDiscussion />} />
              <Route path="trends" element={<ForumTrends />} />
              <Route path="source" element={<ForumSupply />} />
              <Route path="my-posts" element={<ForumMyPosts />} />
              <Route path="saved" element={<ForumSaved />} />
              <Route path="top-products" element={<ForumTopProducts />} />
              <Route path="new-products" element={<ForumNewProducts />} />
              <Route path="import-suggest" element={<ForumImportSuggest />} />
              <Route path="profile" element={<ForumProfile />} />
            </Route>
          </Route>

          {/* MODULE POS */}
          <Route element={<PrivateRoute allowedRoles={['Owner', 'SalesStaff']} />}>
            <Route path="/pos" element={<PosLayout />}>
              <Route index element={<PosScreen />} />
              <Route path="returns" element={<ReturnOrderPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="shift" element={<ShiftManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
            </Route>
          </Route>

          {/*  MODULE INVENTORY */}
          <Route element={<PrivateRoute allowedRoles={['Owner', 'InventoryStaff']} />}>
            <Route path="/inventory" element={<InventoryLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<InventoryDashboard />} />
              <Route path="products" element={<InventoryProduct />} />
              <Route path="import" element={<StockImport />} />
              <Route path="export" element={<StockExport />} />
              <Route path="reports" element={<InventoryReports />} />
              <Route path="inventory-summary" element={<InventorySummaryReport />} />
              <Route path="inventory-count" element={<InventoryCountList />} />
              <Route path="goods-issue" element={<GoodsIssueList />} />
              <Route path="goods-issue/create" element={<GoodsIssueCreate />} />
              <Route path="orders" element={<OrderList />} />
              <Route element={<PrivateRoute allowedRoles={['Owner']} />}>
                <Route path="branches" element={<BranchManagement />} />
                <Route path="employees" element={<StaffManagement />} />
              </Route>
            </Route>
          </Route>

          {/* MODULE ADMIN  */}
          <Route element={<PrivateRoute allowedRoles={['Admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserAccountsManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="moderation" element={<PostModeration />} />
              <Route path="notifications" element={<SystemNotifications />} />
              <Route path="logs" element={<SystemLog />} />
              <Route path="store-approvals" element={<StoreApprovals />} />
            </Route>
          </Route>

          {/* CÁC ROUTE LỖI */}
          <Route path="/403" element={<AccessDenied />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
