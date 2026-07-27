import React from 'react';
import Icon from '../../../shared/components/Icon';

const QUICK_ACTIONS = [
  {
    label: 'Hàng hóa',
    description: 'Quản lý danh sách hàng hóa, thêm mới, chỉnh sửa',
    icon: 'inventory_2',
    href: '/inventory/products',
    color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-900/50',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Nhập kho',
    description: 'Tạo phiếu nhập kho, theo dõi lịch sử nhập',
    icon: 'move_to_inbox',
    href: '/inventory/import',
    color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Xuất kho',
    description: 'Tạo phiếu xuất kho, quản lý đơn xuất',
    icon: 'outbox',
    href: '/inventory/export',
    color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:hover:bg-orange-900/50',
    iconColor: 'text-orange-600',
  },
  {
    label: 'Kiểm kê kho',
    description: 'Tạo phiếu kiểm kê, đối soát tồn kho thực tế',
    icon: 'assignment',
    href: '/inventory/inventory-check',
    color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:hover:bg-purple-900/50',
    iconColor: 'text-purple-600',
  },
  {
    label: 'Nhà cung cấp',
    description: 'Quản lý nhà cung cấp và công nợ',
    icon: 'local_shipping',
    href: '/inventory/suppliers',
    color: 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/50',
    iconColor: 'text-rose-600',
  },
  {
    label: 'Báo cáo',
    description: 'Xem báo cáo kho và tổng hợp số liệu',
    icon: 'assessment',
    href: '/inventory/reports',
    color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-950/30 dark:text-cyan-400 dark:hover:bg-cyan-900/50',
    iconColor: 'text-cyan-600',
  },
];

const InventoryDashboard = () => {
  const [greeting] = React.useState(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pb-8">
      {/* Header greeting */}
      <div className="rounded-2xl bg-gradient-to-br from-[#004785] to-blue-700 p-8 text-white shadow-lg">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{greeting}</h1>
            <p className="mt-2 text-blue-100">
              Chào mừng bạn đến với hệ thống quản lý kho. Chọn một tác vụ để bắt đầu làm việc.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-5 py-3 backdrop-blur-sm">
            <Icon name="inventory_2" size={28} className="text-blue-200" />
            <div>
              <p className="text-sm font-semibold text-blue-100">Kho hàng</p>
              <p className="text-lg font-bold">MEP SYSTEM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions grid */}
      <div>
        <h2 className="mb-5 text-lg font-bold text-slate-800 dark:text-[#e5e5e5]">Tác vụ nhanh</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={`group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all ${action.color.replace(/hover:.*$/, '').trim()} hover:-translate-y-0.5 hover:shadow-md dark:border-[#333333] dark:bg-[#1a1a1a]`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${action.iconColor}`}
              >
                <Icon name={action.icon} size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-inherit dark:text-[#e5e5e5]">
                  {action.label}
                </h3>
                <p className="mt-1 text-sm text-slate-500 group-hover:text-inherit dark:text-[#999999]">
                  {action.description}
                </p>
              </div>
              <Icon
                name="chevron_right"
                size={20}
                className="mt-2 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 dark:text-[#666666]"
              />
            </a>
          ))}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a]">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
            <Icon name="lightbulb" size={20} className="text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-[#e5e5e5]">Mẹo sử dụng</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-[#b3b3b3]">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
              Sử dụng bộ lọc để tìm kiếm hàng hóa nhanh chóng
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
              Tạo phiếu nhập kho khi hàng về đến kho
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
              Kiểm kê định kỳ để đảm bảo số liệu tồn kho chính xác
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a]">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
            <Icon name="verified_user" size={20} className="text-emerald-600" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-[#e5e5e5]">Quy trình chuẩn</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-[#b3b3b3]">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              Nhập kho → Cập nhật tồn kho tự động
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              Xuất kho → Trừ tồn kho real-time
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              Kiểm kê → Đối chiếu chênh lệch
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a]">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/30">
            <Icon name="forum" size={20} className="text-amber-600" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-[#e5e5e5]">Hỗ trợ</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-[#b3b3b3]">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              Gặp vấn đề? Liên hệ quản lý để được hỗ trợ
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              Xem hướng dẫn sử dụng chi tiết tại menu Trợ giúp
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              Phản hồi góp ý để cải thiện hệ thống
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
