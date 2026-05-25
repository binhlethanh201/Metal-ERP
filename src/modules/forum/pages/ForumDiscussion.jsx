/**
 * Trang Thảo luận - Danh sách chủ đề trao đổi kỹ thuật, thị trường, quản lý.
 * Dùng ThreadListItem + tabs Mới nhất/Nổi bật.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForumLayout from '../components/shared/ForumLayout';
import ForumDiscussionRightSidebar from '../components/discussion/ForumDiscussionRightSidebar';
import MaterialIconBase from '../components/shared/MaterialIcon';
import ThreadListItem from '../components/discussion/ThreadListItem';
import Pagination from '../components/shared/Pagination';
import {
  discussionTabs as tabItems,
  discussionThreads as threads,
  discussionHotTopics as hotTopics,
} from '../data/forumPageData';

const MaterialIcon = (props) => <MaterialIconBase opsz={24} {...props} />;

const ForumDiscussion = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Mới nhất');

  const visibleThreads = useMemo(() => {
    if (activeTab === 'Nổi bật') return threads.filter((thread) => thread.trending);
    return threads;
  }, [activeTab]);

  return (
    <>
      <ForumLayout
        activeKey="discussion"
        rightSidebar={<ForumDiscussionRightSidebar hotTopics={hotTopics} />}
      >
        {/* Page Header */}
        <section className="mb-4">
          <nav className="mb-3 flex items-center gap-1 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => navigate('/forum')}
              className="transition-colors hover:text-[#004785]"
            >
              Diễn đàn
            </button>
            <MaterialIcon name="chevron_right" className="text-[12px]" />
            <span className="font-medium text-[#004785]">Thảo luận</span>
          </nav>
          <h1 className="mb-2 text-xl font-bold leading-tight text-gray-900">Thảo luận mới nhất</h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-gray-600">
            Trao đổi kinh nghiệm, giải đáp thắc mắc về kỹ thuật, thị trường và quản lý trong ngành
            kim khí.
          </p>
        </section>

        {/* Tabs */}
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-sm">
          {tabItems.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#004785] font-bold text-white shadow-md shadow-[#004785]/20'
                    : 'text-slate-600 hover:bg-gray-100 hover:text-[#004785]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Thread List */}
        <div className="space-y-4">
          {visibleThreads.map((thread) => (
            <ThreadListItem key={thread.id} thread={thread} />
          ))}
        </div>

        <Pagination />
      </ForumLayout>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-slate-100 bg-white px-4 md:hidden">
        <button
          type="button"
          onClick={() => navigate('/forum')}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <MaterialIcon name="home" />
          <span className="text-[10px] font-medium">Trang chủ</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/forum/news')}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <MaterialIcon name="category" />
          <span className="text-[10px] font-medium">Danh mục</span>
        </button>
        <div className="relative -top-5">
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#004785] text-white shadow-xl transition-all active:scale-90"
          >
            <MaterialIcon name="add" className="text-2xl" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => navigate('/forum/discussion')}
          className="flex flex-col items-center gap-1 text-[#004785]"
        >
          <MaterialIcon name="forum" fill />
          <span className="text-[10px] font-bold">Thảo luận</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1 text-slate-400">
          <MaterialIcon name="person" />
          <span className="text-[10px] font-medium">Cá nhân</span>
        </button>
      </nav>
    </>
  );
};

export default ForumDiscussion;
