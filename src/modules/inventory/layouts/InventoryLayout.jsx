import React, { Suspense, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import InventorySidebar from '../components/home/InventorySidebar';
import InventoryTopbar from '../components/home/InventoryTopbar';
import HubOverlay from '../components/home/HubOverlay';
import { hubConfigs } from '../data/inventoryPageData';

const InventoryLayout = () => {
  const navigate = useNavigate();
  // 2. Khởi tạo đối tượng location từ hook useLocation()
  const location = useLocation();

  const [activeHubKey, setActiveHubKey] = useState(null);

  const isHubOpen = Boolean(activeHubKey);
  const activeHubConfig = hubConfigs[activeHubKey] || hubConfigs.inventory;

  const handleHubSelect = (action) => {
    if (action.path) navigate(action.path);
    setActiveHubKey(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-on-surface antialiased">
      <HubOverlay
        isOpen={isHubOpen}
        config={activeHubConfig}
        onClose={() => setActiveHubKey(null)}
        onSelect={handleHubSelect}
      />

      <InventorySidebar />

      <div className="ml-[260px] flex min-h-screen flex-col">
        <InventoryTopbar activeHubKey={activeHubKey} setActiveHubKey={setActiveHubKey} />

        {/* Đoạn xử lý toán tử ba ngôi bên dưới bây giờ sẽ đọc biến `location` từ hook một cách an toàn */}
        <main
          className={`flex-1 p-6 transition-all duration-200 ${
            location.pathname === '/inventory/dashboard' ||
            location.pathname === '/inventory/products' ||
            location.pathname === '/inventory/orders'
              ? 'pt-[128px]'
              : 'pt-20'
          }`}
        >
          <Suspense
            fallback={
              <div className="flex h-96 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#004785]" />
              </div>
            }
          >
            <Outlet context={{ setActiveHubKey }} />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default InventoryLayout;
