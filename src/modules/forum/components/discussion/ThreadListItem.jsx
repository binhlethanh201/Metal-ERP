/**
 * src/modules/forum/components/discussion/ThreadListItem.jsx
 * Card bài đăng thảo luận - Đã dọn dẹp và đồng bộ sang hệ thống Icon Lucide mới.
 */
import Avatar from '../shared/Avatar';
import Icon from '../../../../shared/components/Icon';

const ThreadListItem = ({ thread }) => (
  <article className="cursor-pointer rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#004785]/30 hover:shadow-md">
    <div className="flex gap-4">
      <div className="shrink-0">
        <Avatar src={thread.avatar} name={thread.avatarInitials || thread.author} size="lg" />
      </div>
      <div className="min-w-0 flex-1">
        {/* Khối thông tin tác giả & thời gian */}
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-sm font-bold text-gray-900 transition-colors hover:text-[#004785]">
            {thread.author}
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
            <Icon name="clock" size={13} />
            {thread.time}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${thread.categoryClass}`}
          >
            {thread.category}
          </span>
        </div>

        {/* Tiêu đề & nội dung bài thảo luận */}
        <h3 className="mb-1.5 line-clamp-2 text-xl font-bold leading-tight text-gray-900 transition-colors hover:text-[#004785]">
          {thread.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-[15px] leading-relaxed text-slate-600">
          {thread.description}
        </p>

        {/* Khối Hashtags */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {thread.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Khối tương tác dưới chân Card */}
        <div className="mt-1 flex items-center gap-6 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 font-medium text-slate-400">
            <Icon name="chat_bubble" size={16} />
            <span className="text-xs">{thread.comments}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-400">
            <Icon name="visibility" size={16} />
            <span className="text-xs">{thread.views}</span>
          </div>
          <div className="ml-auto">
            <button
              type="button"
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-[#004785]"
            >
              <Icon name="bookmark" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>
);

export default ThreadListItem;
