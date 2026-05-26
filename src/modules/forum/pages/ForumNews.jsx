/**
 * Trang Tin tức ngành - Feed tin tức với bộ lọc.
 * Dùng NewsCard component.
 */
import { useState } from 'react';
import ForumLayout from '../components/shared/ForumLayout';
import ForumNewsRightSidebar from '../components/news/ForumNewsRightSidebar';
import { NewsCard } from '../components/shared/NewsCard';
import { mockIndustryNews, mockHotProductNews, mockForumDiscussions } from '../data/forumMockData';

const filterOptions = [
  { id: 'newest', label: 'Mới nhất' },
  { id: 'important', label: 'Quan trọng' },
  { id: 'trending', label: 'Được quan tâm' },
];

const ForumNews = () => {
  const [news] = useState(mockIndustryNews);

  return (
    <ForumLayout
      activeKey="news"
      rightSidebar={
        <ForumNewsRightSidebar
          hotProductNews={mockHotProductNews}
          forumDiscussions={mockForumDiscussions}
        />
      }
    >
      <header className="mb-4">
        <h2 className="mb-1 text-xl font-bold text-gray-900">Tin tức ngành</h2>
        <p className="text-[15px] leading-relaxed text-gray-600">
          Cập nhật thông tin mới nhất ảnh hưởng đến hoạt động kinh doanh của cửa hàng
        </p>
      </header>

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

      <div className="space-y-4">
        {news.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
    </ForumLayout>
  );
};

export default ForumNews;
