import { useNavigate } from 'react-router-dom';

const MaterialIcon = ({ name, className = '', fill = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 20` }}
  >
    {name}
  </span>
);

/**
 * ForumHeader - Header của Forum module
 * @param {Function} onCreatePostClick - Callback khi bấm nút đăng bài
 */
const ForumHeader = ({ onCreatePostClick = () => {} }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white font-['Be_Vietnam_Pro'] antialiased dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-2">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => window.location.assign('/forum')}
            className="text-lg font-extrabold tracking-tight text-[#1E6BB8] transition-colors hover:text-[#005296] dark:text-blue-400"
          >
            HardBuild B2B
          </button>

          <div className="hidden w-64 items-center rounded-full border border-slate-100 bg-[#F8FAFC] px-3 py-1 md:flex">
            <MaterialIcon name="search" className="mr-2 text-sm text-[#1E6BB8]" />
            <input
              className="w-full border-none bg-transparent p-0 text-xs outline-none focus:ring-0"
              placeholder="Tìm kiếm tài liệu, sản phẩm..."
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCreatePostClick}
            className="rounded-full bg-[#1E6BB8] px-4 py-1.5 text-[13px] font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
          >
            + Đăng bài viết
          </button>
          <button className="relative rounded-full p-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
            <MaterialIcon
              name="notifications"
              className="text-xl text-slate-600 dark:text-slate-400"
            />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>
          <img
            alt="User Profile Avatar"
            className="h-8 w-8 rounded-full border border-slate-200 object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjYqYBGkR_Iadb7O3sIeQNtpWqJ9ThFzKm9BOnEoOjeAE90A3wKJFFf_2bunkuTYMCqxG-rZhI2sPranFao-yWEOh0ApqhjfAAZbuje4uAJVypcId7wA_hljomIOwQcSCCah1Fy-OvCW8q4Fu_GOKEK8rcUHnVgFEuCEYDJGKLI7qI0pVrjInnAhtDOJTjOxgm3_qIjxQV1OQT-PS9-tSwqZFR6TBj4W3czn_RYk-psKet5iM85xrN2qNW9iI1H_BG-KYPwDIYPCHf"
          />
        </div>
      </div>
    </header>
  );
};

export default ForumHeader;
