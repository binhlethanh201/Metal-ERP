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
    className={`flex w-full items-center gap-4 rounded-xl p-3 text-left text-[16px] font-medium transition-all ${
      active
        ? 'bg-blue-50 font-semibold text-blue-900 shadow-sm'
        : 'text-gray-700 hover:bg-gray-200/80'
    }`}
  >
    <MaterialIcon name={icon} className="text-[24px]" fill={fill || active} />
    <span>{label}</span>
  </button>
);

const ForumLeftSidebar = ({ activeKey = 'home' }) => {
  return (
    <nav className="flex flex-col space-y-6">
      <div>
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
          DIỄN ĐÀN
        </p>
        <div className="space-y-0.5">
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

      <div>
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
          XU HƯỚNG & DỮ LIỆU
        </p>
        <div className="space-y-0.5">
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

      <div>
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
          KẾT NỐI KINH DOANH
        </p>
        <div className="space-y-0.5">
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

      <div>
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
          QUẢN LÝ
        </p>
        <div className="space-y-0.5">
          <SidebarButton
            icon="inventory"
            label="Gợi ý nhập hàng"
            active={activeKey === 'recommend'}
            onClick={() => window.location.assign('/forum/import-suggest')}
          />
        </div>
      </div>
    </nav>
  );
};

export default ForumLeftSidebar;
