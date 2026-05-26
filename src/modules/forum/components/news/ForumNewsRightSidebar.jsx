/**
 * ForumNewsRightSidebar - Cột phải trang Tin tức ngành.
 * 2 khối: Tin liên quan sản phẩm hot, Thảo luận diễn đàn.
 * Props: hotProductNews, forumDiscussions.
 */
import MaterialIcon from '../shared/MaterialIcon';

const ForumNewsRightSidebar = ({ hotProductNews, forumDiscussions }) => (
  <>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
        <MaterialIcon name="local_fire_department" className="text-orange-500" />
        Tin liên quan sản phẩm hot
      </h4>
      <div className="space-y-4">
        {hotProductNews.map((item) => (
          <div key={item.id} className="group cursor-pointer">
            <p className="mb-1 text-xs text-slate-400">{item.brand}</p>
            <h5 className="text-sm font-bold text-slate-700 transition-colors group-hover:text-[#004785]">
              {item.title}
            </h5>
          </div>
        ))}
      </div>
    </section>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
        <MaterialIcon name="forum" className="text-violet-500" />
        Thảo luận diễn đàn
      </h4>
      <div className="space-y-3">
        {forumDiscussions.map((item) => (
          <button
            key={item.id}
            type="button"
            className="block w-full rounded-xl p-3 text-left transition-colors hover:bg-gray-50"
          >
            <p className="mb-1 text-sm font-semibold text-slate-700">{item.title}</p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{item.comments} bình luận</span>
              <span>{item.views} lượt xem</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  </>
);

export default ForumNewsRightSidebar;
