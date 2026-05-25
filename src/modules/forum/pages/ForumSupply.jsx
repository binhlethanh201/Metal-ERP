/**
 * Trang Nguồn hàng - Kết nối nhà phân phối, đại lý, xưởng sản xuất.
 * Tabs: Tất cả/Tìm nguồn/Thanh lý/Mua chung/Bán sỉ. Dùng SupplyPostCard.
 */
import { useMemo, useState } from 'react';
import ForumLayout from '../components/shared/ForumLayout';
import ForumSupplyRightSidebar from '../components/supply/ForumSupplyRightSidebar';
import MaterialIconBase from '../components/shared/MaterialIcon';
import SupplyPostCard from '../components/supply/SupplyPostCard';
import Pagination from '../components/shared/Pagination';
import {
  supplyTabs as tabs,
  supplyCategoryOptions as categoryOptions,
  supplyRegionOptions as regionOptions,
  supplySourcePosts as sourcePosts,
  supplyNewSourcePosts as newSourcePosts,
  supplyFeaturedSale as featuredSale,
} from '../data/forumPageData';

const MaterialIcon = (props) => <MaterialIconBase opsz={24} {...props} />;

const ForumSupply = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [category, setCategory] = useState(categoryOptions[0]);
  const [region, setRegion] = useState(regionOptions[0]);

  const visiblePosts = useMemo(() => {
    if (activeTab === 'all') return sourcePosts;
    return sourcePosts.filter((post) => {
      if (activeTab === 'source') return post.type === 'Bán sỉ';
      if (activeTab === 'liquidation') return post.id === 2;
      return true;
    });
  }, [activeTab]);

  return (
    <>
      <ForumLayout
        activeKey="source"
        rightSidebar={
          <ForumSupplyRightSidebar newSourcePosts={newSourcePosts} featuredSale={featuredSale} />
        }
      >
        <section className="mb-4">
          <h1 className="mb-1 text-xl font-bold leading-tight text-gray-900">Nguồn hàng kim khí</h1>
          <p className="text-[15px] leading-relaxed text-gray-600">
            Kết nối nhà phân phối, đại lý và xưởng sản xuất thiết bị kim khí, dụng cụ cầm tay,
            bulong ốc vít và phụ kiện cơ khí trên toàn quốc.
          </p>
        </section>

        <section className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 p-3">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#004785] text-white shadow-md shadow-[#004785]/20'
                      : 'text-slate-600 hover:bg-gray-100 hover:text-[#004785]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            <div className="relative flex flex-col gap-1.5">
              <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                Danh mục
              </label>
              <div className="relative">
                <MaterialIcon
                  name="category"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400"
                />
                <select
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-8 text-sm text-slate-700 outline-none transition-all focus:border-[#004785] focus:ring-2 focus:ring-[#004785]/10"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categoryOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <MaterialIcon
                  name="expand_more"
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
            <div className="relative flex flex-col gap-1.5">
              <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                Khu vực
              </label>
              <div className="relative">
                <MaterialIcon
                  name="location_on"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400"
                />
                <select
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-8 text-sm text-slate-700 outline-none transition-all focus:border-[#004785] focus:ring-2 focus:ring-[#004785]/10"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  {regionOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <MaterialIcon
                  name="expand_more"
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          {visiblePosts.map((post) => (
            <SupplyPostCard key={post.id} post={post} />
          ))}
        </div>
        <Pagination />
      </ForumLayout>

      <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-slate-100 bg-white px-4 md:hidden">
        <a className="flex flex-col items-center gap-1 text-[#004785]" href="/forum">
          <MaterialIcon name="home" fill />
          <span className="text-[10px] font-bold">Trang chủ</span>
        </a>
        <button type="button" className="flex flex-col items-center gap-1 text-slate-400">
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
        <a className="flex flex-col items-center gap-1 text-slate-400" href="/forum/source">
          <MaterialIcon name="inventory" />
          <span className="text-[10px] font-medium">Nguồn hàng</span>
        </a>
        <button type="button" className="flex flex-col items-center gap-1 text-slate-400">
          <MaterialIcon name="person" />
          <span className="text-[10px] font-medium">Cá nhân</span>
        </button>
      </nav>
    </>
  );
};

export default ForumSupply;
