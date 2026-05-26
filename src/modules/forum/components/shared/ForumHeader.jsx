/**
 * ForumHeader - Thanh tiêu đề sticky top-0.
 * Logo HardBuild B2B + Search bar + Nút "+ Đăng bài viết" + Icon thông báo + Avatar user.
 * Props: onCreatePostClick (callback khi bấm nút Đăng bài).
 */
import MaterialIcon from './MaterialIcon';

/**
 * ForumHeader - Header kiểu Facebook
 */
const ForumHeader = ({ onCreatePostClick = () => {} }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white shadow-sm">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.location.assign('/forum')}
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-[#004785]"
          >
            <MaterialIcon name="inventory_2" className="text-[28px]" />
            HardBuild B2B
          </button>

          <div className="hidden h-10 w-60 items-center rounded-full bg-[#f0f2f5] px-4 md:flex">
            <MaterialIcon name="search" className="mr-2 text-base text-gray-500" />
            <input
              className="w-full border-none bg-transparent text-[15px] outline-none placeholder:text-gray-500"
              placeholder="Tìm kiếm trên HardBuild..."
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCreatePostClick}
            className="rounded-full bg-[#004785] px-5 py-2 text-[15px] font-semibold text-white transition-all hover:bg-[#00376b] active:scale-95"
          >
            + Đăng bài viết
          </button>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f2f5] text-gray-600 transition-colors hover:bg-gray-200">
            <MaterialIcon name="notifications" className="text-xl" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <img
            alt="User Avatar"
            className="h-9 w-9 cursor-pointer rounded-full border-2 border-white object-cover ring-1 ring-gray-200 hover:ring-[#004785]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjYqYBGkR_Iadb7O3sIeQNtpWqJ9ThFzKm9BOnEoOjeAE90A3wKJFFf_2bunkuTYMCqxG-rZhI2sPranFao-yWEOh0ApqhjfAAZbuje4uAJVypcId7wA_hljomIOwQcSCCah1Fy-OvCW8q4Fu_GOKEK8rcUHnVgFEuCEYDJGKLI7qI0pVrjInnAhtDOJTjOxgm3_qIjxQV1OQT-PS9-tSwqZFR6TBj4W3czn_RYk-psKet5iM85xrN2qNW9iI1H_BG-KYPwDIYPCHf"
          />
        </div>
      </div>
    </header>
  );
};

export default ForumHeader;
