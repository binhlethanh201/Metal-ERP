/**
 * ForumProfile - Trang hồ sơ thành viên.
 */
import { useEffect, useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import ForumProfileRightSidebar from '../components/profile/ForumProfileRightSidebar';

const TABS = [{ key: 'posts', label: 'Bài viết' }];

const USER = {
  name: 'Nguyễn Văn An',
  role: 'Nhà phân phối kim khí',
  bio: 'Chia sẻ kinh nghiệm vận hành chuỗi cửa hàng vật liệu xây dựng & kim khí. 10 năm trong ngành.',
  avatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAjYqYBGkR_Iadb7O3sIeQNtpWqJ9ThFzKm9BOnEoOjeAE90A3wKJFFf_2bunkuTYMCqxG-rZhI2sPranFao-yWEOh0ApqhjfAAZbuje4uAJVypcId7wA_hljomIOwQcSCCah1Fy-OvCW8q4Fu_GOKEK8rcUHnVgFEuCEYDJGKLI7qI0pVrjInnAhtDOJTjOxgm3_qIjxQV1OQT-PS9-tSwqZFR6TBj4W3czn_RYk-psKet5iM85xrN2qNW9iI1H_BG-KYPwDIYPCHf',
  cover:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCbANZSd8L18QDQBDISPNO-IOzrQuPf8NT15H9APObVw-ZvbY-HrWXAqucaIrD0yDnHSJY0dMR5zKP_a8nJeVt5IJf5gE2w2LlKbjR3Ox28SN-Rqd48KNb4Vlpv_6HQMHmDpgbOz4UlDjchaYhXTZubIcPUVWIpiP1hV2LW-d-WbKvu52WrEVxqPgOVn_Gw_L109l5h7rQOMi0ICsyRN1FpAmpJ-YejQQhSf8sdFR8IXtSR4iUJ5AFBhs9cXD54b5EHsCzs01WjuQ',
  stats: { posts: 5, likes: 2340, comments: 580 },
};

const MY_POSTS = [
  {
    id: 1,
    status: 'Đã đăng',
    statusClass: 'bg-emerald-50 text-emerald-600',
    title: 'Cung cấp thép xây dựng Hòa Phát số lượng lớn tại TP.HCM',
    excerpt:
      'Chúng tôi chuyên cung cấp các dòng thép cuộn, thép cây thương hiệu Hòa Phát với đầy đủ chứng chỉ CO/CQ. Năng lực cung ứng lên đến 1000 tấn/tháng...',
    time: '2 giờ trước',
    likes: 24,
    comments: 12,
    views: '1.2k',
  },
  {
    id: 2,
    status: 'Đã đăng',
    statusClass: 'bg-emerald-50 text-emerald-600',
    title: 'Sơn chống thấm KOVA CT-11A Gold - Hàng có sẵn giá sỉ cực tốt',
    excerpt:
      'Sơn KOVA là dòng sơn chống thấm cao cấp số 1 Việt Nam hiện nay. Với ưu điểm chống thấm tuyệt đối, ngăn chặn nấm mốc, bền màu với thời gian...',
    time: '5 giờ trước',
    likes: 18,
    comments: 8,
    views: '856',
  },
  {
    id: 3,
    status: 'Đã đăng',
    statusClass: 'bg-emerald-50 text-emerald-600',
    title: 'Cần tìm nguồn hàng ống thép mạ kẽm - số lượng lớn giao Hà Nội',
    excerpt:
      'Cửa hàng mình đang cần tìm nguồn ống thép mạ kẽm các loại, số lượng đặt hàng 50 tấn/tháng. Yêu cầu có CO/CQ đầy đủ, giá cạnh tranh...',
    time: '1 ngày trước',
    likes: 12,
    comments: 5,
    views: '640',
  },
  {
    id: 4,
    status: 'Chờ duyệt',
    statusClass: 'bg-amber-50 text-amber-600',
    title: 'Thanh lý lô bulong neo M24 - hàng tồn kho giá rẻ bất ngờ',
    excerpt:
      'Cần thanh lý gấp lô bulong neo M24 nhúng kẽm nóng, số lượng 5000 con. Giá thanh lý chỉ bằng 60% giá thị trường...',
    time: '2 phút trước',
    likes: 0,
    comments: 0,
    views: '0',
  },
  {
    id: 5,
    status: 'Nháp',
    statusClass: 'bg-slate-100 text-slate-500',
    title: '[Nháp] Cung cấp phụ kiện điện công nghiệp Schneider Electric',
    excerpt:
      'Bảng giá mới nhất tháng 6/2026 cho các dòng MCCB, MCB, Contactor Schneider. Hàng chính hãng nhập khẩu trực tiếp...',
    time: '3 ngày trước',
    likes: 0,
    comments: 0,
    views: '12',
  },
];

const ForumProfile = () => {
  const { setRightSidebar } = useOutletContext();
  const [activeTab, setActiveTab] = useState('posts');
  const [coverUrl, setCoverUrl] = useState(USER.cover);
  const [avatarUrl, setAvatarUrl] = useState(USER.avatar);
  const [userName, setUserName] = useState(USER.name);
  const [userRole, setUserRole] = useState(USER.role);
  const [userBio, setUserBio] = useState(USER.bio);
  const [showSettings, setShowSettings] = useState(false);
  const [pinnedIds, setPinnedIds] = useState([1]);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    setRightSidebar?.(<ForumProfileRightSidebar />);
    return () => setRightSidebar?.(null);
  }, [setRightSidebar]);

  return (
    <div>
      <section className="relative mb-8">
        <div
          className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-200 shadow-lg md:h-56"
          style={{
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) setCoverUrl(URL.createObjectURL(f));
            }}
          />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur transition-colors hover:bg-black/60"
          >
            <Icon name="edit" size={13} />
            Chỉnh ảnh bìa
          </button>
        </div>

        <div className="flex flex-col items-center gap-5 px-6 pt-5 md:flex-row md:items-end md:px-12">
          <div className="relative -mt-16 md:-mt-20">
            <div className="h-32 w-32 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl md:h-40 md:w-40">
              <img alt={userName} className="h-full w-full object-cover" src={avatarUrl} />
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) setAvatarUrl(URL.createObjectURL(f));
              }}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 shadow-sm transition-colors hover:bg-white"
            >
              <Icon name="edit" size={13} />
            </button>
          </div>

          <div className="flex-1 pb-3 text-center md:text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              {userName}
            </h1>
            <p className="text-base font-medium text-[#004785] md:text-lg">{userRole}</p>
            <p className="max-w-2xl text-sm text-slate-500">{userBio}</p>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { value: USER.stats.posts, label: 'Bài viết', color: 'text-[#004785]' },
            {
              value: USER.stats.likes.toLocaleString(),
              label: 'Lượt hữu ích',
              color: 'text-emerald-600',
            },
            { value: USER.stats.comments, label: 'Bình luận', color: 'text-slate-800' },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center rounded-2xl bg-white p-5 text-center shadow-sm"
            >
              <span className={`text-2xl font-extrabold ${s.color}`}>{s.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {s.label}
              </span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center shadow-sm transition-colors hover:border-[#004785] hover:text-[#004785]"
          >
            <Icon name="settings" size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="border-b-2 border-slate-100">
          <div className="flex flex-wrap gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-5 py-3.5 text-sm font-bold transition-colors ${activeTab === tab.key ? 'text-[#004785]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#004785]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'posts' && (
          <div className="space-y-3">
            {[...MY_POSTS]
              .sort(
                (a, b) => (pinnedIds.includes(b.id) ? 1 : 0) - (pinnedIds.includes(a.id) ? 1 : 0)
              )
              .map((post) => {
                const isPinned = pinnedIds.includes(post.id);
                return (
                  <article
                    key={post.id}
                    className={`rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${isPinned ? 'ring-2 ring-[#004785]/20' : ''}`}
                  >
                    {isPinned && (
                      <div className="mb-2 flex items-center gap-1.5">
                        <Icon name="push_pin" size={12} className="text-[#004785]" />
                        <span className="text-[10px] font-bold uppercase text-[#004785]">
                          Đã ghim
                        </span>
                      </div>
                    )}
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${post.statusClass}`}
                      >
                        {post.status}
                      </span>
                      <span className="text-[11px] text-slate-400">{post.time}</span>
                    </div>
                    <h3 className="mb-2 text-sm font-bold leading-snug text-slate-800">
                      {post.title}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-xs text-slate-500">{post.excerpt}</p>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Icon name="thumb_up" size={12} />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Icon name="chat_bubble" size={12} />
                        {post.comments}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Icon name="visibility" size={12} />
                        {post.views}
                      </span>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setPinnedIds((prev) =>
                              prev.includes(post.id)
                                ? prev.filter((id) => id !== post.id)
                                : [...prev, post.id]
                            )
                          }
                          className={`rounded-lg p-1.5 transition-colors ${isPinned ? 'text-[#004785] hover:bg-blue-50' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'}`}
                          title={isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                        >
                          <Icon name="push_pin" size={14} />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
                          title="Chỉnh sửa"
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                          title="Xóa"
                        >
                          <Icon name="delete" size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            <button
              type="button"
              className="w-full rounded-2xl border-2 border-dashed border-slate-200 py-4 text-sm font-bold text-[#004785] transition-colors hover:bg-slate-50"
            >
              Xem thêm bài viết
            </button>
          </div>
        )}
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-bold text-slate-900">Cài đặt hồ sơ</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                  Tên hiển thị
                </label>
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#004785]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                  Nghề nghiệp / Vai trò
                </label>
                <input
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#004785]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                  Giới thiệu
                </label>
                <textarea
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#004785]"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 rounded-xl bg-[#004785] py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserName(USER.name);
                    setUserRole(USER.role);
                    setUserBio(USER.bio);
                    setShowSettings(false);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumProfile;
