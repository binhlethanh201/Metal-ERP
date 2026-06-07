/**
 * src/modules/forum/layouts/ForumLayout.jsx
 * Layout 3 cột Fluid nâng cấp - Đã giản lược màn hình loading chuyển vùng, chỉ giữ lại hiệu ứng xoay thuần túy.
 */
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ChatProvider } from '../contexts/ChatContext';
import ForumHeader from '../components/shared/ForumHeader';
import ForumLeftSidebar from '../components/shared/ForumLeftSidebar';
import CreatePostModal from '../components/shared/CreatePostModal';
import ForumGuidelines from '../components/shared/ForumGuidelines';
import Icon from '../../../shared/components/Icon';

const ForumLayout = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [rightSidebar, setRightSidebar] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false); // Trạng thái loading chuyển vùng
  const location = useLocation();

  const getActiveKey = () => {
    const path = location.pathname;
    if (path === '/forum' || path === '/forum/') return 'home';
    if (path.includes('/news')) return 'news';
    if (path.includes('/discussion')) return 'discussion';
    if (path.includes('/trends')) return 'trend';
    if (path.includes('/source')) return 'source';
    if (path.includes('/my-posts')) return 'my-posts';
    if (path.includes('/saved')) return 'saved';
    if (path.includes('/top-products')) return 'top';
    if (path.includes('/new-products')) return 'new';
    if (path.includes('/import-suggest')) return 'recommend';
    return 'home';
  };

  return (
    <ChatProvider>
      <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-900 antialiased">
        {/* 🌟 MÀN HÌNH LOADING TRƠN KHÔNG CHỮ: Đè bẹp hoàn toàn Header và Sidebar */}
        {isSwitching && (
          <div className="animate-fadeIn fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            {/* Vòng xoay spinner tối giản bao bọc icon nhà máy */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl">
              <div className="absolute h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-[#004785]" />
              <Icon name="factory" className="animate-pulse text-[#004785]" size={18} />
            </div>
          </div>
        )}

        {/* Header hệ thống */}
        <ForumHeader onCreatePostClick={() => setIsCreatePostOpen(true)} />

        {/* Khung Giao diện chính 3 cột Fluid */}
        <div className="mx-auto flex max-w-[1650px] justify-start gap-6 px-6 py-5">
          {/* CỘT TRÁI */}
          <aside className="sticky top-[84px] hidden h-[calc(100vh-104px)] w-[260px] shrink-0 overflow-y-auto pr-1 lg:block">
            <ForumLeftSidebar
              activeKey={getActiveKey()}
              onTriggerSwitch={() => setIsSwitching(true)}
            />
          </aside>

          {/* CỘT GIỮA */}
          <main className="min-w-0 max-w-[820px] flex-1 space-y-4">
            <Outlet context={{ setRightSidebar }} />
          </main>

          {/* CỘT PHẢI */}
          <aside className="sticky top-[84px] hidden h-[calc(100vh-104px)] w-[320px] shrink-0 space-y-4 overflow-y-auto xl:block">
            {rightSidebar || <ForumGuidelines />}
          </aside>
        </div>

        <CreatePostModal isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />
      </div>
    </ChatProvider>
  );
};

export default ForumLayout;
