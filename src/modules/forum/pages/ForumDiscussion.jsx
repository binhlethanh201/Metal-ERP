import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatePostModal from '../components/CreatePostModal';
import ForumHeader from '../components/ForumHeader';
import ForumLeftSidebar from '../components/ForumLeftSidebar';

const MaterialIcon = ({ name, className = '', fill = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
  >
    {name}
  </span>
);

const tabItems = ['Mới nhất', 'Nổi bật'];

const threads = [
  {
    id: 1,
    author: 'Trần Văn Hoàng',
    time: '15 phút trước',
    category: 'Kỹ thuật',
    categoryClass: 'bg-orange-50 text-orange-600',
    title: 'Làm thế nào để phân biệt Inox 304 và Inox 201 chuẩn nhất bằng phương pháp thủ công?',
    description:
      'Hiện tại thị trường đang có rất nhiều loại bu lông inox gắn mác 304 nhưng chất lượng không đồng đều. Anh em có kinh nghiệm nào test nhanh bằng hóa chất hoặc nam châm mà chính xác không ạ?',
    tags: ['#inox304', '#kythuat', '#bulong'],
    comments: '24 bình luận',
    views: '1.2k lượt xem',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB7q0UeyjkmVy04LF7tf5IA0ygKOw2S_vmOCkwCiXBrQfV4j9kPFOsXFxfzjdt4i3-ckzsX5RrdHr3KhVUQgrrbDPhNWmism_mk-ExVFrfK7u7FTS3Ic3Y7MzINxNvtmyfdL4ATFPv0zt1IBynDrLVb0tABvI2lk6dB0grlwTJbKrYhVmFRgXeadptejbxFOZ731PmbzcnwFXmFx0MZmW7qvgsvNvGwe97svkGokZhOcQLW66PA7fde14LdktF4mhUtdcOqnkhn2Apf',
    trending: true,
  },
  {
    id: 2,
    author: 'Quốc Mạnh Hardware',
    time: '2 giờ trước',
    category: 'Thị trường',
    categoryClass: 'bg-emerald-50 text-emerald-600',
    title: 'Dự báo giá thép và phụ kiện kim khí cuối năm 2024 - Có nên ôm hàng thời điểm này?',
    description:
      'Tình hình biến động giá nguyên liệu đang khá phức tạp. Theo các bác đại lý lớn, liệu giá sẽ còn giảm sâu nữa hay sẽ bật tăng trở lại vào quý 4?',
    tags: ['#giathep', '#thitruong', '#kinhdoanh'],
    comments: '56 bình luận',
    views: '3.5k lượt xem',
    avatarInitials: 'QM',
    trending: true,
  },
  {
    id: 3,
    author: 'Kim Khí Hòa Phát',
    time: '5 giờ trước',
    category: 'Quản lý',
    categoryClass: 'bg-violet-50 text-violet-600',
    title: 'Kinh nghiệm sử dụng phần mềm quản lý kho cho đại lý kim khí vừa và nhỏ',
    description:
      'Cửa hàng em hàng nghìn mã hàng lặt vặt (ốc vít, long đền, mũi khoan...), kiểm kho đuối quá. Các bác đang dùng phần mềm nào ổn định, dễ dùng cho nhân viên không?',
    tags: ['#quanlykho', '#phanmem', '#cuahang'],
    comments: '12 bình luận',
    views: '890 lượt xem',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuARQdi4aUjEhq51ggqlTnuIcc0VpZNbVIyHq4o-nUM6ns5h_jkW35Ra6TTnsOx3cehJ3sFf30Lp9e4PaJnKStpqcBTntpjUcjwVxXEoI6Vz0On3t1TGWljo1rJiq5cYi0UZ6oIakFojxDUFOJtMOTeSXTJXpmBo3by3LDxJRP0E6-wjhBjR9v9YY7_piKxZSNoFajlnkWeMP_VWpDxElb6Z2H-yZAS-xyw2XwCdkRlxsGdsxrTwmMqijimScpWn8O6nKEoXuN1WrMPx',
    trending: false,
  },
];

const hotTopics = [
  {
    title: 'Mẹo tăng tuổi thọ cho các dòng máy khoan pin cầm tay',
    meta: '42 phản hồi',
    time: '1 giờ trước',
  },
  {
    title: 'Phân biệt đại lý cấp 1 và nhà phân phối độc quyền',
    meta: '28 phản hồi',
    time: '3 giờ trước',
  },
  {
    title: 'Quy trình nhập khẩu kim khí từ Trung Quốc năm 2024',
    meta: '115 phản hồi',
    time: '5 giờ trước',
  },
];

const ForumDiscussion = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Mới nhất');
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const visibleThreads = useMemo(() => {
    if (activeTab === 'Nổi bật') {
      return threads.filter((thread) => thread.trending);
    }

    return threads;
  }, [activeTab]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9ff] font-['Be_Vietnam_Pro','Inter',sans-serif] text-[#0b1c30]">
      <ForumHeader onCreatePostClick={() => setIsCreatePostModalOpen(true)} />

      <div className="relative mx-auto flex max-w-[1200px] gap-4">
        <ForumLeftSidebar activeKey="discussion" />

        <main className="min-w-0 flex-1 bg-slate-50/30 px-2 py-4 pb-24 lg:pb-8">
          <section className="mb-6">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <nav className="mb-3 flex items-center gap-1 text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => navigate('/forum')}
                    className="transition-colors hover:text-[#1E6BB8]"
                  >
                    Diễn đàn
                  </button>
                  <MaterialIcon name="chevron_right" className="text-[12px]" />
                  <span className="font-medium text-[#1E6BB8]">Thảo luận</span>
                </nav>
                <h1 className="mb-2 text-3xl font-semibold leading-tight text-[#0b1c30] md:text-[32px]">
                  Thảo luận mới nhất
                </h1>
                <p className="max-w-2xl text-sm text-slate-600 md:text-base">
                  Trao đổi kinh nghiệm, giải đáp thắc mắc về kỹ thuật, thị trường và quản lý trong
                  ngành kim khí.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2 px-4 shadow-sm md:p-3">
              {tabItems.map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                      active
                        ? 'bg-[#1E6BB8] font-bold text-white shadow-md shadow-[#1E6BB8]/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-[#1E6BB8]'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="space-y-4">
            {visibleThreads.map((thread) => (
              <article
                key={thread.id}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-[#1E6BB8]/40 hover:shadow-md md:p-6"
              >
                <div className="flex gap-4">
                  <div className="shrink-0">
                    {thread.avatar ? (
                      <img
                        alt={thread.author}
                        className="h-12 w-12 rounded-xl border border-slate-100 object-cover"
                        src={thread.avatar}
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-600">
                        {thread.avatarInitials}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-sm font-bold text-[#0b1c30] transition-colors hover:text-[#1E6BB8]">
                        {thread.author}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MaterialIcon name="schedule" className="text-[14px]" />
                        {thread.time}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${thread.categoryClass}`}
                      >
                        {thread.category}
                      </span>
                    </div>

                    <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-tight text-[#0b1c30] transition-colors group-hover:text-[#1E6BB8]">
                      {thread.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {thread.description}
                    </p>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {thread.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[12px] font-medium text-slate-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-6 border-t border-slate-50 pt-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <MaterialIcon name="forum" className="text-[20px]" />
                        <span className="text-xs font-bold">{thread.comments}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <MaterialIcon name="visibility" className="text-[20px]" />
                        <span className="text-xs font-medium">{thread.views}</span>
                      </div>
                      <div className="ml-auto">
                        <button
                          type="button"
                          className="text-slate-400 transition-colors hover:text-[#1E6BB8]"
                        >
                          <MaterialIcon name="bookmark" className="text-[20px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-all hover:border-[#1E6BB8] hover:text-[#1E6BB8]"
            >
              <MaterialIcon name="chevron_left" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E6BB8] font-bold text-white shadow-md shadow-[#1E6BB8]/20"
            >
              1
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-[#1E6BB8]"
            >
              2
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-[#1E6BB8]"
            >
              3
            </button>
            <span className="mx-1 text-slate-400">...</span>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-[#1E6BB8]"
            >
              12
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-all hover:border-[#1E6BB8] hover:text-[#1E6BB8]"
            >
              <MaterialIcon name="chevron_right" />
            </button>
          </div>
        </main>

        <aside className="sidebar-scroll sticky top-[72px] hidden h-fit w-80 flex-col gap-6 px-6 py-6 xl:flex">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
              <MaterialIcon name="trending_up" className="text-[20px] text-[#1E6BB8]" />
              Chủ đề đang hot
            </h4>
            <div className="space-y-4">
              {hotTopics.map((topic) => (
                <button key={topic.title} type="button" className="group block text-left">
                  <p className="line-clamp-2 text-xs font-bold leading-tight text-slate-700 transition-colors group-hover:text-[#1E6BB8]">
                    {topic.title}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400">
                    {topic.meta} <span className="h-1 w-1 rounded-full bg-slate-300" /> {topic.time}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#1E6BB8]/20 bg-[#1E6BB8]/10 p-5">
            <div className="mb-2.5 flex items-center gap-2 text-[#1E6BB8]">
              <MaterialIcon name="gavel" className="text-[20px]" />
              <h4 className="text-xs font-bold uppercase tracking-widest">Nội quy thảo luận</h4>
            </div>
            <ul className="space-y-2">
              <li className="flex gap-2 text-[11px] leading-relaxed text-slate-500">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1E6BB8]/10 text-[10px] font-bold text-[#1E6BB8]">
                  1
                </span>
                <span>Tôn trọng người dùng khác, không dùng từ ngữ khiếm nhã.</span>
              </li>
              <li className="flex gap-2 text-[11px] leading-relaxed text-slate-500">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1E6BB8]/10 text-[10px] font-bold text-[#1E6BB8]">
                  2
                </span>
                <span>Đăng bài đúng chuyên mục, không spam quảng cáo rác.</span>
              </li>
              <li className="flex gap-2 text-[11px] leading-relaxed text-slate-500">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1E6BB8]/10 text-[10px] font-bold text-[#1E6BB8]">
                  3
                </span>
                <span>Khuyến khích chia sẻ thông tin có ích cho cộng đồng.</span>
              </li>
            </ul>
          </section>
        </aside>
      </div>

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
            onClick={() => setIsCreatePostModalOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#1E6BB8] text-white shadow-xl transition-all active:scale-90"
          >
            <MaterialIcon name="add" className="text-2xl" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => navigate('/forum/discussion')}
          className="flex flex-col items-center gap-1 text-[#1E6BB8]"
        >
          <MaterialIcon name="forum" fill />
          <span className="text-[10px] font-bold">Thảo luận</span>
        </button>
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

export default ForumDiscussion;
