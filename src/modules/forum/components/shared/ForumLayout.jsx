/**
 * ForumLayout - Wrapper layout chuẩn 3 cột cho tất cả trang Diễn đàn.
 * Gồm: bg xám, Header sticky, Left Sidebar (300px), Main (max-w-720px), Right Sidebar (300px).
 * Tự động quản lý Modal đăng bài (CreatePostModal) - bấm nút Đăng bài trên Header là mở.
 * Props: activeKey (menu nào active), children (nội dung chính), rightSidebar (JSX), hideRightSidebar.
 */
import { useState } from 'react';
import ForumHeader from './ForumHeader';
import ForumLeftSidebar from './ForumLeftSidebar';
import CreatePostModal from './CreatePostModal';

const ForumLayout = ({ activeKey, children, rightSidebar = null, hideRightSidebar = false }) => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-900 antialiased">
      <ForumHeader onCreatePostClick={() => setIsCreatePostOpen(true)} />
      <div className="mx-auto flex max-w-[1400px] justify-center gap-4 px-4 py-4">
        <aside className="sticky top-[64px] hidden h-[calc(100vh-64px)] w-[300px] shrink-0 overflow-y-auto lg:block">
          <ForumLeftSidebar activeKey={activeKey} />
        </aside>
        <main className="w-full min-w-0 max-w-[720px]">{children}</main>
        {!hideRightSidebar && rightSidebar && (
          <aside className="sticky top-[64px] hidden h-[calc(100vh-64px)] w-[300px] shrink-0 space-y-4 overflow-y-auto xl:block">
            {rightSidebar}
          </aside>
        )}
      </div>
      <CreatePostModal isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />
    </div>
  );
};

export default ForumLayout;
