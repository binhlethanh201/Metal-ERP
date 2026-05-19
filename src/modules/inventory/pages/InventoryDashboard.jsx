import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MaterialIcon from '../components/MaterialIcon';
import {
  cashSummary,
  dashboardKpis,
  financeKpis,
  forumProducts,
  forumReports,
  inventoryTrend,
  recentTransactions,
} from '../data/inventoryMockData';

const sidebarItems = [
  { label: 'Tổng quan', icon: 'dashboard', path: '/inventory/dashboard' },
  { label: 'Hàng hóa', icon: 'inventory_2', path: '/inventory/products' },
  { label: 'Diễn đàn', icon: 'forum', path: '/forum' },
  { label: 'Báo cáo', icon: 'analytics', path: '/inventory/reports' },
  { label: 'Quản lý nhân viên', icon: 'badge', path: '/admin' },
];

const horizontalNav = [
  { key: 'inventory', label: 'Kho hàng', icon: 'inventory_2', path: '/inventory/dashboard' },
  { key: 'orders', label: 'Đơn hàng', icon: 'shopping_cart' },
  { key: 'suppliers', label: 'Nhà cung cấp', icon: 'groups' },
  { key: 'promotions', label: 'Khuyến mãi', icon: 'sell' },
  { key: 'funds', label: 'Quỹ tiền', icon: 'account_balance_wallet' },
  { key: 'purchasing', label: 'Mua hàng', icon: 'shopping_bag' },
];

const hubConfigs = {
  inventory: {
    centerLabel: 'Kho hàng',
    centerIcon: 'inventory_2',
    actions: [
      { id: 'inv-1', label: 'Nhập kho', icon: 'input', path: '/inventory/import' },
      { id: 'inv-2', label: 'Điều chuyển từ CH khác', icon: 'store' },
      { id: 'inv-3', label: 'Xuất kho', icon: 'output', path: '/inventory/export' },
      { id: 'inv-4', label: 'Chuyển kho', icon: 'swap_horiz' },
      { id: 'inv-5', label: 'Lệnh điều chuyển', icon: 'assignment' },
      { id: 'inv-6', label: 'Kiểm kê kho', icon: 'inventory' },
      { id: 'inv-7', label: 'Tổng hợp tồn kho', icon: 'list_alt', path: '/inventory/reports' },
      { id: 'inv-8', label: 'Tính giá xuất kho', icon: 'calculate' },
    ],
  },
  orders: {
    centerLabel: 'Đơn hàng',
    centerIcon: 'shopping_cart',
    actions: [
      { id: 'ord-1', label: 'Tạo đơn hàng', icon: 'add_shopping_cart' },
      { id: 'ord-2', label: 'Xử lý đơn', icon: 'inventory_2' },
      { id: 'ord-3', label: 'Giao hàng', icon: 'local_shipping' },
      { id: 'ord-4', label: 'Đổi trả', icon: 'cached' },
    ],
  },
  suppliers: {
    centerLabel: 'Nhà cung cấp',
    centerIcon: 'groups',
    actions: [
      { id: 'sup-1', label: 'Danh sách NCC', icon: 'list_alt' },
      { id: 'sup-2', label: 'Đánh giá NCC', icon: 'star' },
      { id: 'sup-3', label: 'Công nợ NCC', icon: 'request_quote' },
      { id: 'sup-4', label: 'Lịch sử hợp tác', icon: 'history' },
    ],
  },
  promotions: {
    centerLabel: 'Khuyến mãi',
    centerIcon: 'sell',
    actions: [
      { id: 'pro-1', label: 'Chương trình khuyến mãi', icon: 'campaign' },
      { id: 'pro-2', label: 'Thẻ voucher', icon: 'card_giftcard' },
    ],
  },
  funds: {
    centerLabel: 'Quỹ tiền',
    centerIcon: 'account_balance_wallet',
    actions: [
      { id: 'fund-1', label: 'Thu tiền', icon: 'south_west' },
      { id: 'fund-2', label: 'Chi tiền', icon: 'north_east' },
      { id: 'fund-3', label: 'Sổ quỹ', icon: 'menu_book' },
      { id: 'fund-4', label: 'Đối soát quỹ', icon: 'balance' },
    ],
  },
  purchasing: {
    centerLabel: 'Mua hàng',
    centerIcon: 'shopping_bag',
    actions: [
      { id: 'buy-1', label: 'Báo hàng', icon: 'notifications_active' },
      { id: 'buy-2', label: 'Nhập hàng', icon: 'inventory_2' },
      { id: 'buy-3', label: 'Đặt hàng', icon: 'assignment_add' },
      { id: 'buy-4', label: 'Trả lại hàng mua', icon: 'assignment_return' },
      { id: 'buy-5', label: 'Trả', icon: 'reply' },
    ],
  },
};

const primaryToneClass = {
  navy: 'bg-blue-50 text-[#004785] group-hover:bg-[#004785] group-hover:text-white',
  orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
  red: 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white',
  green: 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white',
};

const progressToneClass = {
  navy: 'bg-[#004785]',
  slate: 'bg-slate-400',
  green: 'bg-green-500',
};

const transactionToneClass = {
  export: 'bg-blue-50 text-blue-600',
  import: 'bg-green-50 text-green-600',
  transfer: 'bg-orange-50 text-orange-600',
};

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeHubKey, setActiveHubKey] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      text: 'Xin chào! Tôi là trợ lý ảo. Bạn muốn tra cứu tồn kho, đơn hàng hay báo cáo nào?',
    },
  ]);
  const isHubOpen = Boolean(activeHubKey);
  const activeHubConfig = hubConfigs[activeHubKey] || hubConfigs.inventory;

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isHubOpen);

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isHubOpen]);

  const handleNavigate = (path, hubKey) => {
    if (hubKey) {
      setActiveHubKey(hubKey);
      return;
    }

    if (!path) return;
    navigate(path);
  };

  const handleHubSelect = (action) => {
    if (action.path) {
      navigate(action.path);
    }
    setActiveHubKey(null);
  };

  const closeHub = () => {
    setActiveHubKey(null);
  };

  const isSidebarActive = (path) => {
    if (!path) return false;
    if (path === '/inventory/dashboard')
      return location.pathname.startsWith('/inventory/dashboard');
    if (path === '/inventory/products') return location.pathname.startsWith('/inventory/products');
    if (path === '/inventory/reports') return location.pathname.startsWith('/inventory/reports');
    if (path === '/forum') return location.pathname.startsWith('/forum');
    if (path === '/admin') return location.pathname.startsWith('/admin');
    return location.pathname === path;
  };

  const handleAssistantSend = () => {
    const value = assistantInput.trim();
    if (!value) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: value,
    };

    const botMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text: 'Đã nhận yêu cầu. Tôi sẽ hỗ trợ bạn ngay sau khi đồng bộ dữ liệu nghiệp vụ.',
    };

    setAssistantMessages((prev) => [...prev, userMessage, botMessage]);
    setAssistantInput('');
  };

  const getHubPosition = (index, total) => {
    const radius = 220;
    const angle = -90 + index * (360 / total);
    const rad = (angle * Math.PI) / 180;

    return {
      x: Math.round(Math.cos(rad) * radius),
      y: Math.round(Math.sin(rad) * radius),
    };
  };

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased">
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-primary/40 backdrop-blur-md transition-opacity duration-300 ${
          isHubOpen
            ? 'pointer-events-auto visible opacity-100'
            : 'pointer-events-none invisible opacity-0'
        }`}
      >
        <div className="relative flex h-full w-full items-center justify-center">
          <button
            type="button"
            aria-label="Đóng hub"
            className="absolute inset-0"
            onClick={closeHub}
          />

          <div className="relative z-50 flex flex-col items-center">
            <button
              type="button"
              className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-white/20 bg-primary text-white shadow-2xl transition-transform hover:scale-105 active:scale-95"
              onClick={closeHub}
            >
              <MaterialIcon name={activeHubConfig.centerIcon} className="text-4xl" />
              <span className="mt-1 text-[12px] font-bold uppercase tracking-tight">
                {activeHubConfig.centerLabel}
              </span>
            </button>
          </div>

          {activeHubConfig.actions.map((action, index) => {
            const position = getHubPosition(index, activeHubConfig.actions.length);

            return (
              <div
                key={action.id}
                className={`absolute left-1/2 top-1/2 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isHubOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}
                style={{
                  transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleHubSelect(action)}
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/10 bg-white text-primary shadow-xl transition-all hover:scale-110 hover:bg-primary hover:text-white"
                  >
                    <MaterialIcon name={action.icon} className="text-2xl" />
                  </button>
                  <div className="rounded bg-white/90 px-3 py-1 shadow-sm backdrop-blur">
                    <span className="whitespace-nowrap text-[11px] font-bold uppercase text-primary">
                      {action.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-pulse text-xs font-medium uppercase tracking-[0.2em] text-white/70"
            onClick={closeHub}
          >
            Nhấn vào vùng trống để quay lại
          </button>
        </div>
      </div>

      <aside className="fixed left-0 top-0 z-40 hidden h-full w-[260px] flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-white">
            <MaterialIcon name="factory" fill />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-blue-900">MetalERP</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Industrial Precision
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              HỆ THỐNG
            </p>
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    isSidebarActive(item.path)
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
        </nav>

        <div className="mt-auto space-y-2 border-t border-slate-100 pt-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#004785] py-3 font-bold text-white transition-all active:scale-95">
            <MaterialIcon name="bolt" className="text-sm" />
            <span>Hỗ trợ AI</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100">
            <MaterialIcon name="settings" />
            <span>Cài đặt</span>
          </button>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-30 flex flex-col border-b border-slate-200 bg-white lg:left-[260px]">
        <div className="flex h-16 items-center justify-between gap-4 px-6">
          <div className="flex flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
            <MaterialIcon name="search" className="mr-2 text-slate-400" />
            <input
              className="w-full border-none bg-transparent text-sm outline-none focus:ring-0"
              placeholder="Tìm kiếm sản phẩm, đơn hàng..."
              type="text"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
              <button
                type="button"
                onClick={() => navigate('/inventory/export')}
                className="rounded-lg border border-[#F59E0B] px-4 py-2 text-sm font-bold text-[#F59E0B] transition-all active:scale-95"
              >
                Xuất kho
              </button>
              <button
                type="button"
                onClick={() => navigate('/pos')}
                className="flex items-center gap-1 rounded-lg border border-[#004785] px-4 py-2 text-sm font-bold text-[#004785] transition-all hover:bg-blue-50 active:scale-95"
              >
                <MaterialIcon name="point_of_sale" className="text-sm" />
                <span>Máy bán hàng</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <MaterialIcon name="notifications" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
              </button>
              <div className="flex items-center gap-3 pl-2">
                <img
                  alt="User Profile Avatar"
                  className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFo3D0VhkjDp6wYi7A3G3rtT-HeBeV9_Irw1MncCf1By9FiWAzrrW0Y1o_eR0BIqouI4JLwKyzpxHiyhHrOxhP1gc2OrbrKeKagYERgHPSLqIeqXh7iopYQYZFpQ3HRo32q_gQG4t9lU6JywKA9r6XbGmBU0YhjbyNzuCTVz8W4Q6FKwogP_fwDpM6p_EySDffHLbP5e-WRjoesCtXL6OJytbDZySk5VBmPYWb9eQM2XahiNm9R3AHtYeKbU3QQiT82T6wAgP0MXo"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-12 items-center bg-[#faf9fc] px-6">
          <nav className="no-scrollbar flex h-10 w-full items-center gap-8 overflow-x-auto rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
            {horizontalNav.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavigate(item.path, item.key)}
                className="group relative flex h-full items-center gap-2 px-2 text-slate-600 transition-colors hover:text-primary"
              >
                <MaterialIcon name={item.icon} className="text-[20px]" />
                <span className="whitespace-nowrap text-sm font-medium">{item.label}</span>
                <span className="absolute bottom-0 left-2 right-2 h-0.5 scale-x-0 bg-primary transition-transform duration-200 group-hover:scale-x-100" />
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="ml-0 pt-[128px] lg:ml-[260px]">
        <div className="mx-auto max-w-[1600px] space-y-6 px-4 pb-8 lg:px-6">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboardKpis.map((kpi) => (
              <article
                key={kpi.id}
                className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-[#004785]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`rounded-lg p-2 ${primaryToneClass[kpi.tone] || primaryToneClass.navy}`}
                  >
                    <MaterialIcon name={kpi.icon} />
                  </div>
                  {kpi.change ? (
                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-600">
                      {kpi.change}
                    </span>
                  ) : null}
                </div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                  {kpi.label}
                </p>
                <h2
                  className={`text-2xl font-extrabold ${
                    kpi.tone === 'orange'
                      ? 'text-orange-600'
                      : kpi.tone === 'red'
                        ? 'text-red-600'
                        : kpi.tone === 'green'
                          ? 'text-green-600'
                          : 'text-blue-900'
                  }`}
                >
                  {kpi.value}
                </h2>
                <p className="mt-2 text-sm text-slate-400">{kpi.unit}</p>
              </article>
            ))}

            {financeKpis.map((metric) => (
              <article
                key={metric.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                  {metric.label}
                </p>
                <h2
                  className={`text-xl font-extrabold ${metric.tone === 'green' ? 'text-green-600' : 'text-blue-900'}`}
                >
                  {metric.value}{' '}
                  {metric.unit ? <span className="text-sm font-medium">{metric.unit}</span> : null}
                </h2>
                {typeof metric.progress === 'number' ? (
                  <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full ${progressToneClass[metric.tone] || 'bg-[#004785]'}`}
                      style={{ width: `${metric.progress}%` }}
                    />
                  </div>
                ) : null}
                {metric.subtitle ? (
                  <p className="mt-2 text-sm text-blue-600">{metric.subtitle}</p>
                ) : null}
              </article>
            ))}
          </section>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 grid grid-cols-1 gap-6 lg:col-span-8 lg:grid-cols-2">
              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                  XU HƯỚNG TỒN KHO (7 NGÀY)
                </h4>
                <div className="flex h-48 items-end gap-2 px-2">
                  {inventoryTrend.map((item) => (
                    <div
                      key={item.day}
                      className="h-full w-full rounded-t-md bg-blue-100 transition-colors hover:bg-[#004785]"
                      style={{ height: `${item.height}%` }}
                      title={`${item.day}: ${item.value}`}
                    />
                  ))}
                </div>
                <div className="mt-3 flex justify-between px-2 text-[10px] font-bold uppercase text-slate-400">
                  {inventoryTrend.map((item) => (
                    <span key={item.day}>{item.day}</span>
                  ))}
                </div>
              </article>

              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                  NHẬP / XUẤT KHO
                </h4>
                <div className="relative h-48 overflow-hidden">
                  <svg className="h-full w-full" viewBox="0 0 400 150" aria-hidden="true">
                    <path
                      d="M0,120 Q50,80 100,100 T200,60 T300,90 T400,30"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="2"
                    />
                    <path
                      d="M0,100 Q50,130 100,70 T200,110 T300,50 T400,80"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="absolute bottom-2 right-2 flex gap-3">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-[10px] font-bold uppercase text-slate-500">Nhập</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                      <span className="text-[10px] font-bold uppercase text-slate-500">Xuất</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <article className="col-span-12 flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-4">
              <div className="mb-6 flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.05em] text-primary">
                  TIN TỨC &amp; XU HƯỚNG DIỄN ĐÀN
                </h4>
                <MaterialIcon name="forum" className="text-2xl text-primary" />
              </div>

              <div className="flex flex-1 flex-col gap-6">
                <section>
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    SẢN PHẨM MỚI
                  </p>
                  <div className="space-y-4">
                    {forumProducts.map((product) => (
                      <div key={product.id} className="flex items-center gap-4">
                        <img
                          alt={product.alt}
                          className="h-12 w-12 rounded-xl object-cover"
                          src={product.image}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-bold leading-snug text-slate-900">
                            {product.name}
                          </p>
                          <button
                            type="button"
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mt-2">
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    BÁO CÁO XU HƯỚNG
                  </p>
                  <div className="space-y-3">
                    {forumReports.map((report) => (
                      <div
                        key={report.id}
                        className={`flex items-start justify-between rounded-xl border p-4 ${
                          report.tone === 'red'
                            ? 'border-blue-100/50 bg-blue-50/50'
                            : 'border-green-100/50 bg-green-50/50'
                        }`}
                      >
                        <div className="flex-1">
                          <h5
                            className={`text-sm font-bold ${report.tone === 'red' ? 'text-primary' : 'text-green-900'}`}
                          >
                            {report.title}
                          </h5>
                          <p className="mt-1 text-[11px] text-slate-500">{report.desc}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                            report.tone === 'red'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-200 text-green-800'
                          }`}
                        >
                          {report.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </article>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <article className="col-span-12 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:col-span-8">
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2 text-primary">
                    <MaterialIcon name="history" />
                  </div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                    GIAO DỊCH GẦN ĐÂY
                  </h4>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-blue-100 px-4 py-2 text-xs font-bold text-primary hover:bg-blue-50"
                >
                  Xem báo cáo
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-100 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Loại
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Đối tác / Mã đơn
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Thời gian
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Giá trị (VND)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              transactionToneClass[transaction.type] ||
                              transactionToneClass.transfer
                            }`}
                          >
                            <MaterialIcon
                              name={
                                transaction.type === 'import'
                                  ? 'check'
                                  : transaction.type === 'transfer'
                                    ? 'swap_horiz'
                                    : 'north_east'
                              }
                              className="text-sm"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900">{transaction.partner}</p>
                          <p className="text-[10px] text-slate-500">{transaction.location}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">
                          {transaction.time}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-black text-slate-900">
                          {transaction.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="col-span-12 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                  TỔNG QUỸ TIỀN MẶT
                </h4>
                <MaterialIcon name="account_balance_wallet" className="text-slate-400" />
              </div>
              <h2 className="mb-6 text-2xl font-extrabold text-blue-900">
                {cashSummary.total} <span className="text-sm font-medium">VND</span>
              </h2>
              <div className="flex items-end justify-between border-t border-slate-50 pt-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400">THU (THÁNG)</p>
                  <p className="text-sm font-black text-green-600">{cashSummary.income}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold uppercase text-slate-400">CHI (THÁNG)</p>
                  <p className="text-sm font-black text-red-600">{cashSummary.expense}</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>

      <div
        className={`fixed bottom-24 right-4 z-[60] w-[calc(100vw-2rem)] max-w-[380px] rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-200 lg:right-8 ${
          isAssistantOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible translate-y-4 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <MaterialIcon name="smart_toy" className="text-lg" />
            <p className="text-sm font-bold">Trợ lý ảo MetalERP</p>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-white/80 transition hover:bg-white/15 hover:text-white"
            onClick={() => setIsAssistantOpen(false)}
          >
            <MaterialIcon name="close" className="text-base" />
          </button>
        </div>

        <div className="max-h-[280px] space-y-3 overflow-y-auto px-4 py-3">
          {assistantMessages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[88%] rounded-xl px-3 py-2 text-sm ${
                message.role === 'user'
                  ? 'ml-auto bg-primary text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 p-3">
          <input
            type="text"
            value={assistantInput}
            onChange={(event) => setAssistantInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAssistantSend();
              }
            }}
            placeholder="Nhập câu hỏi cho trợ lý..."
            className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-primary"
          />
          <button
            type="button"
            onClick={handleAssistantSend}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white transition hover:brightness-110"
          >
            <MaterialIcon name="send" className="text-lg" />
          </button>
        </div>
      </div>

      <button
        type="button"
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-2xl transition-transform hover:scale-110"
        onClick={() => setIsAssistantOpen((prev) => !prev)}
      >
        <MaterialIcon name="chat" className="text-2xl" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold">
            1
          </span>
        </span>
      </button>
    </div>
  );
};

export default InventoryDashboard;
