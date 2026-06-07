/**
 * src/modules/forum/components/shared/ForumLeftSidebar.jsx
 * Menu điều hướng trái Diễn đàn - Đã xử lý triệt để lỗi khoảng trắng đè lên nút Kho hàng.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';

const SidebarButton = ({ active = false, icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-4 rounded-xl p-3 text-left transition-all duration-150 ${
      active
        ? 'bg-blue-50 font-bold text-blue-900 shadow-sm'
        : 'font-medium text-slate-600 hover:bg-slate-200/70'
    }`}
  >
    <Icon name={icon} className={active ? 'text-blue-900' : 'text-slate-500'} size={20} />
    <span className="text-[14px]">{label}</span>
  </button>
);

const ForumLeftSidebar = ({ activeKey = 'home', onTriggerSwitch }) => {
  const navigate = useNavigate();

  // Xử lý hiệu ứng chuyển vùng đồng bộ đồng điệu
  const handleSwitchToWarehouse = () => {
    onTriggerSwitch?.();
    setTimeout(() => {
      navigate('/inventory/dashboard');
    }, 1800);
  };

  return (
    <nav className="flex h-full flex-col justify-between">
      {/* VÙNG CHỨA MENU ĐIỀU HƯỚNG CÓ CUỘN ĐỘC LẬP */}
      <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto pb-4 pr-1">
        {/* DIỄN ĐÀN */}
        <div>
          <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            DIỄN ĐÀN
          </p>
          <div className="space-y-0.5">
            <SidebarButton
              icon="home"
              label="Trang chủ"
              active={activeKey === 'home'}
              onClick={() => navigate('/forum')}
            />
            <SidebarButton
              icon="campaign"
              label="Tin tức ngành"
              active={activeKey === 'news'}
              onClick={() => navigate('/forum/news')}
            />
            <SidebarButton
              icon="forum"
              label="Thảo luận"
              active={activeKey === 'discussion'}
              onClick={() => navigate('/forum/discussion')}
            />
            <SidebarButton
              icon="request_quote"
              label="Bài viết của tôi"
              active={activeKey === 'my-posts'}
              onClick={() => navigate('/forum/my-posts')}
            />
            <SidebarButton
              icon="bookmark"
              label="Bài đã lưu"
              active={activeKey === 'saved'}
              onClick={() => navigate('/forum/saved')}
            />
          </div>
        </div>

        {/* XU HƯỚNG & DỮ LIỆU */}
        <div>
          <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            XU HƯỚNG & DỮ LIỆU
          </p>
          <div className="space-y-0.5">
            <SidebarButton
              icon="bolt"
              label="Xu hướng kim khí"
              active={activeKey === 'trend'}
              onClick={() => navigate('/forum/trends')}
            />
            <SidebarButton
              icon="assessment"
              label="Top sản phẩm tăng trưởng"
              active={activeKey === 'top'}
              onClick={() => navigate('/forum/top-products')}
            />
            <SidebarButton
              icon="trending_up"
              label="Sản phẩm xu hướng"
              active={activeKey === 'new'}
              onClick={() => navigate('/forum/new-products')}
            />
          </div>
        </div>

        {/* KẾT NỐI KINH DOANH */}
        <div>
          <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            KẾT NỐI KINH DOANH
          </p>
          <div className="space-y-0.5">
            <SidebarButton
              icon="inventory_2"
              label="Nguồn hàng"
              active={activeKey === 'source'}
              onClick={() => navigate('/forum/source')}
            />
          </div>
        </div>

        {/* QUẢN LÝ */}
        <div>
          <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            QUẢN LÝ
          </p>
          <div className="space-y-0.5">
            <SidebarButton
              icon="inventory"
              label="Gợi ý nhập hàng"
              active={activeKey === 'recommend'}
              onClick={() => navigate('/forum/import-suggest')}
            />
          </div>
        </div>
      </div>

      {/* 🌟 NÚT KHO HÀNG ĐƯỢC NEO TRỰC TIẾP KHÔNG QUA LỚP ĐỆM BG-WHITE GÂY LỖI KHOẢNG TRỐNG */}
      <button
        type="button"
        onClick={handleSwitchToWarehouse}
        className="mt-auto flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#004785] py-3 text-sm font-bold text-white shadow-md shadow-primary/10 transition-all hover:bg-black active:scale-95"
      >
        <Icon name="inventory" className="text-sm" />
        <span>Kho hàng</span>
      </button>
    </nav>
  );
};

export default ForumLeftSidebar;
