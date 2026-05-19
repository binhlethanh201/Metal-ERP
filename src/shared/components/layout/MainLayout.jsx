import { Suspense } from 'react';
import { Outlet } from 'react-router-dom'; // 1. Thêm Outlet
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MainLayout = ({ onNavigate = () => {} }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onNavigate={onNavigate} />
      <div className="ml-[260px] flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto pt-16">
          <div className="w-full px-6 py-8">
            <Suspense
              fallback={
                <div className="flex h-96 items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
                </div>
              }
            >
              {/* 2. Thay {children} bằng <Outlet /> */}
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
