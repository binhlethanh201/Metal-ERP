import { useMemo, useState } from 'react';
import ForumHeader from '../components/ForumHeader';
import ForumLeftSidebar from '../components/ForumLeftSidebar';
import CreatePostModal from '../components/CreatePostModal';

const MaterialIcon = ({ name, className = '', fill = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
  >
    {name}
  </span>
);

const tabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'source', label: 'Tìm nguồn hàng' },
  { id: 'liquidation', label: 'Thanh lý kho' },
  { id: 'group-buy', label: 'Mua chung' },
  { id: 'wholesale', label: 'Bán giá sỉ' },
];

const categoryOptions = ['Tất cả Kim khí', 'Bulong - Ốc vít', 'Dụng cụ cầm tay'];
const regionOptions = ['Toàn quốc', 'Hà Nội', 'TP. Hồ Chí Minh'];

const sourcePosts = [
  {
    id: 1,
    type: 'Bán sỉ',
    typeTone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    author: 'Công ty Kim Khí Hòa Phát',
    role: 'Nhà bán hàng',
    verified: true,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuARQdi4aUjEhq51ggqlTnuIcc0VpZNbVIyHq4o-nUM6ns5h_jkW35Ra6TTnsOx3cehJ3sFf30Lp9e4PaJnKStpqcBTntpjUcjwVxXEoI6Vz0On3t1TGWljo1rJiq5cYi0UZ6oIakFojxDUFOJtMOTeSXTJXpmBo3by3LDxJRP0E6-wjhBjR9v9YY7_piKxZSNoFajlnkWeMP_VWpDxElb6Z2H-yZAS-xyw2XwCdkRlxsGdsxrTwmMqijimScpWn8O6nKEoXuN1WrMPx',
    time: '2 giờ trước • Hoạt động: 10 phút trước',
    title: 'Có sẵn sơn chống thấm KOVA giá sỉ tại Hà Nội - Phân phối chính hãng trực tiếp từ kho',
    description:
      'Chúng tôi đang có sẵn số lượng lớn sơn chống thấm KOVA CT-11A Plus. Đầy đủ chứng từ CO/CQ, chiết khấu cực cao cho đại lý cấp 1 và dự án. Hỗ trợ vận chuyển tận nơi trong khu vực nội thành Hà Nội...',
    tags: ['#kova', '#sonchongtham', '#vatlieuxaydung'],
    product: {
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBiel9GwmnPjFm4zfDn7QDl-J4rLzmp5w9Biauziay64vPltf76_Pseuy15TGug3gNWQaO_RmG4a1v_1wNP7aLb_RO10op3NYbgU4utqlKHCrNPTqjQs2GXS66w6XIlFLFHhXGrCYW5p_nKfhpyjMSHKZCqEswt8DbTKJzekwqFPu2NLZbh-o8NARIeJEKS6vJGEMoJcJQYjOk1wiby4PHJ3akZ5XM7fMTbkqKaD6BxO18usBVnQmUY6cmZq3OIA4lzV1KDME9DSLl8',
      name: 'KOVA CT-11A Plus 20kg',
      price: '1.250k - 1.450k',
      moq: '10 thùng / Hà Nội',
      status: 'Còn hàng',
    },
    stats: [
      { label: '12', icon: 'forum' },
      { label: 'Lưu bài', icon: 'bookmark' },
    ],
  },
  {
    id: 2,
    type: 'Tìm nguồn',
    typeTone: 'bg-orange-50 text-orange-700 border-orange-100',
    author: 'Đại lý Tiến Mạnh',
    role: 'Nhà mua hàng',
    verified: true,
    avatarInitials: 'DT',
    time: '5 giờ trước • Hoạt động: 1 giờ trước',
    title: 'Cần tìm xưởng gia công Bulong neo M24 số lượng lớn tại Long An',
    description:
      'Đại lý chúng tôi đang cần tìm xưởng sản xuất trực tiếp có khả năng gia công Bulong neo M24x800, mạ kẽm nhúng nóng. Số lượng đợt 1 khoảng 5.000 bộ. Yêu cầu báo giá xuất xưởng...',
    meta: [
      { label: '245', icon: 'visibility' },
      { label: '8 phản hồi', icon: 'forum' },
    ],
  },
];

const newSourcePosts = [
  {
    id: 1,
    title: 'Máy khoan pin Bosch GSB 18V-50 - Hàng về ngập kho',
    author: 'Đại lý Thành Công',
    time: '5 phút trước',
  },
  {
    id: 2,
    title: 'Xả kho đá cắt Hải Dương 100mm giá cực sốc',
    author: 'Kim khí Miền Bắc',
    time: '18 phút trước',
  },
  {
    id: 3,
    title: 'Sỉ kìm điện Kapusi Nhật Bản chính hãng chiết khấu 35%',
    author: 'Đồ nghề Pro',
    time: '42 phút trước',
  },
];

const featuredSale = {
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBP2YJaSR1my1URY7L7QzHpee2Fsc2xTOYRuuoyL6p_1eeRhRG-ZgFjKcJAh9PwEj1h30bFRMkLYL3jpITmABAWFcve4I4erbV9YYuhuvAqdumTvip7ERuH2wq27kz4mDDdVjAEBws6HB1MgtQjvMgAEWuUBd5oQC739V4qGqR_9UHd7utmLf7ODqoLMD42a3RHn5uAj_skoZGUeqw5xtG9dP8Zd-azQixlxDccLiB0Xd2tSoYStI80DMZuBjQIwYed7q4K7n5dRPgp',
  title: 'Hệ thống Bulong Ốc vít Tiêu chuẩn DIN',
  description: 'VinFast Hardware - Miễn phí vận chuyển cho đơn sỉ trên 50 triệu.',
};

const ForumSupply = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [category, setCategory] = useState(categoryOptions[0]);
  const [region, setRegion] = useState(regionOptions[0]);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const visiblePosts = useMemo(() => {
    if (activeTab === 'all') {
      return sourcePosts;
    }

    return sourcePosts.filter((post) => {
      if (activeTab === 'source') {
        return post.type === 'Bán sỉ';
      }

      if (activeTab === 'liquidation') {
        return post.id === 2;
      }

      return true;
    });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface antialiased">
      <ForumHeader onCreatePostClick={() => setIsCreatePostModalOpen(true)} />

      <div className="relative mx-auto flex max-w-[1200px] gap-4">
        <ForumLeftSidebar activeKey="source" />

        <main className="min-w-0 flex-1 bg-surface py-4 pb-24 lg:pb-10">
          <div className="grid gap-8 p-6 lg:grid-cols-12 lg:p-10">
            <div className="space-y-8 lg:col-span-8">
              <section>
                <h1 className="mb-2 text-3xl font-bold leading-tight text-on-surface md:text-4xl">
                  Nguồn hàng kim khí
                </h1>
                <p className="max-w-2xl text-sm text-on-surface-variant md:text-base">
                  Kết nối nhà phân phối, đại lý và xưởng sản xuất thiết bị kim khí, dụng cụ cầm tay,
                  bulong ốc vít và phụ kiện cơ khí trên toàn quốc.
                </p>
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-50 p-3 px-4 md:p-4">
                  {tabs.map((tab) => {
                    const active = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all md:px-5 md:py-2.5 ${
                          active
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 gap-4 bg-white p-4 md:grid-cols-2 md:p-5">
                  <div className="relative flex flex-col gap-1.5">
                    <label className="ml-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Danh mục
                    </label>
                    <div className="relative">
                      <MaterialIcon
                        name="category"
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400"
                      />
                      <select
                        className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-11 pr-8 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                      >
                        {categoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
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
                    <label className="ml-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Khu vực
                    </label>
                    <div className="relative">
                      <MaterialIcon
                        name="location_on"
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400"
                      />
                      <select
                        className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-11 pr-8 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                        value={region}
                        onChange={(event) => setRegion(event.target.value)}
                      >
                        {regionOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
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

              <div className="space-y-6">
                {visiblePosts.map((post) => (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3.5 md:px-5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {post.avatar ? (
                            <img
                              alt={post.author}
                              src={post.avatar}
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-sm font-bold text-orange-600">
                              {post.avatarInitials}
                            </div>
                          )}
                          <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-on-surface">{post.author}</h4>
                            <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                              {post.role}
                            </span>
                            {post.verified ? (
                              <MaterialIcon
                                name="verified"
                                fill
                                className="text-[16px] text-blue-500"
                              />
                            ) : null}
                          </div>
                          <span className="text-caption flex items-center gap-1 text-slate-500">
                            <MaterialIcon name="schedule" className="text-[14px]" />
                            {post.time}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="p-2 text-slate-400 transition-colors hover:text-primary"
                      >
                        <MaterialIcon name="more_horiz" />
                      </button>
                    </header>

                    <div className="p-4 md:p-6">
                      <div className="mb-5">
                        <span
                          className={`mb-3 inline-block rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-tight ${post.typeTone}`}
                        >
                          {post.type}
                        </span>
                        <h3 className="mb-3 cursor-pointer text-lg font-bold leading-tight text-on-surface transition-colors hover:text-primary md:text-xl">
                          {post.title}
                        </h3>
                        <p className="line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
                          {post.description}
                        </p>
                        {post.tags ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[12px] font-medium text-slate-500"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      {'product' in post ? (
                        <div className="flex flex-col items-center gap-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 md:flex-row">
                          <img
                            alt={post.product.name}
                            className="h-28 w-full rounded-xl object-cover shadow-sm md:h-24 md:w-28"
                            src={post.product.image}
                          />
                          <div className="grid w-full grid-cols-2 gap-6 md:grid-cols-4">
                            <div>
                              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Sản phẩm
                              </p>
                              <p className="truncate text-sm font-bold text-slate-700">
                                {post.product.name}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Giá sỉ / lẻ
                              </p>
                              <p className="text-sm font-bold text-primary">{post.product.price}</p>
                            </div>
                            <div>
                              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                MOQ / Khu vực
                              </p>
                              <p className="text-sm font-bold text-slate-700">{post.product.moq}</p>
                            </div>
                            <div>
                              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Trạng thái
                              </p>
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                                <p className="text-sm font-bold text-green-600">
                                  {post.product.status}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
                        {'stats' in post ? (
                          <div className="flex items-center gap-1">
                            {post.stats.map((item) => (
                              <button
                                key={item.icon}
                                type="button"
                                className="flex items-center gap-2 rounded-xl px-4 py-2 text-slate-600 transition-colors hover:bg-slate-50"
                              >
                                <MaterialIcon name={item.icon} className="text-[20px]" />
                                <span className="text-xs font-bold">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-5">
                            {post.meta.map((item) => (
                              <span
                                key={item.label}
                                className="flex items-center gap-1.5 text-xs font-medium text-slate-400"
                              >
                                <MaterialIcon name={item.icon} className="text-[18px]" />
                                {item.label}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          {post.id === 1 ? (
                            <>
                              <button className="rounded-full border-2 border-primary px-5 py-2.5 text-xs font-bold text-primary transition-all hover:bg-primary/5">
                                Nhắn tin
                              </button>
                              <button className="rounded-full bg-primary px-7 py-2.5 text-xs font-bold text-white transition-all hover:shadow-lg active:scale-95">
                                Xem chi tiết
                              </button>
                            </>
                          ) : (
                            <button className="rounded-full bg-[#1E6BB8] px-7 py-2.5 text-xs font-bold text-white transition-all hover:shadow-lg active:scale-95">
                              Báo giá ngay
                            </button>
                          )}
                        </div>
                      </footer>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-12 flex items-center justify-center gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-all hover:border-primary hover:text-primary">
                  <MaterialIcon name="chevron_left" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-bold text-white shadow-md shadow-primary/20">
                  1
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-primary">
                  2
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-primary">
                  3
                </button>
                <span className="mx-1 text-slate-400">...</span>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-primary">
                  12
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-all hover:border-primary hover:text-primary">
                  <MaterialIcon name="chevron_right" />
                </button>
              </div>
            </div>

            <aside className="xl:gap-lg xl:px-gutter xl:py-lg hidden xl:sticky xl:top-[72px] xl:flex xl:h-fit xl:w-80 xl:flex-col">
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <MaterialIcon name="update" className="text-[20px] text-primary" />
                  Nguồn hàng mới nhất
                </h4>
                <div className="space-y-4">
                  {newSourcePosts.map((item) => (
                    <button key={item.id} type="button" className="group block w-full text-left">
                      <p className="text-xs font-bold leading-tight text-slate-700 transition-colors group-hover:text-primary">
                        {item.title}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400">
                        {item.author}
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        {item.time}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <MaterialIcon name="workspace_premium" className="text-[20px] text-orange-500" />
                  Bán sỉ nổi bật
                </h4>
                <div className="mb-3.5 overflow-hidden rounded-xl border border-slate-50">
                  <img
                    alt="Featured"
                    className="aspect-video h-full w-full object-cover"
                    src={featuredSale.image}
                  />
                </div>
                <p className="mb-1.5 text-xs font-bold leading-snug text-slate-700">
                  {featuredSale.title}
                </p>
                <p className="text-caption mb-4 leading-relaxed text-slate-500">
                  {featuredSale.description}
                </p>
                <button className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-white">
                  Xem ngay
                </button>
              </section>

              <section className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
                <div className="mb-2.5 flex items-center gap-2 text-rose-700">
                  <MaterialIcon name="gpp_maybe" className="text-[20px]" />
                  <h4 className="text-xs font-bold uppercase tracking-widest">An toàn giao dịch</h4>
                </div>
                <p className="mb-4 text-[11px] leading-relaxed text-rose-600">
                  Cẩn trọng với yêu cầu thanh toán trước 100% cho nhà cung cấp chưa xác minh. Ưu
                  tiên giao dịch qua hệ thống.
                </p>
                <button
                  type="button"
                  className="text-[11px] font-bold text-rose-700 underline decoration-rose-300 hover:text-rose-800"
                >
                  Tìm hiểu quy trình an toàn
                </button>
              </section>
            </aside>
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-slate-100 bg-white px-4 md:hidden">
        <a className="flex flex-col items-center gap-1 text-primary" href="/forum">
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
            className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-xl transition-all active:scale-90"
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

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
    </div>
  );
};

export default ForumSupply;
