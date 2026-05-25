/**
 * ForumHomeRightSidebar - Cột phải trang chủ.
 * 4 khối: Xu hướng tìm kiếm, Chủ đề quan tâm, Thảo luận nổi bật, Quy định chung.
 * Props: trendSearches, topicTags, hotPosts, onSearchByTag.
 */
import MaterialIcon from '../shared/MaterialIcon';

const ForumHomeRightSidebar = ({ trendSearches, topicTags, hotPosts, onSearchByTag }) => (
  <>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">
        Xu hướng tìm kiếm
      </h3>
      <div className="space-y-3">
        {trendSearches.map((trend) => (
          <div key={trend.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium text-slate-700">{trend.label}</span>
              <span className="font-bold text-green-600">{trend.value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[#004785]" style={{ width: trend.width }} />
            </div>
          </div>
        ))}
      </div>
    </section>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">
        Chủ đề quan tâm
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {topicTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSearchByTag(tag)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-[#004785]"
          >
            {tag}
          </button>
        ))}
      </div>
    </section>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">
        Thảo luận nổi bật
      </h3>
      <div className="space-y-3">
        {hotPosts.map((post, index) => (
          <div key={post.title} className="group flex gap-2">
            <span className="text-base font-black text-slate-200 transition-colors group-hover:text-[#004785]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h4 className="line-clamp-2 cursor-pointer text-sm font-bold text-slate-700 transition-colors group-hover:text-[#004785]">
                {post.title}
              </h4>
              <div className="mt-0.5 flex gap-2 text-[11px] text-slate-400">
                <span>{post.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.05em] text-green-700">
        <MaterialIcon name="gpp_maybe" className="text-lg" /> Quy định chung
      </div>
      <ul className="space-y-1.5 text-xs text-slate-600">
        {[
          'Không spam, quảng cáo rác.',
          'Không tin giả thị trường.',
          'Không hàng lậu, hàng giả.',
        ].map((rule) => (
          <li key={rule} className="flex items-start gap-1.5">
            <MaterialIcon name="check_circle" className="mt-0.5 text-[12px] text-green-600" />{' '}
            {rule}
          </li>
        ))}
      </ul>
    </section>
  </>
);

export default ForumHomeRightSidebar;
