/**
 * ForumNews Page - Trang Tin tức ngành
 * Hiển thị feed tin tức ngành với filters, AI summary, và widgets liên quan
 */

import { useState } from 'react';
import ForumHeader from '../components/ForumHeader';
import ForumLeftSidebar from '../components/ForumLeftSidebar';
import { NewsCard } from '../components/NewsCard';
import CreatePostModal from '../components/CreatePostModal';
import {
  mockIndustryNews,
  mockAISummary,
  mockHotProductNews,
  mockForumDiscussions,
} from '../data/forumMockData';

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
    <div className="min-h-screen bg-background font-sans text-on-surface antialiased">
      <ForumHeader onCreatePostClick={() => setIsCreatePostModalOpen(true)} />

      <div className="relative mx-auto flex max-w-[1200px] gap-4">
        <ForumLeftSidebar activeKey="news" />

        <main className="min-w-0 flex-1 bg-surface py-4">
          <div className="grid gap-8 p-6 lg:grid-cols-12 lg:p-10">
            {/* Center Column: News Feed */}
            <div className="space-y-8 lg:col-span-8">
              {/* Page Header */}
              <header>
                <h2 className="mb-2 font-headline text-3xl font-extrabold tracking-tight text-on-surface">
                  Tin tức ngành
                </h2>
                <p className="text-lg text-on-surface-variant">
                  Cập nhật thông tin mới nhất ảnh hưởng đến hoạt động kinh doanh của cửa hàng
                </p>
              </header>

              {/* Filters & Tabs */}
              <div className="mb-8">
                <div className="flex w-fit flex-col items-center justify-between gap-4 rounded-full bg-surface-container-low p-1.5 md:flex-row">
                  <div className="flex items-center gap-1">
                    {filterOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {}}
                        className={`rounded-full px-6 py-2 text-sm font-semibold text-on-surface-variant transition-all hover:bg-surface-variant/50`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div className="hidden h-6 w-px bg-outline-variant/30 md:mx-2 md:block" />
                  <button className="flex items-center gap-2 rounded-full border border-primary/20 bg-white px-6 py-2 text-sm font-bold text-primary shadow-sm transition-all hover:bg-primary/5">
                    <MaterialIcon name="auto_awesome" className="text-sm" fill />
                    Phân tích AI
                  </button>
                </div>
              </div>

              {/* News Feed */}
              <div className="space-y-6">
                {news.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            </div>

            {/* Right Sidebar Column */}
            <div className="space-y-6 lg:col-span-4">
              {/* AI Summary Widget */}
              <section className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="auto_awesome" className="text-primary" fill />
                  <h4 className="font-bold tracking-tight text-primary">AI Tóm tắt nhanh</h4>
                </div>
                <ul className="space-y-3">
                  {mockAISummary.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-sm leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="text-on-surface">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Hot Product News Widget */}
              <section className="space-y-4 rounded-2xl border border-slate-100 bg-surface-container-lowest p-6">
                <h4 className="flex items-center gap-2 font-bold text-on-surface">
                  <MaterialIcon name="local_fire_department" className="text-secondary" />
                  Tin liên quan sản phẩm hot
                </h4>
                <div className="space-y-4">
                  {mockHotProductNews.map((item) => (
                    <div key={item.id} className="group cursor-pointer">
                      <p className="mb-1 text-xs text-on-surface-variant">{item.brand}</p>
                      <h5 className="text-sm font-bold transition-colors group-hover:text-primary">
                        {item.title}
                      </h5>
                    </div>
                  ))}
                </div>
              </section>

              {/* Forum Discussion Widget */}
              <section className="space-y-4 rounded-2xl border border-slate-100 bg-surface-container-lowest p-6">
                <h4 className="flex items-center gap-2 font-bold text-on-surface">
                  <MaterialIcon name="forum" className="text-tertiary" />
                  Thảo luận diễn đàn
                </h4>
                <div className="space-y-4">
                  {mockForumDiscussions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="block w-full rounded-xl border border-transparent p-3 text-left transition-colors hover:border-outline-variant/20 hover:bg-surface-container-high"
                    >
                      <p className="mb-1 text-sm font-semibold">{item.title}</p>
                      <div className="flex items-center gap-3 text-[10px] text-on-surface-variant">
                        <span>{item.comments} bình luận</span>
                        <span>{item.views} lượt xem</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Newsletter Widget */}
              <section className="space-y-4 rounded-2xl bg-secondary/10 p-6 text-center">
                <h4 className="font-bold text-on-secondary-container">
                  Đăng ký nhận bản tin ngành
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Nhận tóm tắt tin tức quan trọng vào 8:00 sáng mỗi ngày qua Zalo/Email
                </p>
                <button className="w-full rounded-lg bg-on-secondary-container py-2 text-sm font-bold text-white transition-colors hover:bg-secondary">
                  Đăng ký ngay
                </button>
              </section>
            </div>
          </div>
        </main>
      </div>

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
    </div>
  );
};

export default ForumNews;
