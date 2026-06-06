/**
 * ForumGuidelines - Sidebar hướng dẫn sử dụng & quy định diễn đàn.
 */
import React from 'react';
import Icon from '../../../../shared/components/Icon';

const guidelines = [
  {
    icon: 'check_circle',
    title: 'Đăng bài đúng danh mục',
    desc: 'Chọn đúng loại bài đăng và danh mục để tiếp cận đúng đối tượng khách hàng B2B.',
  },
  {
    icon: 'image',
    title: 'Hình ảnh thực tế',
    desc: 'Sử dụng ảnh chụp thực tế từ kho/xưởng. Bài có ảnh thật nhận được nhiều tương tác hơn 40%.',
  },
  {
    icon: 'description',
    title: 'Mô tả chi tiết',
    desc: 'Ghi rõ thông số kỹ thuật, MOQ, khu vực giao hàng và chứng từ CO/CQ nếu có.',
  },
  {
    icon: 'sell',
    title: 'Giá minh bạch',
    desc: 'Công khai giá sỉ/lẻ hoặc để "Liên hệ" nếu cần thương lượng. Giá rõ ràng tăng tỉ lệ chốt đơn.',
  },
  {
    icon: 'gpp_maybe',
    title: 'Không spam, không quảng cáo sai mục đích',
    desc: 'Mỗi bài đăng chỉ nên thuộc 1 danh mục. Không đăng lặp lại trong 24h.',
  },
  {
    icon: 'groups',
    title: 'Tương tác văn minh',
    desc: 'Tôn trọng người khác, không công kích cá nhân. Giao dịch an toàn qua nền tảng.',
  },
];

const ForumGuidelines = () => (
  <div className="space-y-4">
    {/* Tiêu đề */}
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
      <div className="mb-3 flex items-center gap-2 text-[#004785]">
        <Icon name="menu_book" size={20} />
        <h3 className="text-sm font-black uppercase tracking-widest">Quy định & Mẹo</h3>
      </div>
      <p className="text-xs leading-relaxed text-slate-600">
        Tuân thủ quy định giúp bài viết của bạn được duyệt nhanh và tiếp cận nhiều khách hàng hơn.
      </p>
    </div>

    {/* Danh sách quy định */}
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <ul className="space-y-4">
        {guidelines.map((item, i) => (
          <li key={i} className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <Icon name={item.icon} size={16} className="text-[#004785]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>

    {/* Lưu ý an toàn giao dịch */}
    <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
      <div className="mb-3 flex items-center gap-2 text-amber-700">
        <Icon name="warning" size={18} />
        <h3 className="text-sm font-black uppercase tracking-widest">Lưu ý an toàn</h3>
      </div>
      <ul className="space-y-2 text-xs leading-relaxed text-amber-800">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
          Kiểm tra kỹ thông tin nhà cung cấp trước khi giao dịch.
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
          Yêu cầu hợp đồng và chứng từ rõ ràng cho đơn hàng lớn.
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
          Không chuyển tiền trước khi xác nhận hàng thực tế.
        </li>
      </ul>
    </div>
  </div>
);

export default ForumGuidelines;
