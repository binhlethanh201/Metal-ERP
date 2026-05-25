/**
 * ForumNews Page - Trang Tin tức ngành
 * Hiển thị feed tin tức ngành với filters, AI summary, và widgets liên quan
 */

import { useState } from 'react';
import ForumHeader from '../components/ForumHeader';
import ForumLeftSidebar from '../components/ForumLeftSidebar';
import { NewsCard } from '../components/NewsCard';
import CreatePostModal from '../components/CreatePostModal';
import { mockIndustryNews, mockHotProductNews, mockForumDiscussions } from '../data/forumMockData';

const MaterialIcon = ({ name, className = '', fill = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 20` }}
  >
    {name}
  </span>
);

const filterOptions = [
  { id: 'newest', label: 'Mới nhất' },
  { id: 'important', label: 'Quan trọng' },
  { id: 'trending', label: 'Được quan tâm' },
];

const ForumNews = () => {
  const [news] = useState(mockIndustryNews);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-900 antialiased">
      <ForumHeader onCreatePostClick={() => setIsCreatePostModalOpen(true)} />

      <div className="mx-auto flex max-w-[1400px] justify-center gap-4 px-4 py-4">
        {/* Left Sidebar */}
        <aside className="sticky top-[64px] hidden h-[calc(100vh-64px)] w-[300px] shrink-0 overflow-y-auto lg:block">
          <ForumLeftSidebar activeKey="news" />
        </aside>

        {/* Main Feed */}
        <main className="w-full min-w-0 max-w-[720px]">
          {/* Page Header */}
          <header className="mb-4">
            <h2 className="mb-1 text-xl font-bold text-gray-900">Tin tức ngành</h2>
            <p className="text-[15px] leading-relaxed text-gray-600">
              Cập nhật thông tin mới nhất ảnh hưởng đến hoạt động kinh doanh của cửa hàng
            </p>
          </header>

          {/* Filters & Tabs */}
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-sm">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {}}
                className="rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-gray-100 hover:text-[#004785]"
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* News Feed */}
          <div className="space-y-4">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="sticky top-[64px] hidden h-[calc(100vh-64px)] w-[300px] shrink-0 space-y-4 overflow-y-auto xl:block">
          {/* Hot Product News Widget */}
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
              <MaterialIcon name="local_fire_department" className="text-orange-500" />
              Tin liên quan sản phẩm hot
            </h4>
            <div className="space-y-4">
              {mockHotProductNews.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <p className="mb-1 text-xs text-slate-400">{item.brand}</p>
                  <h5 className="text-sm font-bold text-slate-700 transition-colors group-hover:text-[#004785]">
                    {item.title}
                  </h5>
                </div>
              ))}
            </div>
          </section>

          {/* Forum Discussion Widget */}
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
              <MaterialIcon name="forum" className="text-violet-500" />
              Thảo luận diễn đàn
            </h4>
            <div className="space-y-3">
              {mockForumDiscussions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="block w-full rounded-xl p-3 text-left transition-colors hover:bg-gray-50"
                >
                  <p className="mb-1 text-sm font-semibold text-slate-700">{item.title}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{item.comments} bình luận</span>
                    <span>{item.views} lượt xem</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
    </div>
  );
};

export default ForumNews;
