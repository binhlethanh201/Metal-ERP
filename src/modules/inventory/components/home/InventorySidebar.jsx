/**
 * Sidebar Tổng kho - Menu điều hướng trái (Vận hành/Kinh doanh/Kết nối).
 */
import React from 'react';
import MaterialIcon from '../shared/MaterialIcon';
import Logo from '../../../../shared/components/Logo';
import { inventoryMenuGroups as menuGroups } from '../../data/inventoryPageData';

const InventorySidebar = () => {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-[260px] flex-col border-r border-slate-200 bg-white p-4">
      <div className="mb-8 px-2">
        <Logo moduleName="Tổng Kho" />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (!item.path) return;
                    window.history.pushState({}, '', item.path);
                    window.dispatchEvent(new Event('popstate'));
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 ${
                    item.active
                      ? 'bg-blue-50 font-semibold text-blue-900'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MaterialIcon name={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-slate-100 pt-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#004785] py-3 font-bold text-white transition-all active:scale-95">
          <MaterialIcon name="bolt" className="text-sm" />
          <span>Hỗ trợ AI</span>
        </button>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-100">
          <MaterialIcon name="settings" />
          <span>Cài đặt</span>
        </button>
      </div>
    </aside>
  );
};

export default InventorySidebar;
