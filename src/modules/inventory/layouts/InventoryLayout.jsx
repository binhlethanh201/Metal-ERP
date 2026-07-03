import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import InventorySidebar from '../components/home/InventorySidebar';
import InventoryTopbar from '../components/home/InventoryTopbar';

const InventoryLayout = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-on-surface antialiased">
      <InventorySidebar />

      <div className="ml-[260px] flex min-h-screen flex-col">
        <InventoryTopbar />

        <main className="flex-1 p-6 pt-20 transition-all duration-200">
          <Suspense
            fallback={
              <div className="flex h-96 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#004785]" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default InventoryLayout;
