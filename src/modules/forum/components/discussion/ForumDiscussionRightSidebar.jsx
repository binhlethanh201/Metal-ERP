/**
 * ForumDiscussionRightSidebar - Cột phải trang Thảo luận.
 * 2 khối: Chủ đề đang hot, Nội quy thảo luận.
 * Props: hotTopics.
 */
import MaterialIcon from '../shared/MaterialIcon';

const ForumDiscussionRightSidebar = ({ hotTopics }) => (
  <>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
        <MaterialIcon name="trending_up" className="text-[20px] text-[#004785]" />
        Chủ đề đang hot
      </h4>
      <div className="space-y-4">
        {hotTopics.map((topic) => (
          <button key={topic.title} type="button" className="group block text-left">
            <p className="line-clamp-2 text-sm font-bold leading-tight text-slate-700 transition-colors group-hover:text-[#004785]">
              {topic.title}
            </p>
            <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
              {topic.meta} <span className="h-1 w-1 rounded-full bg-slate-300" /> {topic.time}
            </p>
          </button>
        ))}
      </div>
    </section>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-[#004785]">
        <MaterialIcon name="gavel" className="text-[20px]" />
        <h4 className="text-xs font-bold uppercase tracking-widest">Nội quy thảo luận</h4>
      </div>
      <ul className="space-y-2">
        {[
          'Tôn trọng người dùng khác, không dùng từ ngữ khiếm nhã.',
          'Đăng bài đúng chuyên mục, không spam quảng cáo rác.',
          'Khuyến khích chia sẻ thông tin có ích cho cộng đồng.',
        ].map((rule, i) => (
          <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-600">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#004785]/10 text-[10px] font-bold text-[#004785]">
              {i + 1}
            </span>
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </section>
  </>
);

export default ForumDiscussionRightSidebar;
