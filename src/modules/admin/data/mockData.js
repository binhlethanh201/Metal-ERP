export const MOCK_TENANTS = [
  {
    id: 'T-9921',
    name: 'Kim Khí Gia Bảo',
    email: 'giabao@gmail.com',
    role: 'store_owner',
    regDate: '12/05/2026',
    status: 'pending',
    isVerified: false,
  },
  {
    id: 'T-8812',
    name: 'Nhà Cung Cấp Vinsteel',
    email: 'contact@vinsteel.vn',
    role: 'ncc',
    regDate: '10/05/2026',
    status: 'active',
    isVerified: true,
  },
  {
    id: 'T-7721',
    name: 'Đại lý Sắt Thép Miền Tây',
    email: 'mientaysteel@yahoo.com',
    role: 'store_owner',
    regDate: '05/05/2026',
    status: 'suspended',
    isVerified: false,
  },
  {
    id: 'T-9901',
    name: 'Thiết bị Điện Quang Minh',
    email: 'info@quangminh.com',
    role: 'ncc',
    regDate: '14/05/2026',
    status: 'pending',
    isVerified: false,
  },
];

export const MOCK_REPORTS = [
  {
    id: 'REP-101',
    type: 'post',
    reporter: 'Sắt thép Hòa Phát',
    target: 'Cơ khí Nam Định',
    reason: 'Spam nội dung không liên quan (Phá giá thị trường)',
    content:
      'Xả kho cắt lỗ 100 tấn thép cuộn CB240 giá chỉ 10.xxx (giá ảo để câu tương tác), liên hệ ngay để ép giá...',
    date: '13/05/2026',
    status: 'pending',
  },
  {
    id: 'REP-202',
    type: 'dispute',
    reporter: 'Đại lý Kim khí 24h',
    target: 'Tổng kho Inox HN',
    reason: 'Tranh chấp bù trừ: Sai quy cách & Chất lượng',
    content:
      'Thỏa thuận bù trừ 5 tấn Inox 304 tấm ly độ 2.0, nhưng khi nhận hàng thực tế là Inox 201 bị rỉ sét bề mặt và độ dày chỉ 1.8.',
    date: '12/05/2026',
    status: 'investigating',
  },
  {
    id: 'REP-303',
    type: 'post',
    reporter: 'Hệ thống Admin',
    target: 'Thép Miền Nam',
    reason: 'Sai danh mục (Đăng bán máy khoan cũ trong mục Sắt hình)',
    content:
      'Thanh lý lô máy khoan cầm tay Bosch cũ, hàng bãi Nhật còn mới 80%, giá công khai 500k...',
    date: '11/05/2026',
    status: 'resolved',
  },
  {
    id: 'REP-404',
    type: 'dispute',
    reporter: 'Xây dựng An Gia',
    target: 'Đúc Thép Việt',
    reason: 'Báo cáo: NCC không gửi CO/CQ đi kèm hàng hóa',
    content:
      'Lô hàng phôi thép vuông 100x100 giao tới công trình thiếu chứng chỉ xuất xưởng và kiểm định chất lượng, xe đang bị kẹt tại cổng.',
    date: '13/05/2026',
    status: 'pending',
  },
];

export const MOCK_SUBSCRIPTIONS = [
  {
    id: 'SUB-001',
    tenantName: 'Kim Khí Gia Bảo',
    plan: 'Premium Plan',
    amount: '15,000,000',
    expiryDate: '20/05/2026',
    status: 'warning',
  },
  {
    id: 'SUB-002',
    tenantName: 'Đại lý Sắt Thép Miền Tây',
    plan: 'Basic Plan',
    amount: '5,000,000',
    expiryDate: '10/06/2026',
    status: 'active',
  },
  {
    id: 'SUB-003',
    tenantName: 'Thiết bị Điện Quang Minh',
    plan: 'Enterprise Plan',
    amount: '50,000,000',
    expiryDate: '15/05/2026',
    status: 'expired',
  },
];

export const MOCK_TRANSACTION_FEES = [
  {
    id: 'TRX-998',
    date: '13/05/2026',
    orderId: 'ORD-B2B-771',
    value: '250,000,000',
    fee: '2,500,000',
    parties: 'Vinsteel ➔ Hòa Phát',
    status: 'collected',
  },
  {
    id: 'TRX-999',
    date: '13/05/2026',
    orderId: 'ORD-B2B-882',
    value: '120,000,000',
    fee: '1,200,000',
    parties: 'Inox HN ➔ Cơ khí ND',
    status: 'pending',
  },
];

export const MOCK_CATEGORIES = [
  { id: 'CAT-01', name: 'Sắt hình & Thép xây dựng', items: 124, lastUpdate: '10/05/2026' },
  { id: 'CAT-02', name: 'Ống nước & Phụ kiện nhựa', items: 85, lastUpdate: '08/05/2026' },
  { id: 'CAT-03', name: 'Dây cáp & Thiết bị điện', items: 210, lastUpdate: '12/05/2026' },
  { id: 'CAT-04', name: 'Đồ bảo hộ lao động', items: 45, lastUpdate: '05/05/2026' },
];

export const MOCK_BROADCASTS = [
  {
    id: 'BC-101',
    title: 'Bảo trì hệ thống nâng cấp AI OCR',
    target: 'Tất cả cửa hàng',
    time: '02:00 AM - 17/05/2026',
    status: 'scheduled',
  },
  {
    id: 'BC-102',
    title: 'Ra mắt tính năng Bù trừ tồn kho tự động',
    target: 'Store Owner & Admin',
    time: '09:00 AM - 10/05/2026',
    status: 'sent',
  },
];
