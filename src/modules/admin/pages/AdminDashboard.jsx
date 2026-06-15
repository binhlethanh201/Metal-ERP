import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const AUDIT_LOGS = [
    {
      time: '19:52:10',
      action: 'Duyệt Đại lý',
      details: 'Cấp trạng thái VERIFIED_OK cho "Kim Khí Gia Bảo"',
      admin: 'Trần Văn B',
      type: 'success',
    },
    {
      time: '19:40:15',
      action: 'Khóa Thảo luận',
      details: 'Khóa comment luồng bài viết giá ảo của "Cơ khí Nam Định"',
      admin: 'Hệ thống (AI)',
      type: 'system',
    },
    {
      time: '19:12:44',
      action: 'Phát Thông báo',
      details: 'Đẩy thông báo khẩn bảo trì hệ thống OCR quý 2',
      admin: 'Nguyễn Văn A',
      type: 'info',
    },
    {
      time: '18:30:22',
      action: 'Phạt Vi phạm',
      details: 'Ẩn bài đăng sai danh mục của shop "Thép Miền Nam"',
      admin: 'Lê Hoàng M',
      type: 'danger',
    },
  ];

  return (
    <div className="space-y-6 text-on-surface">
      {/* MAIN TITLE */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-on-surface">
            Hệ thống Phân tích Chỉ số &amp; Vận hành Lõi
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Giám sát thời gian thực trạng thái phân hệ cửa hàng và luồng thông tin B2B
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-outline-variant">
          <Icon name="download" size={16} /> Xuất Báo Cáo (.CSV)
        </button>
      </div>

      {/* 4 CARDS SỐ LIỆU TỔNG QUAN */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <div>
            <div className="text-sm font-semibold text-on-surface-variant">Shop Đang Hoạt Động</div>
            <div className="mt-2 text-3xl font-black text-on-surface">1,402</div>
          </div>
          <div className="mt-4 w-fit rounded-md bg-tertiary-fixed px-2 py-1 text-xs font-bold text-on-tertiary-fixed-variant">
            +12 mở mới tuần này
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <div>
            <div className="text-sm font-semibold text-on-surface-variant">Doanh Thu Thuê Bao</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-black text-primary">850.5</span>
              <span className="text-sm font-bold text-on-surface-variant">Triệu</span>
            </div>
          </div>
          <div className="mt-4 w-fit rounded-md bg-tertiary-fixed px-2 py-1 text-xs font-bold text-on-tertiary-fixed-variant">
            92% Kế hoạch tháng
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <div>
            <div className="text-sm font-semibold text-on-surface-variant">Báo Cáo Tồn Đọng</div>
            <div className="mt-2 text-3xl font-black text-on-surface">24</div>
          </div>
          <div className="mt-4 w-fit rounded-md bg-surface-container-highest px-2 py-1 text-xs font-bold text-on-surface-variant">
            Cần xử lý trong 24h
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-lg border-l-4 border-outline-variant border-l-error bg-error-container/20 p-5 shadow-sm">
          <div>
            <div className="text-sm font-semibold text-error">Nợ Cước Nguy Hiểm</div>
            <div className="mt-2 text-3xl font-black text-error">03</div>
          </div>
          <div className="mt-4 w-fit rounded-md bg-error-container px-2 py-1 text-xs font-bold text-on-error-container">
            Chờ lệnh đình chỉ
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BOARD */}
      <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4 shadow-sm">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Phím tắt tác vụ nhanh
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2 text-xs font-bold text-on-surface transition-all hover:bg-surface-container-high"
          >
            <Icon name="user_plus" size={14} className="text-primary" /> Duyệt cấp Cửa hàng
          </button>
          <button
            onClick={() => navigate('/admin/notifications')}
            className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2 text-xs font-bold text-on-surface transition-all hover:bg-surface-container-high"
          >
            <Icon name="megaphone" size={14} className="text-error" /> Phát tin khẩn cấp
          </button>
          <button
            onClick={() => navigate('/admin/categories')}
            className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2 text-xs font-bold text-on-surface transition-all hover:bg-surface-container-high"
          >
            <Icon name="folder_plus" size={14} className="text-emerald-700" /> Cập nhật Nhóm hàng
          </button>
          <button
            onClick={() => navigate('/admin/logs')}
            className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2 text-xs font-bold text-on-surface transition-all hover:bg-surface-container-high"
          >
            <Icon name="terminal" size={14} className="text-slate-500" /> Tra cứu Log máy chủ
          </button>
        </div>
      </div>

      {/* CHART & AUDIT LOGS */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* CHART */}
        <section className="flex min-h-[380px] flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between border-b border-surface-container-high pb-2">
            <h3 className="text-base font-bold text-on-surface">
              Phân tích Hiệu suất Doanh thu &amp; Gói cước
            </h3>
            <span className="text-xs font-bold text-primary">Dữ liệu năm 2026</span>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
            {/* MAIN CHART */}
            <div className="flex flex-col rounded-md border border-dashed border-outline-variant bg-surface-container-low p-4 md:col-span-2">
              <span className="mb-2 text-xs font-bold text-on-surface-variant">
                Xu hướng doanh thu thuê bao
              </span>
              <div className="flex flex-1 items-center justify-center text-on-surface-variant/60">
                <div className="text-center">
                  <Icon name="bar_chart_3" size={28} className="mx-auto mb-1 opacity-50" />
                  <p className="text-xs font-medium">[ Biểu đồ miền / Cột Chart.js ]</p>
                </div>
              </div>
            </div>

            {/* SUBCRIPTION */}
            <div className="flex flex-col rounded-md border border-dashed border-outline-variant bg-surface-container-low p-4">
              <span className="mb-2 text-xs font-bold text-on-surface-variant">
                Tỷ trọng Subscription
              </span>
              <div className="flex flex-1 items-center justify-center text-on-surface-variant/60">
                <div className="text-center">
                  <Icon name="pie_chart" size={28} className="mx-auto mb-1 opacity-50" />
                  <p className="text-xs font-medium">[ Biểu đồ tròn ]</p>
                  <div className="mt-3 space-y-1 text-left text-[10px] font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary" /> Enterprise (15%)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-secondary-container" /> Premium (45%)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-outline" /> Basic (40%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AUDIT LOGS */}
        <section className="flex min-h-[380px] flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-4 border-b border-surface-container-high pb-2">
            <h3 className="text-base font-bold text-on-surface">Hoạt động Quản trị gần đây</h3>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {AUDIT_LOGS.map((log, index) => (
              <div
                key={index}
                className="rounded-md bg-surface-container-low p-3 text-xs transition-colors hover:bg-surface-container-high"
              >
                <div className="flex items-center justify-between font-semibold">
                  <span
                    className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${
                      log.type === 'danger'
                        ? 'bg-error-container text-error'
                        : log.type === 'success'
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                          : log.type === 'info'
                            ? 'bg-primary-fixed text-on-primary-fixed-variant'
                            : 'bg-surface-container-highest text-on-surface'
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="text-[11px] font-medium text-on-surface-variant">
                    {log.time}
                  </span>
                </div>
                <p className="mt-1.5 font-medium text-on-surface">{log.details}</p>
                <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-on-surface-variant">
                  <Icon name="user" size={10} /> Thao tác: {log.admin}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
