/** Sidebar POS - Menu chức năng (Bán hàng, Đơn hàng, Khách, Báo cáo, Cài đặt) + nút Kho hàng. */
import MaterialIcon from '../../../shared/components/MaterialIcon';

const PosSidebar = ({ activeMenu, onMenuSelect, onNavigateWarehouse }) => {
  const menuItems = [
    ['shopping_cart', 'Bán hàng'],
    ['assignment', 'Đơn hàng'],
    ['person', 'Khách'],
    ['assessment', 'Báo cáo'],
    ['settings', 'Cài đặt'],
  ];

  return (
    <aside className="custom-scrollbar fixed left-0 top-0 z-50 flex h-[calc(100vh-3rem)] w-[260px] flex-col overflow-y-auto border-r border-slate-200 bg-white p-4">
      <div className="mb-8 flex items-center gap-3 px-2">
        <MaterialIcon name="inventory_2" className="text-2xl text-[#004785]" />
        <div>
          <h1 className="text-lg font-bold tracking-tight text-blue-900">Inventory Pro</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Point of Sale
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
        <div>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            CHỨC NĂNG
          </p>
          <div className="space-y-1">
            {menuItems.map(([icon, label]) => (
              <button
                key={label}
                onClick={() => onMenuSelect(label)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${activeMenu === label ? 'bg-blue-50 font-semibold text-blue-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <MaterialIcon name={icon} className="text-xl" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="mt-auto space-y-2 border-t border-slate-100 pt-4">
        <button
          onClick={onNavigateWarehouse}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#004785] py-3 font-bold text-white transition-all active:scale-95"
        >
          <MaterialIcon name="inventory" className="text-sm" />
          <span>Kho hàng</span>
        </button>
      </div>
    </aside>
  );
};

export default PosSidebar;
