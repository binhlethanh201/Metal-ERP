/**
 * PostDetailRightSidebar - Cột phải trang Chi tiết bài viết.
 * 4 khối: Xu hướng sản phẩm, Bài viết liên quan, Tags liên quan, Quy định cộng đồng.
 * Props: trends, relatedPosts, tags.
 */
import MaterialIcon from '../shared/MaterialIcon';

const PostDetailRightSidebar = ({ trends, relatedPosts, tags }) => (
  <>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
        <MaterialIcon name="trending_up" className="text-[#004785]" />
        Xu hướng sản phẩm
      </h4>
      <ul className="space-y-4">
        {trends.map((trend, idx) => (
          <li key={idx} className="group flex items-center justify-between">
            <span className="cursor-pointer text-sm text-slate-600 transition-colors group-hover:text-[#004785]">
              {trend.name}
            </span>
            <span
              className={`${trend.isPositive ? 'text-green-600' : 'text-red-500'} text-xs font-bold`}
            >
              {trend.change}
            </span>
          </li>
        ))}
      </ul>
    </section>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-4 text-sm font-bold text-slate-700">Bài viết liên quan</h4>
      <div className="space-y-4">
        {relatedPosts.map((rp) => (
          <button key={rp.id} type="button" className="group block w-full cursor-pointer text-left">
            <p className="line-clamp-2 text-sm font-medium text-slate-700 transition-colors group-hover:text-[#004785]">
              {rp.title}
            </p>
            <span className="mt-1 block text-xs text-slate-400">
              {rp.comments} bình luận • {rp.date}
            </span>
          </button>
        ))}
      </div>
    </section>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-4 text-sm font-bold text-slate-700">Tags liên quan</h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="cursor-pointer rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 transition-all hover:bg-blue-50 hover:text-[#004785]"
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-2 text-sm font-bold text-slate-700">Quy định cộng đồng</h4>
      <p className="text-xs leading-relaxed text-slate-500">
        Vui lòng tuân thủ quy tắc ứng xử văn minh. Không đăng tin rác, quảng cáo không đúng tin tức
        ngành. Các bài viết sai quy định sẽ bị gỡ bỏ không báo trước.
      </p>
      <button type="button" className="mt-3 inline-block text-sm font-bold text-[#004785]">
        Xem chi tiết
      </button>
    </section>
  </>
);

export default PostDetailRightSidebar;
