/**
 * PostSidebar - Cột phải form đăng bài viết lớn
 */
import React from 'react';
import { Lightbulb } from 'lucide-react'; // Import trực tiếp từ thư viện lucide-react

const PostSidebar = ({ completionPercent, progressOffset }) => (
  <aside className="space-y-4 xl:col-span-4">
    <div className="space-y-4 xl:sticky xl:top-[76px]">
      {/* KHỐI 1: VÒNG TRÒN TIẾN ĐỘ HOÀN THÀNH */}
      <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
        <h3 className="mb-4 w-full text-left text-xs font-black uppercase tracking-widest text-slate-400">
          Tiến độ bài đăng
        </h3>
        <div className="relative mb-3 flex items-center justify-center">
          <svg className="h-28 w-28 -rotate-90 transform" viewBox="0 0 128 128">
            <circle
              className="text-slate-100"
              cx="64"
              cy="64"
              r="58"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
            />
            <circle
              className="text-[#004785]"
              cx="64"
              cy="64"
              r="58"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="364.42"
              strokeDashoffset={progressOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-slate-800">{completionPercent}%</span>
            <span className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400">
              Hoàn thiện
            </span>
          </div>
        </div>
        <p className="text-xs font-medium leading-relaxed text-slate-400">
          Điền thêm các điều kiện sỉ và thông số để tăng 65% độ uy tín B2B.
        </p>
      </div>

      {/* KHỐI 2: HỘP CẨM NANG MẸO ĐĂNG BÀI AI */}
      <div className="shadow-sm/5 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
        <div className="mb-4 flex items-center gap-2 text-[#004785]">
          <Lightbulb size={16} className="fill-[#004785]/10" />
          <h3 className="text-xs font-black uppercase tracking-widest">Mẹo đăng bài hiệu quả</h3>
        </div>
        <ul className="space-y-3 text-left text-xs font-semibold leading-relaxed text-slate-600">
          {[
            'Tiêu đề chứa tên thương hiệu thép/ốc vít cụ thể và khu vực giúp tăng 40% lượt tìm kiếm đúng đối tượng.',
            'Sử dụng hình ảnh thực tế từ xưởng hoặc kho bãi bốc xếp để tạo niềm tin tuyệt đối với bạn hàng đại lý.',
            'Mô tả chi tiết năng lực cung ứng theo tháng hoặc MOQ tối thiểu để thu hút các đầu buôn sỉ lớn nhảy vào thương thảo.',
          ].map((tip, index) => (
            <li key={index} className="flex items-start gap-2">
              {/* Thay dấu tròn cũ bằng chấm dot tròn màu xanh đặc gọn gàng */}
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#004785]" />
              <p>{tip}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </aside>
);

export default PostSidebar;
