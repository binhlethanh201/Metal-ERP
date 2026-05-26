/**
 * PostSidebar - Cột phải form đăng bài.
 * Vòng tròn tiến độ hoàn thành (SVG circle) + Mẹo đăng bài (3 tips).
 * Props: completionPercent, progressOffset.
 */
import MaterialIconBase from '../shared/MaterialIcon';

const MaterialIcon = (props) => <MaterialIconBase opsz={24} {...props} />;

const PostSidebar = ({ completionPercent, progressOffset }) => (
  <aside className="space-y-6 xl:col-span-4">
    <div className="space-y-6 xl:sticky xl:top-24">
      <div className="flex flex-col items-center rounded-lg border border-outline-variant bg-white p-4 text-center md:p-6">
        <h3 className="mb-4 w-full text-left text-sm font-semibold text-on-surface">
          Phần trăm hoàn thành
        </h3>
        <div className="relative mb-4 flex items-center justify-center">
          <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 128 128">
            <circle
              className="text-surface-container"
              cx="64"
              cy="64"
              r="58"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
            />
            <circle
              className="text-primary"
              cx="64"
              cy="64"
              r="58"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="364.42"
              strokeDashoffset={progressOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-on-surface">{completionPercent}%</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
              Hoàn thiện
            </span>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant md:text-sm">
          Hoàn thiện các thông tin còn thiếu để bài đăng uy tín hơn.
        </p>
      </div>

      <div className="rounded-lg border border-[#b7cae9] bg-[#c9dbf4] p-4 md:p-6">
        <div className="mb-4 flex items-center gap-2 text-[#005ea4]">
          <MaterialIcon name="lightbulb" className="text-[18px]" />
          <h3 className="text-xs font-bold uppercase tracking-[0.12em]">Mẹo đăng bài</h3>
        </div>
        <ul className="space-y-4 text-left">
          {[
            'Tiêu đề chứa tên thương hiệu và địa phương giúp tăng 40% lượt xem.',
            'Sử dụng hình ảnh thực tế từ kho bãi để tạo niềm tin với khách hàng B2B.',
            'Mô tả chi tiết năng lực cung ứng để thu hút đối tác mua số lượng lớn.',
          ].map((tip) => (
            <li key={tip} className="flex gap-3">
              <MaterialIcon name="radio_button_unchecked" className="text-[14px] text-[#005ea4]" />
              <p className="text-sm leading-5 text-[#123457]">{tip}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </aside>
);

export default PostSidebar;
