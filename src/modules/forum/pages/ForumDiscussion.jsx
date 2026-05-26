/**
 * src/modules/forum/pages/ForumDiscussion.jsx
 * Trang Thảo luận - Đã bóc tách lỗi trùng lặp Layout, đồng bộ font chữ, khoảng cách
 */
import { useMemo, useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ForumDiscussionRightSidebar from '../components/discussion/ForumDiscussionRightSidebar';
import ThreadListItem from '../components/discussion/ThreadListItem';
import Pagination from '../components/shared/Pagination';
import {
  discussionTabs as tabItems,
  discussionThreads as threads,
  discussionHotTopics as hotTopics,
} from '../data/forumPageData';

const ForumDiscussion = () => {
  const [activeTab, setActiveTab] = useState('Mới nhất');

  // Hứng hàm cập nhật sidebar từ rễ ForumLayout.jsx
  const { setRightSidebar } = useOutletContext();

  // Bắn cụm Right Sidebar lên Layout mẹ khi truy cập trang
  useEffect(() => {
    if (setRightSidebar) {
      setRightSidebar(<ForumDiscussionRightSidebar hotTopics={hotTopics} />);
    }
    return () => setRightSidebar?.(null);
  }, [setRightSidebar]);

  const visibleThreads = useMemo(() => {
    if (activeTab === 'Nổi bật') return threads.filter((thread) => thread.trending);
    return threads;
  }, [activeTab]);

  return (
    <div className="space-y-4">
      {/* HEADER ĐÃ ĐỒNG BỘ CỠ CHỮ, FONT CHỮ VÀ KHOẢNG CÁCH CHUẨN FORUMHOME */}
      <header className="px-1">
        <h2 className="mb-2 text-xl font-bold leading-tight text-gray-900">Thảo luận cộng đồng</h2>
        <p className="text-sm text-slate-500 opacity-90">
          Trao đổi kinh nghiệm, giải đáp thắc mắc về kỹ thuật, thị trường và quản lý trong ngành kim
          khí.
        </p>
      </header>

      {/*  BỘ LỌC DẠNG HỘP BOX PILLS SEGMENTED ĐỒNG BỘ 100% TRANG TIN TỨC */}
      <section className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100/80 p-1">
          {tabItems.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg py-2.5 text-center text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'scale-[1.01] bg-white text-[#004785] shadow-sm ring-1 ring-black/5'
                    : 'text-slate-500 hover:bg-white/40 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </section>

      {/* Danh sách các luồng thảo luận */}
      <div className="space-y-4">
        {visibleThreads.map((thread) => (
          <ThreadListItem key={thread.id} thread={thread} />
        ))}
      </div>

      {/* Phân trang */}
      <div className="pt-2">
        <Pagination />
      </div>
    </div>
  );
};

export default ForumDiscussion;
