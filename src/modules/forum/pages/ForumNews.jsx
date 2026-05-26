/**
 * src/modules/forum/pages/ForumNews.jsx
 * Trang Tin tức ngành - Đã đồng bộ hoàn toàn cỡ chữ, font chữ và khoảng cách theo chuẩn ForumHome.
 */
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
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
  const [activeFilter, setActiveFilter] = useState('newest');

  const { setRightSidebar } = useOutletContext();

  useEffect(() => {
    if (setRightSidebar) {
      setRightSidebar(
        <ForumNewsRightSidebar
          hotProductNews={mockHotProductNews}
          forumDiscussions={mockForumDiscussions}
        />
      );
    }
    return () => setRightSidebar?.(null);
  }, [setRightSidebar]);

  return (
    <div className="space-y-4">
      {/* HEADER ĐÃ ĐỒNG BỘ CỠ CHỮ, FONT CHỮ VÀ MÀU SẮC THEO CHUẨN FORUMHOME */}
      <header className="px-1">
        <h2 className="mb-2 text-xl font-bold leading-tight text-gray-900">Tin tức ngành</h2>
        <p className="text-sm text-slate-500 opacity-90">
          Cập nhật thông tin mới nhất ảnh hưởng đến hoạt động kinh doanh của cửa hàng.
        </p>
      </header>

      {/* Bộ lọc dạng Hộp Box Pills Segmented trẻ trung */}
      <section className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100/80 p-1">
          {filterOptions.map((option) => {
            const isActive = activeFilter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveFilter(option.id)}
                className={`rounded-lg py-2.5 text-center text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'scale-[1.01] bg-white text-[#004785] shadow-sm ring-1 ring-black/5'
                    : 'text-slate-500 hover:bg-white/40 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Danh sách các card tin tức */}
      <div className="space-y-4">
        {news.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
    </div>
  );
};

export default ForumNews;
