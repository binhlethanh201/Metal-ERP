import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForumHeader from '../components/ForumHeader';
import ForumLeftSidebar from '../components/ForumLeftSidebar';
import CreatePostModal from '../components/CreatePostModal';

const iconStyle = (fill = false) => ({
  fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 20`,
});

const MaterialIcon = ({ name, className = '', fill = false }) => (
  <span className={`material-symbols-outlined ${className}`} style={iconStyle(fill)}>
    {name}
  </span>
);

const tabs = ['Nổi bật', 'Mới nhất', 'Chưa trả lời', 'Được quan tâm'];

const posts = [
  {
    id: 1,
    author: 'Minh Nguyễn',
    role: 'Chuyên gia',
    roleClass: 'bg-blue-100 text-[#1E6BB8]',
    time: '2 giờ trước',
    status: 'Nổi bật',
    statusClass: 'bg-green-50 text-green-700',
    tab: 'Nổi bật',
    title: 'Có nên nhập thêm sơn chống thấm KOVA cho mùa mưa năm nay?',
    description:
      'Tôi đang cân nhắc việc tăng 30% lượng tồn kho cho dòng KOVA CT-11A Gold. Theo dự báo thời tiết thì mùa mưa năm nay kéo dài...',
    tags: ['#kim_khi', '#son_chong_tham'],
    comments: 24,
    views: '1.2k',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZWykIdoBcv3hsnrKrDb3I7RuCyGP1qMnHJzwNnpJqntdhAzj56h6-hgnP0JTtExf8a2WnsZH5IS-kdCNnP-XwjuWJrxhCGBnFSDLwFurTw2WyvXX7gUYnYAMIt-_G4km8LP68TP9n14ZRtnurgMrgJln-DtPJvZZ0bU-ocmMejXjNuVvnOcVouGnokgdNy4bHi5CDv_c8hIi3jbRioAowGvaIPhwEMr4vUE7Sy9gjTw15nDdRPttPFXdhN_f6NjszHkYucdmZAqCY',
  },
  {
    id: 2,
    author: 'Lan Anh',
    role: 'Nhà bán hàng',
    roleClass: 'bg-slate-100 text-slate-600',
    time: '5 giờ trước',
    status: 'Mới',
    statusClass: 'bg-orange-50 text-orange-700',
    tab: 'Mới nhất',
    title: 'Tìm đại lý keo dán gạch Weber khu vực miền Trung',
    description:
      'Cửa hàng mình đang cần tìm nguồn hàng Weber chính ngạch, chiết khấu tốt cho đơn hàng lớn. Ae nào đang làm đại lý hoặc có contact...',
    tags: ['#gia_si', '#keo_dan_gach'],
    comments: 8,
    views: '456',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCwn57sYKJ4x9dol__RYMVwM3H1yt7Kz-lnw17fAFH5wQ6czVBRC7JQDbA-GbZzZYuDtwUXBm9bCM8SdRkXP9x1s2g2Vm1KdH2t4fCgX0wFteum7_-swPIdrWnmdVeJuz1pcMos4g732-27Piwx59PbdTsYD-RLxrksdx6SWFVxPumNVqm-CLTcJTTKT7x1rntPejnh0mPaCATzRUmm2oaVhc80iuZHWgGTOu7YVpp1xP_jcAZEwi7JSKmqHQ6gqjbZq6fpmHv6BFdS',
  },
  {
    id: 3,
    author: 'Hoàng Nam',
    role: 'Thành viên',
    roleClass: 'bg-slate-100 text-slate-600',
    time: '8 giờ trước',
    tab: 'Được quan tâm',
    title: 'Chia sẻ kinh nghiệm quản lý kho hơn 1500 mã hàng vật tư',
    description:
      'Việc quản lý nhiều mã hàng nhỏ như ốc vít, long đền thường gây thất thoát. Tôi xin chia sẻ quy trình 5 bước áp dụng mã vạch...',
    tags: ['#quan_ly_kho', '#kinh_nghiem'],
    comments: 32,
    views: '2.1k',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAjYqYBGkR_Iadb7O3sIeQNtpWqJ9ThFzKm9BOnEoOjeAE90A3wKJFFf_2bunkuTYMCqxG-rZhI2sPranFao-yWEOh0ApqhjfAAZbuje4uAJVypcId7wA_hljomIOwQcSCCah1Fy-OvCW8q4Fu_GOKEK8rcUHnVgFEuCEYDJGKLI7qI0pVrjInnAhtDOJTjOxgm3_qIjxQV1OQT-PS9-tSwqZFR6TBj4W3czn_RYk-psKet5iM85xrN2qNW9iI1H_BG-KYPwDIYPCHf',
  },
  {
    id: 4,
    author: 'Văn Hùng',
    role: 'Cảnh báo',
    roleClass: 'bg-red-50 text-red-600',
    time: '12 giờ trước',
    tab: 'Được quan tâm',
    title: 'Cảnh báo lô hàng máy khoan giả Makita tràn lan thị trường',
    description:
      'Hiện nay khu vực miền Bắc đang xuất hiện nhiều lô hàng máy khoan pin giả tem mác Makita với giá chỉ bằng 1/3 hàng thật...',
    tags: ['#canh_bao', '#dung_cu_dien'],
    comments: 112,
    views: '5.4k',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZWykIdoBcv3hsnrKrDb3I7RuCyGP1qMnHJzwNnpJqntdhAzj56h6-hgnP0JTtExf8a2WnsZH5IS-kdCNnP-XwjuWJrxhCGBnFSDLwFurTw2WyvXX7gUYnYAMIt-_G4km8LP68TP9n14ZRtnurgMrgJln-DtPJvZZ0bU-ocmMejXjNuVvnOcVouGnokgdNy4bHi5CDv_c8hIi3jbRioAowGvaIPhwEMr4vUE7Sy9gjTw15nDdRPttPFXdhN_f6NjszHkYucdmZAqCY',
  },
  {
    id: 5,
    author: 'Thu Hương',
    role: 'Nhà bán hàng',
    roleClass: 'bg-slate-100 text-slate-600',
    time: '1 ngày trước',
    tab: 'Chưa trả lời',
    title: 'Cần tư vấn mở rộng cửa hàng sang mảng điện dân dụng',
    description:
      'Cửa hàng kim khí của gia đình tôi đang hoạt động ổn định, muốn nhập thêm dây điện, ổ cắm. Nên chọn thương hiệu nào ổn...',
    tags: ['#tu_van', '#thiet_bi_dien'],
    comments: 0,
    views: '890',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCwn57sYKJ4x9dol__RYMVwM3H1yt7Kz-lnw17fAFH5wQ6czVBRC7JQDbA-GbZzZYuDtwUXBm9bCM8SdRkXP9x1s2g2Vm1KdH2t4fCgX0wFteum7_-swPIdrWnmdVeJuz1pcMos4g732-27Piwx59PbdTsYD-RLxrksdx6SWFVxPumNVqm-CLTcJTTKT7x1rntPejnh0mPaCATzRUmm2oaVhc80iuZHWgGTOu7YVpp1xP_jcAZEwi7JSKmqHQ6gqjbZq6fpmHv6BFdS',
  },
];

const trendSearches = [
  { label: 'Sơn KOVA', value: '+35%', width: '85%' },
  { label: 'Weber Adhesive', value: '+22%', width: '65%' },
];

const topicTags = ['#kim_khi', '#nguon_hang', '#gia_si', '#keo_dan_gach'];

const hotPosts = [
  { title: 'Quản lý kho 1000 mã hàng hiệu quả', comments: '82 bình luận' },
  { title: 'Cảnh báo lô hàng vít thạch cao giả...', comments: '56 bình luận' },
];

const ForumHome = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Nổi bật');
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const filteredPosts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return posts.filter((post) => {
      const matchTab =
        activeTab === 'Nổi bật' || post.tab === activeTab || post.status === activeTab;
      const content = `${post.title} ${post.description} ${post.tags.join(' ')}`.toLowerCase();
      const matchSearch = !keyword || content.includes(keyword);
      return matchTab && matchSearch;
    });
  }, [activeTab, searchTerm]);

  const handleSearchByTag = (tag) => {
    setSearchTerm(tag);
    setActiveTab('Nổi bật');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] font-['Be_Vietnam_Pro','Inter',sans-serif] text-[#0b1c30]">
      <ForumHeader onCreatePostClick={() => setIsCreatePostModalOpen(true)} />

      <div className="relative mx-auto flex max-w-[1200px] gap-4">
        <ForumLeftSidebar activeKey="home" />

        <main className="mx-auto min-w-0 max-w-[760px] flex-1 px-2 py-4">
          <section className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-[#1E6BB8] to-[#005296] p-6 text-white shadow-lg shadow-primary/10">
            <div className="relative z-10 max-w-lg">
              <h1 className="mb-2 text-2xl font-bold leading-tight">
                Cộng đồng kinh doanh kim khí & vật tư xây dựng
              </h1>
              <p className="mb-4 text-sm text-blue-50 opacity-90">
                Trao đổi kinh nghiệm nhập hàng, theo dõi xu hướng thị trường và tối ưu lợi nhuận cho
                shop.
              </p>
              <div className="flex gap-3">
                <button className="rounded-full bg-white px-5 py-1.5 text-xs font-bold text-[#1E6BB8] transition-colors hover:bg-blue-50">
                  Khám phá ngay
                </button>
                <button className="rounded-full border border-white/40 bg-transparent px-5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/10">
                  Xem xu hướng
                </button>
              </div>
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-20">
              <img
                alt="Hardware Tools Decoration"
                className="h-full w-full object-cover contrast-125 grayscale"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4F_sZRm9hvMfaDDH-YmDdniOxqEpYI2PeGabsVMpXgpR-BMzuQXBdRw-nv2UEhx3ueWJ-vvWAhvHskbDNyNH_SssdWsz_9ZlIWkF4me8X3xJC_vxBMQp56QK-QArHLCj4wgXPGKzAmhYGVu557QJxavhBaOLHIGKctm2JlYZiqdsOYoPiBYwAL63GYuMT09Nxc6qPW9bV2TdHiOAOqZKRWOHeFOARgxU3yQdTv_zJdj5xlCHeguBfpg7ZL3FmOUQSepbct_LpCbM5"
              />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center overflow-x-auto border-b border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-4 py-2 text-xs ${
                    activeTab === tab
                      ? 'border-b-2 border-[#1E6BB8] font-bold text-[#1E6BB8]'
                      : 'font-medium text-slate-500 hover:text-[#0b1c30]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredPosts.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  Không tìm thấy bài viết phù hợp.
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => navigate(`/forum/post/${post.id}`)}
                    className="cursor-pointer rounded-xl border border-[#1E6BB8]/10 bg-white p-4 shadow-[0_2px_4px_rgba(0,82,150,0.04)] transition-all hover:border-[#1E6BB8]/30 hover:shadow-md"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <img
                          alt="Author Avatar"
                          className="h-5 w-5 rounded-full object-cover"
                          src={post.avatar}
                        />
                        <span className="text-[11px] font-bold text-[#0b1c30]">{post.author}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${post.roleClass}`}
                        >
                          {post.role}
                        </span>
                        <span className="text-[10px] text-slate-400">• {post.time}</span>
                      </div>
                      {post.status && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${post.statusClass}`}
                        >
                          {post.status}
                        </span>
                      )}
                    </div>
                    <h3 className="mb-1.5 cursor-pointer text-sm font-bold hover:text-[#1E6BB8]">
                      {post.title}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-600">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleSearchByTag(tag)}
                            className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 transition-colors hover:bg-blue-50 hover:text-[#1E6BB8]"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <span className="flex items-center gap-1 text-[10px]">
                          <MaterialIcon name="chat_bubble" className="text-[14px]" />{' '}
                          {post.comments}
                        </span>
                        <span className="flex items-center gap-1 text-[10px]">
                          <MaterialIcon name="visibility" className="text-[14px]" /> {post.views}
                        </span>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </main>

        <aside className="hidden w-64 space-y-4 py-4 xl:block">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
              Xu hướng tìm kiếm
            </h3>
            <div className="space-y-3">
              {trendSearches.map((trend) => (
                <div key={trend.label}>
                  <div className="mb-1 flex justify-between text-[10px]">
                    <span className="font-medium">{trend.label}</span>
                    <span className="font-bold text-green-600">{trend.value}</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-blue-500" style={{ width: trend.width }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <h3 className="mb-3 text-xs font-bold uppercase text-slate-500">Chủ đề quan tâm</h3>
            <div className="flex flex-wrap gap-1.5">
              {topicTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleSearchByTag(tag)}
                  className="rounded-full border border-slate-100 bg-[#F8FAFC] px-2 py-0.5 text-[9px] font-bold text-slate-600 transition-colors hover:bg-blue-50 hover:text-[#1E6BB8]"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <h3 className="mb-3 text-xs font-bold uppercase text-slate-500">Thảo luận nổi bật</h3>
            <div className="space-y-3">
              {hotPosts.map((post, index) => (
                <div key={post.title} className="group flex gap-2">
                  <span className="text-base font-black text-slate-200 transition-colors group-hover:text-blue-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="line-clamp-2 cursor-pointer text-[11px] font-bold group-hover:text-[#1E6BB8]">
                      {post.title}
                    </h4>
                    <div className="mt-0.5 flex gap-2 text-[9px] text-slate-400">
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-green-100 bg-green-50 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-green-700">
              <MaterialIcon name="gpp_maybe" className="text-lg" /> Quy định chung
            </div>
            <ul className="space-y-1.5 text-[10px] text-green-800/80">
              {[
                'Không spam, quảng cáo rác.',
                'Không tin giả thị trường.',
                'Không hàng lậu, hàng giả.',
              ].map((rule) => (
                <li key={rule} className="flex items-start gap-1.5">
                  <MaterialIcon name="check_circle" className="mt-0.5 text-[12px]" /> {rule}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Modal đăng bài */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
    </div>
  );
};

export { ForumHome };
export default ForumHome;
