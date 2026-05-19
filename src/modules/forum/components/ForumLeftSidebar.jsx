const MaterialIcon = ({ name, className = '', fill = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 20` }}
  >
    {name}
  </span>
);

const SidebarButton = ({ active = false, icon, label, onClick, fill = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] transition-all ${
      active
        ? 'border-r-[3px] border-[#1E6BB8] bg-white font-semibold text-[#1E6BB8]'
        : 'text-[#7C8B9A] hover:bg-slate-50'
    }`}
  >
    <MaterialIcon name={icon} className="text-[22px]" fill={fill || active} />
    <span>{label}</span>
  </button>
);

const ForumLeftSidebar = ({ activeKey = 'trend' }) => {
  return (
    <aside className="sidebar-scroll hidden h-[calc(100vh-48px)] w-[200px] flex-col overflow-y-auto border-r border-slate-200 bg-[#f8f9ff] py-4 font-['Be_Vietnam_Pro'] lg:sticky lg:top-12 lg:flex">
      <nav className="mb-6 flex flex-1 flex-col">
        <div className="mb-6">
          <p className="mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            DIỄN ĐÀN
          </p>
          <div className="space-y-1">
            <SidebarButton
              icon="home"
              label="Trang chủ"
              active={activeKey === 'home'}
              onClick={() => window.location.assign('/forum')}
            />
            <SidebarButton
              icon="category"
              label="Tin tức ngành"
              active={activeKey === 'news' || activeKey === 'category'}
              onClick={() => window.location.assign('/forum/news')}
            />
            <SidebarButton
              icon="forum"
              label="Thảo luận"
              active={activeKey === 'discussion'}
              onClick={() => window.location.assign('/forum/discussion')}
            />
            <SidebarButton
              icon="edit_note"
              label="Bài viết của tôi"
              active={activeKey === 'my-posts'}
              onClick={() => window.location.assign('/forum/my-posts')}
            />
            <SidebarButton
              icon="bookmark"
              label="Bài đã lưu"
              active={activeKey === 'saved'}
              onClick={() => window.location.assign('/forum/saved')}
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            XU HƯỚNG &amp; DỮ LIỆU
          </p>
          <div className="space-y-1">
            <SidebarButton
              icon="trending_up"
              label="Xu hướng kim khí"
              active={activeKey === 'trend'}
              fill
              onClick={() => window.location.assign('/forum/trends')}
            />
            <SidebarButton
              icon="bar_chart"
              label="Top sản phẩm bán chạy"
              active={activeKey === 'top'}
              onClick={() => window.location.assign('/forum/top-products')}
            />
            <SidebarButton
              icon="new_releases"
              label="Sản phẩm mới"
              active={activeKey === 'new'}
              onClick={() => window.location.assign('/forum/new-products')}
            />
            <SidebarButton
              icon="show_chart"
              label="Biến động giá"
              active={activeKey === 'price'}
              onClick={() => window.location.assign('/forum/price-trend')}
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            KẾT NỐI KINH DOANH
          </p>
          <div className="space-y-1">
            <SidebarButton
              icon="inventory_2"
              label="Nguồn hàng"
              active={activeKey === 'source' || activeKey === 'supply'}
              onClick={() => window.location.assign('/forum/source')}
            />
            <SidebarButton
              icon="sell"
              label="Đăng bán giá sỉ"
              active={activeKey === 'wholesale'}
              onClick={() => window.location.assign('/forum/wholesale')}
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            QUẢN LÝ
          </p>
          <div className="space-y-1">
            <SidebarButton
              icon="inventory"
              label="Gợi ý nhập hàng"
              active={activeKey === 'recommend'}
              onClick={() => window.location.assign('/forum/import-suggest')}
            />
          </div>
        </div>

        <div className="mt-auto border-t border-slate-100 px-2 pt-4">
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-1.5 text-[13px] text-[#7C8B9A] transition-all hover:text-[#1E6BB8]"
          >
            <MaterialIcon name="settings" className="text-[20px]" /> Cài đặt
          </button>
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-1.5 text-[13px] text-[#7C8B9A] transition-all hover:text-[#1E6BB8]"
          >
            <MaterialIcon name="help_outline" className="text-[20px]" /> Trợ giúp
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default ForumLeftSidebar;
