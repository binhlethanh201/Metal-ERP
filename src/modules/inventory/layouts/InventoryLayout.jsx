import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import InventorySidebar from '../components/home/InventorySidebar';
import InventoryHeader from '../components/home/InventoryHeader';

const InventoryLayout = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f7f9fc] font-sans text-slate-900 antialiased">
      <InventoryHeader />
      <div className="flex flex-1 gap-3 overflow-hidden p-3">
        <InventorySidebar />
        <main className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#004785]" />
              </div>
            }
          >
            <div className="h-full overflow-y-auto p-4 lg:p-6">
              <Outlet />
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default InventoryLayout;
