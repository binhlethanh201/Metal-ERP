/**
 * src/modules/forum/pages/ForumSupply.jsx
 * Trang Nguồn hàng - Đã bóc tách lỗi trùng lặp Layout, tinh chỉnh bộ lọc
 * và đồng bộ cấu trúc font chữ, khoảng cách theo chuẩn hệ thống.
 */
import { useMemo, useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ForumSupplyRightSidebar from '../components/supply/ForumSupplyRightSidebar';
import SupplyPostCard from '../components/supply/SupplyPostCard';
import Pagination from '../components/shared/Pagination';
import Icon from '../../../shared/components/Icon';
import {
  supplyTabs as tabs,
  supplyCategoryOptions as categoryOptions,
  supplyRegionOptions as regionOptions,
  supplySourcePosts as sourcePosts,
  supplyNewSourcePosts as newSourcePosts,
  supplyFeaturedSale as featuredSale,
} from '../data/forumPageData';

const ForumSupply = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [category, setCategory] = useState(categoryOptions[0]);
  const [region, setRegion] = useState(regionOptions[0]);

  const { setRightSidebar } = useOutletContext();

  // Đẩy Right Sidebar lên Layout mẹ khi component mounted
  useEffect(() => {
    if (setRightSidebar) {
      setRightSidebar(
        <ForumSupplyRightSidebar newSourcePosts={newSourcePosts} featuredSale={featuredSale} />
      );
    }
    return () => setRightSidebar?.(null);
  }, [setRightSidebar]);

  const visiblePosts = useMemo(() => {
    if (activeTab === 'all') return sourcePosts;
    return sourcePosts.filter((post) => {
      if (activeTab === 'source') return post.type === 'Bán sỉ';
      if (activeTab === 'liquidation') return post.id === 2;
      return true;
    });
  }, [activeTab]);

  return (
    <div className="space-y-4">
      {/* HEADER ĐỒNG BỘ CỠ CHỮ & FONT CHỮ CHUẨN PHÂN HỆ */}
      <header className="px-1">
        <h2 className="mb-2 text-xl font-bold leading-tight text-gray-900">Nguồn hàng kim khí</h2>
        <p className="text-sm text-slate-500 opacity-90">
          Kết nối nhà phân phối, đại lý và xưởng sản xuất thiết bị kim khí, dụng cụ cầm tay trên
          toàn quốc.
        </p>
      </header>

      {/* KHỐI BỘ LỌC NÂNG CẤP CHUẨN MỰC */}
      <section className="space-y-3 rounded-2xl border border-slate-100/60 bg-white p-2 shadow-sm">
        {/* Tab Phân hệ ngang Segmented */}
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 whitespace-nowrap rounded-lg py-2 text-center text-xs font-bold transition-all ${
                  active
                    ? 'bg-white text-[#004785] shadow-sm ring-1 ring-black/5'
                    : 'text-slate-500 hover:bg-white/40 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Khối Lọc Điều kiện Dọc */}
        <div className="grid grid-cols-1 gap-3 pt-1 md:grid-cols-2">
          {/* Lọc danh mục */}
          <div className="flex flex-col gap-1.5">
            <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Danh mục
            </label>
            <div className="relative">
              <Icon
                name="category"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-[#004785] focus:bg-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categoryOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <Icon
                name="chevron_down"
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
            </div>
          </div>

          {/* Lọc khu vực */}
          <div className="flex flex-col gap-1.5">
            <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Khu vực
            </label>
            <div className="relative">
              <Icon
                name="location_on"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-[#004785] focus:bg-white"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {regionOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <Icon
                name="chevron_down"
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Luồng danh sách nguồn hàng */}
      <div className="space-y-4">
        {visiblePosts.map((post) => (
          <SupplyPostCard key={post.id} post={post} />
        ))}
      </div>

      <div className="pt-2">
        <Pagination />
      </div>
    </div>
  );
};

export default ForumSupply;
