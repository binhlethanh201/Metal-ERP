import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './shared/components/layout/MainLayout';
import PrivateRoute from './shared/components/layout/PrivateRoute';
import AdminLayout from './modules/admin/components/layout/AdminLayout';

// Static Pages
import LandingPage from './pages/LandingPage';
import NotFound from './pages/errors/NotFound';
import AccessDenied from './pages/errors/AccessDenied';
import ServerError from './pages/errors/ServerError';

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Inventory Module
const InventoryDashboard = lazy(() => import('./modules/inventory/pages/InventoryDashboard'));
const ProductManagement = lazy(() => import('./modules/inventory/pages/ProductManagement'));
const StockImport = lazy(() => import('./modules/inventory/pages/StockImport'));
const StockExport = lazy(() => import('./modules/inventory/pages/StockExport'));
const InventoryReports = lazy(() => import('./modules/inventory/pages/InventoryReports'));

// POS Module
const PosScreen = lazy(() => import('./modules/pos/pages/POSScreen'));
const CheckoutPage = lazy(() => import('./modules/pos/pages/CheckoutPage'));
const OrderHistory = lazy(() => import('./modules/pos/pages/OrderHistory'));
const ShiftManagement = lazy(() => import('./modules/pos/pages/ShiftManagement'));

// Forum Module
const ForumHome = lazy(() => import('./modules/forum/pages/ForumHome'));
const PostDetail = lazy(() => import('./modules/forum/pages/PostDetail'));
const CreatePost = lazy(() => import('./modules/forum/pages/CreatePost'));
const ForumCategory = lazy(() => import('./modules/forum/pages/ForumCategory'));
const ForumNews = lazy(() => import('./modules/forum/pages/ForumNews'));
const ForumTrends = lazy(() => import('./modules/forum/pages/ForumTrends'));
const ForumSupply = lazy(() => import('./modules/forum/pages/ForumSupply'));
const ForumDiscussion = lazy(() => import('./modules/forum/pages/ForumDiscussion'));

// Admin
const AdminDashboard = lazy(() => import('./modules/admin/pages/AdminDashboard'));
const UserManagement = lazy(() => import('./modules/admin/pages/UserManagement'));
const Moderation = lazy(() => import('./modules/admin/pages/Moderation'));
const Billing = lazy(() => import('./modules/admin/pages/Billing'));
const MasterData = lazy(() => import('./modules/admin/pages/MasterData'));

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
      <Suspense fallback={LoadingSpinner}>
        <Routes>
          {/* HOMEPAGE */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<PrivateRoute />}>
            {/* POS */}
            <Route path="/pos">
              <Route index element={<PosScreen />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="shift" element={<ShiftManagement />} />
            </Route>

            {/* FORUM */}
            <Route path="/forum">
              <Route index element={<ForumHome />} />
              <Route path="post/:id" element={<PostDetail />} />
              <Route path="create" element={<CreatePost />} />
              <Route path="category/:id" element={<ForumCategory />} />
              <Route path="news" element={<ForumNews />} />
              <Route path="discussion" element={<ForumDiscussion />} />
              <Route path="trends" element={<ForumTrends />} />
              <Route path="source" element={<ForumSupply />} />
            </Route>

            {/* INVENTORY */}
            <Route path="/inventory" element={<Navigate to="/inventory/dashboard" replace />} />
            <Route path="/inventory/dashboard" element={<InventoryDashboard />} />
            <Route element={<MainLayout />}>
              <Route path="/inventory/products" element={<ProductManagement />} />
              <Route path="/inventory/import" element={<StockImport />} />
              <Route path="/inventory/export" element={<StockExport />} />
              <Route path="/inventory/reports" element={<InventoryReports />} />
            </Route>

            {/* ADMIN */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="moderation" element={<Moderation />} />
              <Route path="billing" element={<Billing />} />
              <Route path="master-data" element={<MasterData />} />
            </Route>
          </Route>

          {/* ERROR */}
          <Route path="/403" element={<AccessDenied />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
