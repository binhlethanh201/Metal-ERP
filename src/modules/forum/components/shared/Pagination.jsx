/**
 * Pagination - Component phân trang dùng chung.
 * Hiển thị: nút Previous, số trang 1-2-3...12, nút Next.
 * Dùng trong ForumDiscussion và ForumSupply.
 */
import MaterialIcon from './MaterialIcon';

const Pagination = () => (
  <div className="mt-8 flex items-center justify-center gap-2">
    <button
      type="button"
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all hover:border-[#004785] hover:text-[#004785]"
    >
      <MaterialIcon name="chevron_left" />
    </button>
    <button
      type="button"
      className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#004785] font-bold text-white shadow-md shadow-[#004785]/20"
    >
      1
    </button>
    <button
      type="button"
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-[#004785]"
    >
      2
    </button>
    <button
      type="button"
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-[#004785]"
    >
      3
    </button>
    <span className="mx-1 text-slate-400">...</span>
    <button
      type="button"
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-[#004785]"
    >
      12
    </button>
    <button
      type="button"
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all hover:border-[#004785] hover:text-[#004785]"
    >
      <MaterialIcon name="chevron_right" />
    </button>
  </div>
);

export default Pagination;
