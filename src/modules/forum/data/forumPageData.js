/**
 * Mock data TẬP TRUNG cho TẤT CẢ các page Forum.
 * Gồm: homePosts, discussionThreads, supplySourcePosts, trendsTopProducts, createPostTypes...
 * Mỗi page import alias về tên ngắn (vd: homePosts as posts).
 */
/**
 * Mock data tập trung cho toàn bộ Forum Module
 * Mọi dữ liệu ảo của tất cả các page đều nằm ở đây
 */

/* ========== ForumHome ========== */
export const homePosts = [
  {
    id: 1,
    author: 'Minh Nguyễn',
    role: 'Chuyên gia',
    roleClass: 'bg-blue-100 text-[#004785]',
    time: '2 giờ trước',
    status: 'Nổi bật',
    statusClass: 'bg-green-50 text-green-700',
    tab: 'Nổi bật',
    title: 'Có nên nhập thêm sơn chống thấm KOVA cho mùa mưa năm nay?',
    description:
      'Tôi đang cân nhắc việc tăng 30% lượng tồn kho cho dòng KOVA CT-11A Gold. Theo dự báo thời tiết thì mùa mưa năm nay kéo dài...',
    tags: ['#kim_khi', '#son_chong_tham'],
    comments: 24,
    views: '1.2k',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZWykIdoBcv3hsnrKrDb3I7RuCyGP1qMnHJzwNnpJqntdhAzj56h6-hgnP0JTtExf8a2WnsZH5IS-kdCNnP-XwjuWJrxhCGBnFSDLwFurTw2WyvXX7gUYnYAMIt-_G4km8LP68TP9n14ZRtnurgMrgJln-DtPJvZZ0bU-ocmMejXjNuVvnOcVouGnokgdNy4bHi5CDv_c8hIi3jbRioAowGvaIPhwEMr4vUE7Sy9gjTw15nDdRPttPFXdhN_f6NjszHkYucdmZAqCY',
  },
  {
    id: 2,
    author: 'Lan Anh',
    role: 'Nhà bán hàng',
    roleClass: 'bg-slate-100 text-slate-600',
    time: '5 giờ trước',
    status: 'Mới',
    statusClass: 'bg-orange-50 text-orange-700',
    tab: 'Mới nhất',
    title: 'Tìm đại lý keo dán gạch Weber khu vực miền Trung',
    description:
      'Cửa hàng mình đang cần tìm nguồn hàng Weber chính ngạch, chiết khấu tốt cho đơn hàng lớn. Ae nào đang làm đại lý hoặc có contact...',
    tags: ['#gia_si', '#keo_dan_gach'],
    comments: 8,
    views: '456',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCwn57sYKJ4x9dol__RYMVwM3H1yt7Kz-lnw17fAFH5wQ6czVBRC7JQDbA-GbZzZYuDtwUXBm9bCM8SdRkXP9x1s2g2Vm1KdH2t4fCgX0wFteum7_-swPIdrWnmdVeJuz1pcMos4g732-27Piwx59PbdTsYD-RLxrksdx6SWFVxPumNVqm-CLTcJTTKT7x1rntPejnh0mPaCATzRUmm2oaVhc80iuZHWgGTOu7YVpp1xP_jcAZEwi7JSKmqHQ6gqjbZq6fpmHv6BFdS',
  },
  {
    id: 3,
    author: 'Hoàng Nam',
    role: 'Thành viên',
    roleClass: 'bg-slate-100 text-slate-600',
    time: '8 giờ trước',
    tab: 'Được quan tâm',
    title: 'Chia sẻ kinh nghiệm quản lý kho hơn 1500 mã hàng vật tư',
    description:
      'Việc quản lý nhiều mã hàng nhỏ như ốc vít, long đền thường gây thất thoát. Tôi xin chia sẻ quy trình 5 bước áp dụng mã vạch...',
    tags: ['#quan_ly_kho', '#kinh_nghiem'],
    comments: 32,
    views: '2.1k',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAjYqYBGkR_Iadb7O3sIeQNtpWqJ9ThFzKm9BOnEoOjeAE90A3wKJFFf_2bunkuTYMCqxG-rZhI2sPranFao-yWEOh0ApqhjfAAZbuje4uAJVypcId7wA_hljomIOwQcSCCah1Fy-OvCW8q4Fu_GOKEK8rcUHnVgFEuCEYDJGKLI7qI0pVrjInnAhtDOJTjOxgm3_qIjxQV1OQT-PS9-tSwqZFR6TBj4W3czn_RYk-psKet5iM85xrN2qNW9iI1H_BG-KYPwDIYPCHf',
  },
  {
    id: 4,
    author: 'Văn Hùng',
    role: 'Cảnh báo',
    roleClass: 'bg-red-50 text-red-600',
    time: '12 giờ trước',
    tab: 'Được quan tâm',
    title: 'Cảnh báo lô hàng máy khoan giả Makita tràn lan thị trường',
    description:
      'Hiện nay khu vực miền Bắc đang xuất hiện nhiều lô hàng máy khoan pin giả tem mác Makita với giá chỉ bằng 1/3 hàng thật...',
    tags: ['#canh_bao', '#dung_cu_dien'],
    comments: 112,
    views: '5.4k',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZWykIdoBcv3hsnrKrDb3I7RuCyGP1qMnHJzwNnpJqntdhAzj56h6-hgnP0JTtExf8a2WnsZH5IS-kdCNnP-XwjuWJrxhCGBnFSDLwFurTw2WyvXX7gUYnYAMIt-_G4km8LP68TP9n14ZRtnurgMrgJln-DtPJvZZ0bU-ocmMejXjNuVvnOcVouGnokgdNy4bHi5CDv_c8hIi3jbRioAowGvaIPhwEMr4vUE7Sy9gjTw15nDdRPttPFXdhN_f6NjszHkYucdmZAqCY',
  },
  {
    id: 5,
    author: 'Thu Hương',
    role: 'Nhà bán hàng',
    roleClass: 'bg-slate-100 text-slate-600',
    time: '1 ngày trước',
    tab: 'Chưa trả lời',
    title: 'Cần tư vấn mở rộng cửa hàng sang mảng điện dân dụng',
    description:
      'Cửa hàng kim khí của gia đình tôi đang hoạt động ổn định, muốn nhập thêm dây điện, ổ cắm. Nên chọn thương hiệu nào ổn...',
    tags: ['#tu_van', '#thiet_bi_dien'],
    comments: 0,
    views: '890',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCwn57sYKJ4x9dol__RYMVwM3H1yt7Kz-lnw17fAFH5wQ6czVBRC7JQDbA-GbZzZYuDtwUXBm9bCM8SdRkXP9x1s2g2Vm1KdH2t4fCgX0wFteum7_-swPIdrWnmdVeJuz1pcMos4g732-27Piwx59PbdTsYD-RLxrksdx6SWFVxPumNVqm-CLTcJTTKT7x1rntPejnh0mPaCATzRUmm2oaVhc80iuZHWgGTOu7YVpp1xP_jcAZEwi7JSKmqHQ6gqjbZq6fpmHv6BFdS',
  },
];

export const homeTabs = ['Nổi bật', 'Mới nhất', 'Chưa trả lời', 'Được quan tâm'];

export const homeTrendSearches = [
  { label: 'Sơn KOVA', value: '+35%', width: '85%' },
  { label: 'Weber Adhesive', value: '+22%', width: '65%' },
];

export const homeTopicTags = ['#kim_khi', '#nguon_hang', '#gia_si', '#keo_dan_gach'];

export const homeHotPosts = [
  { title: 'Quản lý kho 1000 mã hàng hiệu quả', comments: '82 bình luận' },
  { title: 'Cảnh báo lô hàng vít thạch cao giả...', comments: '56 bình luận' },
];

/* ========== ForumDiscussion ========== */
export const discussionTabs = ['Mới nhất', 'Nổi bật'];

export const discussionThreads = [
  {
    id: 1,
    author: 'Trần Văn Hoàng',
    time: '15 phút trước',
    category: 'Kỹ thuật',
    categoryClass: 'bg-orange-50 text-orange-600',
    title: 'Làm thế nào để phân biệt Inox 304 và Inox 201 chuẩn nhất bằng phương pháp thủ công?',
    description:
      'Hiện tại thị trường đang có rất nhiều loại bu lông inox gắn mác 304 nhưng chất lượng không đồng đều. Anh em có kinh nghiệm nào test nhanh bằng hóa chất hoặc nam châm mà chính xác không ạ?',
    tags: ['#inox304', '#kythuat', '#bulong'],
    comments: '24 bình luận',
    views: '1.2k lượt xem',
    trending: true,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB7q0UeyjkmVy04LF7tf5IA0ygKOw2S_vmOCkwCiXBrQfV4j9kPFOsXFxfzjdt4i3-ckzsX5RrdHr3KhVUQgrrbDPhNWmism_mk-ExVFrfK7u7FTS3Ic3Y7MzINxNvtmyfdL4ATFPv0zt1IBynDrLVb0tABvI2lk6dB0grlwTJbKrYhVmFRgXeadptejbxFOZ731PmbzcnwFXmFx0MZmW7qvgsvNvGwe97svkGokZhOcQLW66PA7fde14LdktF4mhUtdcOqnkhn2Apf',
  },
  {
    id: 2,
    author: 'Quốc Mạnh Hardware',
    time: '2 giờ trước',
    category: 'Thị trường',
    categoryClass: 'bg-emerald-50 text-emerald-600',
    title: 'Dự báo giá thép và phụ kiện kim khí cuối năm 2024 - Có nên ôm hàng thời điểm này?',
    description:
      'Tình hình biến động giá nguyên liệu đang khá phức tạp. Theo các bác đại lý lớn, liệu giá sẽ còn giảm sâu nữa hay sẽ bật tăng trở lại vào quý 4?',
    tags: ['#giathep', '#thitruong', '#kinhdoanh'],
    comments: '56 bình luận',
    views: '3.5k lượt xem',
    avatarInitials: 'QM',
    trending: true,
  },
  {
    id: 3,
    author: 'Kim Khí Hòa Phát',
    time: '5 giờ trước',
    category: 'Quản lý',
    categoryClass: 'bg-violet-50 text-violet-600',
    title: 'Kinh nghiệm sử dụng phần mềm quản lý kho cho đại lý kim khí vừa và nhỏ',
    description:
      'Cửa hàng em hàng nghìn mã hàng lặt vặt (ốc vít, long đền, mũi khoan...), kiểm kho đuối quá. Các bác đang dùng phần mềm nào ổn định, dễ dùng cho nhân viên không?',
    tags: ['#quanlykho', '#phanmem', '#cuahang'],
    comments: '12 bình luận',
    views: '890 lượt xem',
    trending: false,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuARQdi4aUjEhq51ggqlTnuIcc0VpZNbVIyHq4o-nUM6ns5h_jkW35Ra6TTnsOx3cehJ3sFf30Lp9e4PaJnKStpqcBTntpjUcjwVxXEoI6Vz0On3t1TGWljo1rJiq5cYi0UZ6oIakFojxDUFOJtMOTeSXTJXpmBo3by3LDxJRP0E6-wjhBjR9v9YY7_piKxZSNoFajlnkWeMP_VWpDxElb6Z2H-yZAS-xyw2XwCdkRlxsGdsxrTwmMqijimScpWn8O6nKEoXuN1WrMPx',
  },
];

export const discussionHotTopics = [
  {
    title: 'Mẹo tăng tuổi thọ cho các dòng máy khoan pin cầm tay',
    meta: '42 phản hồi',
    time: '1 giờ trước',
  },
  {
    title: 'Phân biệt đại lý cấp 1 và nhà phân phối độc quyền',
    meta: '28 phản hồi',
    time: '3 giờ trước',
  },
  {
    title: 'Quy trình nhập khẩu kim khí từ Trung Quốc năm 2024',
    meta: '115 phản hồi',
    time: '5 giờ trước',
  },
];

/* ========== ForumSupply ========== */
export const supplyTabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'source', label: 'Tìm nguồn hàng' },
  { id: 'liquidation', label: 'Thanh lý kho' },
  { id: 'group-buy', label: 'Mua chung' },
  { id: 'wholesale', label: 'Bán giá sỉ' },
];

export const supplyCategoryOptions = ['Tất cả Kim khí', 'Bulong - Ốc vít', 'Dụng cụ cầm tay'];
export const supplyRegionOptions = ['Toàn quốc', 'Hà Nội', 'TP. Hồ Chí Minh'];

export const supplySourcePosts = [
  {
    id: 1,
    type: 'Bán sỉ',
    typeTone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    author: 'Công ty Kim Khí Hòa Phát',
    role: 'Nhà bán hàng',
    verified: true,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuARQdi4aUjEhq51ggqlTnuIcc0VpZNbVIyHq4o-nUM6ns5h_jkW35Ra6TTnsOx3cehJ3sFf30Lp9e4PaJnKStpqcBTntpjUcjwVxXEoI6Vz0On3t1TGWljo1rJiq5cYi0UZ6oIakFojxDUFOJtMOTeSXTJXpmBo3by3LDxJRP0E6-wjhBjR9v9YY7_piKxZSNoFajlnkWeMP_VWpDxElb6Z2H-yZAS-xyw2XwCdkRlxsGdsxrTwmMqijimScpWn8O6nKEoXuN1WrMPx',
    time: '2 giờ trước • Hoạt động: 10 phút trước',
    title: 'Có sẵn sơn chống thấm KOVA giá sỉ tại Hà Nội - Phân phối chính hãng trực tiếp từ kho',
    description:
      'Chúng tôi đang có sẵn số lượng lớn sơn chống thấm KOVA CT-11A Plus. Đầy đủ chứng từ CO/CQ, chiết khấu cực cao cho đại lý cấp 1 và dự án. Hỗ trợ vận chuyển tận nơi trong khu vực nội thành Hà Nội...',
    tags: ['#kova', '#sonchongtham', '#vatlieuxaydung'],
    product: {
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBiel9GwmnPjFm4zfDn7QDl-J4rLzmp5w9Biauziay64vPltf76_Pseuy15TGug3gNWQaO_RmG4a1v_1wNP7aLb_RO10op3NYbgU4utqlKHCrNPTqjQs2GXS66w6XIlFLFHhXGrCYW5p_nKfhpyjMSHKZCqEswt8DbTKJzekwqFPu2NLZbh-o8NARIeJEKS6vJGEMoJcJQYjOk1wiby4PHJ3akZ5XM7fMTbkqKaD6BxO18usBVnQmUY6cmZq3OIA4lzV1KDME9DSLl8',
      name: 'KOVA CT-11A Plus 20kg',
      price: '1.250k - 1.450k',
      moq: '10 thùng / Hà Nội',
      status: 'Còn hàng',
    },
    stats: [
      { label: '12', icon: 'forum' },
      { label: 'Lưu bài', icon: 'bookmark' },
    ],
  },
  {
    id: 2,
    type: 'Tìm nguồn',
    typeTone: 'bg-orange-50 text-orange-700 border-orange-100',
    author: 'Đại lý Tiến Mạnh',
    role: 'Nhà mua hàng',
    verified: true,
    avatarInitials: 'DT',
    time: '5 giờ trước • Hoạt động: 1 giờ trước',
    title: 'Cần tìm xưởng gia công Bulong neo M24 số lượng lớn tại Long An',
    description:
      'Đại lý chúng tôi đang cần tìm xưởng sản xuất trực tiếp có khả năng gia công Bulong neo M24x800, mạ kẽm nhúng nóng. Số lượng đợt 1 khoảng 5.000 bộ. Yêu cầu báo giá xuất xưởng...',
    meta: [
      { label: '245', icon: 'visibility' },
      { label: '8 phản hồi', icon: 'forum' },
    ],
  },
];

export const supplyNewSourcePosts = [
  {
    id: 1,
    title: 'Máy khoan pin Bosch GSB 18V-50 - Hàng về ngập kho',
    author: 'Đại lý Thành Công',
    time: '5 phút trước',
  },
  {
    id: 2,
    title: 'Xả kho đá cắt Hải Dương 100mm giá cực sốc',
    author: 'Kim khí Miền Bắc',
    time: '18 phút trước',
  },
  {
    id: 3,
    title: 'Sỉ kìm điện Kapusi Nhật Bản chính hãng chiết khấu 35%',
    author: 'Đồ nghề Pro',
    time: '42 phút trước',
  },
];

export const supplyFeaturedSale = {
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBP2YJaSR1my1URY7L7QzHpee2Fsc2xTOYRuuoyL6p_1eeRhRG-ZgFjKcJAh9PwEj1h30bFRMkLYL3jpITmABAWFcve4I4erbV9YYuhuvAqdumTvip7ERuH2wq27kz4mDDdVjAEBws6HB1MgtQjvMgAEWuUBd5oQC739V4qGqR_9UHd7utmLf7ODqoLMD42a3RHn5uAj_skoZGUeqw5xtG9dP8Zd-azQixlxDccLiB0Xd2tSoYStI80DMZuBjQIwYed7q4K7n5dRPgp',
  title: 'Hệ thống Bulong Ốc vít Tiêu chuẩn DIN',
  description: 'VinFast Hardware - Miễn phí vận chuyển cho đơn sỉ trên 50 triệu.',
};

/* ========== ForumTrends ========== */
export const trendsTopProducts = [
  {
    title: 'Máy khoan pin Makita 18V',
    market: 'Sức mua: Hà Nội • 200 shop quan tâm',
    percent: '+65%',
    demand: 55,
    season: 30,
    priceShare: 15,
    tip: 'Nhập 20–30 sản phẩm, giá đang tăng',
    referencePrice: '3.200.000đ',
  },
  {
    title: 'Sơn chống thấm KOVA CT-11A',
    market: 'Sức mua: Toàn quốc • 310 shop quan tâm',
    percent: '+55%',
    demand: 70,
    season: 20,
    priceShare: 10,
    tip: 'Nhập 30–50 thùng, mùa mưa kéo dài',
    referencePrice: '1.250.000đ',
  },
  {
    title: 'Dây điện Cadivi 2.5mm',
    market: 'Sức mua: Toàn quốc • 260 shop quan tâm',
    percent: '+48%',
    demand: 58,
    season: 22,
    priceShare: 20,
    tip: 'Nhập 500–1000m, giá ổn định',
    referencePrice: '8.500đ/m',
  },
  {
    title: 'Bộ lục giác Chrome-Vanadium',
    market: 'Sức mua: Toàn quốc • 120 shop quan tâm',
    percent: '+42%',
    demand: 60,
    season: 25,
    priceShare: 15,
    tip: 'Nhập 15–25 bộ',
    referencePrice: '185.000đ',
  },
  {
    title: 'Kìm bấm cos thủy lực',
    market: 'Sức mua: TP.HCM • 85 shop quan tâm',
    percent: '+38%',
    demand: 45,
    season: 40,
    priceShare: 15,
    tip: 'Nhập 10–15 sản phẩm',
    referencePrice: '1.850.000đ',
  },
  {
    title: 'Máy cắt sắt Makita 14 inch',
    market: 'Sức mua: Toàn quốc • 150 shop quan tâm',
    percent: '+33%',
    demand: 48,
    season: 38,
    priceShare: 14,
    tip: 'Nhập 5–10 máy, nhu cầu xây dựng tăng',
    referencePrice: '4.500.000đ',
  },
  {
    title: 'Ống thép mạ kẽm D60',
    market: 'Sức mua: Miền Bắc • 95 shop quan tâm',
    percent: '+28%',
    demand: 50,
    season: 35,
    priceShare: 15,
    tip: 'Nhập 50–100 cây, mùa xây dựng cao điểm',
    referencePrice: '280.000đ',
  },
  {
    title: 'Keo dán gạch Weber',
    market: 'Sức mua: Miền Nam • 88 shop quan tâm',
    percent: '+25%',
    demand: 52,
    season: 28,
    priceShare: 20,
    tip: 'Nhập 100–200 bao, giá đang giảm nhẹ',
    referencePrice: '95.000đ',
  },
  {
    title: 'Bulong inox 304 M12',
    market: 'Sức mua: TP.HCM • 78 shop quan tâm',
    percent: '+18%',
    demand: 40,
    season: 25,
    priceShare: 35,
    tip: 'Giá ổn định, nhập đều hàng tháng',
    referencePrice: '2.500đ',
  },
  {
    title: 'Mũi khoan bê tông Bosch',
    market: 'Sức mua: Hà Nội • 65 shop quan tâm',
    percent: '+15%',
    demand: 35,
    season: 43,
    priceShare: 22,
    tip: 'Nhập 20–30 bộ, nhu cầu ổn định',
    referencePrice: '45.000đ',
  },
];

export const trendsTrendProducts = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCOhDh5_pTo2uI5k89QcHwi-UOzrY-VLkP5MQ7b5ja0zqPHk9G7yzwPtVou3-oZu4K2gaVOrYNuuCBsynJSVS2qHqA7oJsSJ5zgSsFLSRefbn0-tTlGbiCpc-p9Syq4x01mTseB8v-V4m6vyqx3xbMbvICX06kvB5qAiWbqKT1dogXnTsZeS8obxK0yE-5_8YxlGt-E3IZN2vabJweuaABHmKjwB79YNzV5FP1QUWHsYI16tu1KbT3VGzKNks66DvsvnjA9COtQcl7g',
    badge: '+35% Tăng trưởng',
    area: 'Khu vực: Hà Nội / TP.HCM',
    title: 'Sơn chống thấm KOVA CT-11A Gold',
    tags: ['#kim_khi', '#vat_tu_xay_dung'],
    price: '850k – 950k',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASFDg0zUn1Bu4MMXniXu2pblrP5gXI0UyUAacU5ecu8QtqfNPPIU46ctcOgIlGtF-dnFg-xjeavs_ie0kiKHgYjUnKxGoFuCAw01ENI5hfVVgLrXStNd1DtP3Zxrl_GmXwuA5R3POpfntW79m3wbUVPSW0ogu5DY5JXMPVLT8d01qr5Frx11uY-JMn_85Pw5JJhh1zc1SwfIirxUoU6MpeFEwedKTt6unLqYi6XXsyKDhf14fMvfCdN8vWyDx54wSCgqnLjPYnT2QU',
    badge: '+28% Tăng trưởng',
    area: 'Khu vực: Toàn quốc',
    title: 'Bộ vít Inox 304 đa dụng (Hộp 500pcs)',
    tags: ['#oc_vit', '#co_khi'],
    price: '320k – 380k',
  },
];

export const trendsQuickTrends = [
  { name: 'Khoan pin 24V', icon: 'bolt', percent: '+124%', tone: 'secondary-container' },
  { name: 'Vòi sen inox 304', icon: 'water_drop', percent: '+56%', tone: 'primary-container' },
  { name: 'Búa cán nhựa', icon: 'construction', percent: '+32%', tone: 'tertiary-container' },
];

export const trendsPopularTags = ['#kim_khi', '#gia_si', '#dien_dan_tho'];

/* ========== CreatePost ========== */
export const createPostTypes = [
  { key: 'wholesale', icon: 'storefront', label: 'Đăng bán sỉ' },
  { key: 'supply', icon: 'search_insights', label: 'Tìm nguồn hàng' },
  { key: 'quote', icon: 'request_quote', label: 'Hỏi giá' },
  { key: 'trend', icon: 'trending_up', label: 'Thanh lý kho' },
  { key: 'trusted', icon: 'verified', label: 'Mua chung' },
];

export const createPostCategoryOptions = [
  'Vật liệu xây dựng',
  'Thiết bị điện',
  'Kim khí',
  'Máy móc công nghiệp',
];

export const createPostInitialSpecs = [
  { id: 1, name: 'Độ phủ lý thuyết', value: '' },
  { id: 2, name: 'Thời gian khô', value: '' },
  { id: 3, name: 'Quy cách đóng gói', value: '' },
];

export const createPostTrustedPreset = {
  title: 'Cung cấp thép xây dựng Hòa Phát số lượng lớn tại TP.HCM',
  category: 'Vật liệu xây dựng',
  area: 'TP.HCM & Miền Tây',
  content:
    'Chúng tôi chuyên cung cấp các dòng thép cuộn, thép cây thương hiệu Hòa Phát với đầy đủ chứng chỉ CO/CQ. Năng lực cung ứng lên đến 1000 tấn/tháng...',
  tags: ['kim_khi', 'son_chong_tham'],
};

export const createPostSampleImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAVGxDaomtTUeAkSwJJr9wuZJaUKXCYvUplrHvbQVvfUcLNpkFdXbP7ik9P83z9pr3LRQYDkpBF9qAfxiSF5a64K2dn1ofuPHmpybpIR_sMMyyupGxN8iKxYCFPU4DBIU6_HDe4PvQJIBlFS9Bu5XOSiW_G-Dba0QA-polMr4uIiNEw2_fGY720PpxBiwFw7Y0mgQxDuTuF7MrzilniYC0m2Am_d8g8nqNt1lAjVuDhh_W7_RMDti4e-fzKytKWAsBVjzgRkYMY8gR6';

export const createPostQuoteProduct = {
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCnlusiF-0mwfqkYdH0Ya89uKwxkBZX147xtpYw71fYXzOy4qptu-Sm8CDlIJoUfGn_lWw7dqO_7nzMjOe_6YDEB-bGW8uxp0jaq5vOSQuBzLoBeO2qlG3z3MjrSH_d8VxQUmWjdJU68n6X4v8cYeHZEgYpqXXO3dElv2VkAdoGWLFiDk49dQT0e2UknM-al4qT43Ltyr7dkrvUscsva9PYy0ZCaN43LCSlf-qMrS3-VSY4twU07U2fVEikvrsLQSq-7HO1rlhkLG4W',
  name: 'Máy khoan động lực Bosch GSB 13 RE',
  description: 'Máy khoan chuyên dụng công suất cao, thiết kế nhỏ gọn phù hợp thi công công trình.',
  sku: 'BOS-GSB-13',
  supplier: 'Bosch Vietnam',
};

/* ========== My Posts ========== */
export const myPostsTabs = ['Đã đăng', 'Chờ duyệt', 'Nháp', 'Đã ẩn'];

export const myPosts = [
  {
    id: 101,
    author: 'Nguyễn Văn An',
    role: 'Nhà phân phối',
    roleClass: 'bg-blue-100 text-[#004785]',
    time: '2 giờ trước',
    status: 'Đã đăng',
    statusClass: 'bg-green-50 text-green-700',
    tab: 'Đã đăng',
    title: 'Cung cấp thép xây dựng Hòa Phát số lượng lớn tại TP.HCM',
    description:
      'Chúng tôi chuyên cung cấp các dòng thép cuộn, thép cây thương hiệu Hòa Phát với đầy đủ chứng chỉ CO/CQ. Năng lực cung ứng lên đến 1000 tấn/tháng, giao hàng tận nơi trong vòng 24h.',
    tags: ['#kim_khi', '#son_chong_tham', '#gia_si'],
    comments: 24,
    views: '1.2k',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4I6w_ItLfuYmY_1AfuhlHvLjjxOGbzBCUPzNC0NMjVqIJ2rL752szrVKiipMNHjUpYrtvuNViqdd0hHjkOeeQUq_uwN61EpST_-wKJU4xa7zcDpdJmrS4kQKXyn7Q8BxwbWTegPTH7QS9-bn4SONcdseIhWos53ZtwU0h8UG5xF4klqJktolGinrB26apa8551CH8P6ahSuw0tjpEk9Mc1QOmfy-PrhzzlZJPoE86Y7Y_zZF0RYvokngEIVX3R1fAfS_0NJenw_HV',
  },
  {
    id: 102,
    author: 'Nguyễn Văn An',
    role: 'Nhà phân phối',
    roleClass: 'bg-blue-100 text-[#004785]',
    time: '5 giờ trước',
    status: 'Đã đăng',
    statusClass: 'bg-green-50 text-green-700',
    tab: 'Đã đăng',
    title: 'Sơn chống thấm KOVA CT-11A Gold - Hàng có sẵn giá sỉ cực tốt',
    description:
      'Sơn KOVA là dòng sơn chống thấm cao cấp số 1 Việt Nam hiện nay. Với ưu điểm chống thấm tuyệt đối, ngăn chặn nấm mốc, bền màu với thời gian.',
    tags: ['#son_chong_tham', '#gia_si'],
    comments: 18,
    views: '856',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4I6w_ItLfuYmY_1AfuhlHvLjjxOGbzBCUPzNC0NMjVqIJ2rL752szrVKiipMNHjUpYrtvuNViqdd0hHjkOeeQUq_uwN61EpST_-wKJU4xa7zcDpdJmrS4kQKXyn7Q8BxwbWTegPTH7QS9-bn4SONcdseIhWos53ZtwU0h8UG5xF4klqJktolGinrB26apa8551CH8P6ahSuw0tjpEk9Mc1QOmfy-PrhzzlZJPoE86Y7Y_zZF0RYvokngEIVX3R1fAfS_0NJenw_HV',
  },
  {
    id: 103,
    author: 'Nguyễn Văn An',
    role: 'Nhà phân phối',
    roleClass: 'bg-blue-100 text-[#004785]',
    time: '1 ngày trước',
    status: 'Đã đăng',
    statusClass: 'bg-green-50 text-green-700',
    tab: 'Đã đăng',
    title: 'Cần tìm nguồn hàng ống thép mạ kẽm - số lượng lớn giao Hà Nội',
    description:
      'Cửa hàng mình đang cần tìm nguồn ống thép mạ kẽm các loại, số lượng đặt hàng 50 tấn/tháng. Yêu cầu có CO/CQ đầy đủ, giá cạnh tranh.',
    tags: ['#ong_thep', '#ma_kem', '#tim_nguon'],
    comments: 12,
    views: '640',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4I6w_ItLfuYmY_1AfuhlHvLjjxOGbzBCUPzNC0NMjVqIJ2rL752szrVKiipMNHjUpYrtvuNViqdd0hHjkOeeQUq_uwN61EpST_-wKJU4xa7zcDpdJmrS4kQKXyn7Q8BxwbWTegPTH7QS9-bn4SONcdseIhWos53ZtwU0h8UG5xF4klqJktolGinrB26apa8551CH8P6ahSuw0tjpEk9Mc1QOmfy-PrhzzlZJPoE86Y7Y_zZF0RYvokngEIVX3R1fAfS_0NJenw_HV',
  },
  {
    id: 104,
    author: 'Nguyễn Văn An',
    role: 'Nhà phân phối',
    roleClass: 'bg-blue-100 text-[#004785]',
    time: '2 phút trước',
    status: 'Chờ duyệt',
    statusClass: 'bg-amber-50 text-amber-700',
    tab: 'Chờ duyệt',
    title: 'Thanh lý lô bulong neo M24 - hàng tồn kho giá rẻ bất ngờ',
    description:
      'Cần thanh lý gấp lô bulong neo M24 nhúng kẽm nóng, số lượng 5000 con. Giá thanh lý chỉ bằng 60% giá thị trường.',
    tags: ['#bulong', '#thanh_ly', '#gia_soc'],
    comments: 0,
    views: '0',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4I6w_ItLfuYmY_1AfuhlHvLjjxOGbzBCUPzNC0NMjVqIJ2rL752szrVKiipMNHjUpYrtvuNViqdd0hHjkOeeQUq_uwN61EpST_-wKJU4xa7zcDpdJmrS4kQKXyn7Q8BxwbWTegPTH7QS9-bn4SONcdseIhWos53ZtwU0h8UG5xF4klqJktolGinrB26apa8551CH8P6ahSuw0tjpEk9Mc1QOmfy-PrhzzlZJPoE86Y7Y_zZF0RYvokngEIVX3R1fAfS_0NJenw_HV',
  },
  {
    id: 105,
    author: 'Nguyễn Văn An',
    role: 'Nhà phân phối',
    roleClass: 'bg-blue-100 text-[#004785]',
    time: '3 ngày trước',
    status: 'Nháp',
    statusClass: 'bg-slate-100 text-slate-600',
    tab: 'Nháp',
    title: '[Nháp] Cung cấp phụ kiện điện công nghiệp Schneider Electric',
    description:
      'Bảng giá mới nhất tháng 6/2026 cho các dòng MCCB, MCB, Contactor Schneider. Hàng chính hãng nhập khẩu trực tiếp.',
    tags: ['#dien_cong_nghiep', '#Schneider', '#phu_kien'],
    comments: 0,
    views: '12',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4I6w_ItLfuYmY_1AfuhlHvLjjxOGbzBCUPzNC0NMjVqIJ2rL752szrVKiipMNHjUpYrtvuNViqdd0hHjkOeeQUq_uwN61EpST_-wKJU4xa7zcDpdJmrS4kQKXyn7Q8BxwbWTegPTH7QS9-bn4SONcdseIhWos53ZtwU0h8UG5xF4klqJktolGinrB26apa8551CH8P6ahSuw0tjpEk9Mc1QOmfy-PrhzzlZJPoE86Y7Y_zZF0RYvokngEIVX3R1fAfS_0NJenw_HV',
  },
  {
    id: 106,
    author: 'Nguyễn Văn An',
    role: 'Nhà phân phối',
    roleClass: 'bg-blue-100 text-[#004785]',
    time: '1 tuần trước',
    status: 'Đã ẩn',
    statusClass: 'bg-red-50 text-red-600',
    tab: 'Đã ẩn',
    title: '[Đã ẩn] Tuyển đại lý phân phối sơn epoxy tại khu vực miền Nam',
    description:
      'Bài viết này đã bị ẩn khỏi danh sách công khai. Bạn có thể chỉnh sửa và đăng lại.',
    tags: ['#son_epoxy', '#dai_ly'],
    comments: 8,
    views: '230',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4I6w_ItLfuYmY_1AfuhlHvLjjxOGbzBCUPzNC0NMjVqIJ2rL752szrVKiipMNHjUpYrtvuNViqdd0hHjkOeeQUq_uwN61EpST_-wKJU4xa7zcDpdJmrS4kQKXyn7Q8BxwbWTegPTH7QS9-bn4SONcdseIhWos53ZtwU0h8UG5xF4klqJktolGinrB26apa8551CH8P6ahSuw0tjpEk9Mc1QOmfy-PrhzzlZJPoE86Y7Y_zZF0RYvokngEIVX3R1fAfS_0NJenw_HV',
  },
];

/* ========== Saved Posts ========== */
/* ========== ForumNewProducts ========== */
export const newProductsList = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCOhDh5_pTo2uI5k89QcHwi-UOzrY-VLkP5MQ7b5ja0zqPHk9G7yzwPtVou3-oZu4K2gaVOrYNuuCBsynJSVS2qHqA7oJsSJ5zgSsFLSRefbn0-tTlGbiCpc-p9Syq4x01mTseB8v-V4m6vyqx3xbMbvICX06kvB5qAiWbqKT1dogXnTsZeS8obxK0yE-5_8YxlGt-E3IZN2vabJweuaABHmKjwB79YNzV5FP1QUWHsYI16tu1KbT3VGzKNks66DvsvnjA9COtQcl7g',
    title: 'Sơn chống thấm KOVA CT-11A Gold',
    danhMuc: 'Vật liệu xây dựng',
    khuVuc: 'Hà Nội, TP.HCM',
    nguonKho: 'Kho Hà Nội',
    ngayNhapKho: '2026-06-06',
    giaBanSi: '850k - 950k',
    giaNhap: '720k',
    tonKho: 28,
    tocDoBan: 4.5,
    soShopQuanTam: 42,
    diemHot: 95,
    khuyenNghi: 'Nhu cầu cực cao mùa mưa. Nên nhập 30-50 thùng để đủ hàng bán trong tháng.',
    tags: ['#son_chong_tham', '#kova', '#vat_lieu_xay_dung'],
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASFDg0zUn1Bu4MMXniXu2pblrP5gXI0UyUAacU5ecu8QtqfNPPIU46ctcOgIlGtF-dnFg-xjeavs_ie0kiKHgYjUnKxGoFuCAw01ENI5hfVVgLrXStNd1DtP3Zxrl_GmXwuA5R3POpfntW79m3wbUVPSW0ogu5DY5JXMPVLT8d01qr5Frx11uY-JMn_85Pw5JJhh1zc1SwfIirxUoU6MpeFEwedKTt6unLqYi6XXsyKDhf14fMvfCdN8vWyDx54wSCgqnLjPYnT2QU',
    title: 'Máy khoan pin Makita 18V DHP453Z',
    danhMuc: 'Dụng cụ điện',
    khuVuc: 'Toàn quốc',
    nguonKho: 'Kho TP.HCM',
    ngayNhapKho: '2026-06-05',
    giaBanSi: '3.200k - 3.450k',
    giaNhap: '2.850k',
    tonKho: 15,
    tocDoBan: 3.8,
    soShopQuanTam: 36,
    diemHot: 88,
    khuyenNghi: 'Dòng khoan pin bán chạy nhất. Nên nhập thêm 10-15 máy, giá đang có xu hướng tăng.',
    tags: ['#may_khoan', '#makita', '#dung_cu_dien'],
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBP2YJaSR1my1URY7L7QzHpee2Fsc2xTOYRuuoyL6p_1eeRhRG-ZgFjKcJAh9PwEj1h30bFRMkLYL3jpITmABAWFcve4I4erbV9YYuhuvAqdumTvip7ERuH2wq27kz4mDDdVjAEBws6HB1MgtQjvMgAEWuUBd5oQC739V4qGqR_9UHd7utmLf7ODqoLMD42a3RHn5uAj_skoZGUeqw5xtG9dP8Zd-azQixlxDccLiB0Xd2tSoYStI80DMZuBjQIwYed7q4K7n5dRPgp',
    title: 'Thép hộp mạ kẽm Hòa Phát 50x100mm',
    danhMuc: 'Vật liệu xây dựng',
    khuVuc: 'Miền Bắc',
    nguonKho: 'Kho Bắc Ninh',
    ngayNhapKho: '2026-06-07',
    giaBanSi: '185k - 210k/cây',
    giaNhap: '165k/cây',
    tonKho: 120,
    tocDoBan: 8.2,
    soShopQuanTam: 29,
    diemHot: 82,
    khuyenNghi: 'Nhu cầu xây dựng tăng mạnh. Nên duy trì tồn tối thiểu 100 cây, nhập đều mỗi tuần.',
    tags: ['#thep_hop', '#hoa_phat', '#vat_lieu_xay_dung'],
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCnlusiF-0mwfqkYdH0Ya89uKwxkBZX147xtpYw71fYXzOy4qptu-Sm8CDlIJoUfGn_lWw7dqO_7nzMjOe_6YDEB-bGW8uxp0jaq5vOSQuBzLoBeO2qlG3z3MjrSH_d8VxQUmWjdJU68n6X4v8cYeHZEgYpqXXO3dElv2VkAdoGWLFiDk49dQT0e2UknM-al4qT43Ltyr7dkrvUscsva9PYy0ZCaN43LCSlf-qMrS3-VSY4twU07U2fVEikvrsLQSq-7HO1rlhkLG4W',
    title: 'Máy hàn que Inverter Hong Ky 200A',
    danhMuc: 'Thiết bị điện',
    khuVuc: 'TP.HCM',
    nguonKho: 'Kho TP.HCM',
    ngayNhapKho: '2026-06-04',
    giaBanSi: '2.350k - 2.650k',
    giaNhap: '2.100k',
    tonKho: 8,
    tocDoBan: 1.5,
    soShopQuanTam: 18,
    diemHot: 65,
    khuyenNghi: 'Hàng sắp hết, nhu cầu ổn định. Nên nhập thêm 5-8 máy để giữ chân khách quen.',
    tags: ['#may_han', '#hong_ky', '#thiet_bi_dien'],
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBiel9GwmnPjFm4zfDn7QDl-J4rLzmp5w9Biauziay64vPltf76_Pseuy15TGug3gNWQaO_RmG4a1v_1wNP7aLb_RO10op3NYbgU4utqlKHCrNPTqjQs2GXS66w6XIlFLFHhXGrCYW5p_nKfhpyjMSHKZCqEswt8DbTKJzekwqFPu2NLZbh-o8NARIeJEKS6vJGEMoJcJQYjOk1wiby4PHJ3akZ5XM7fMTbkqKaD6BxO18usBVnQmUY6cmZq3OIA4lzV1KDME9DSLl8',
    title: 'Sơn lót chống rỉ Epoxy Rust-Oleum',
    danhMuc: 'Vật liệu xây dựng',
    khuVuc: 'Miền Nam',
    nguonKho: 'Kho Cần Thơ',
    ngayNhapKho: '2026-06-03',
    giaBanSi: '380k - 420k/lít',
    giaNhap: '320k/lít',
    tonKho: 55,
    tocDoBan: 2.1,
    soShopQuanTam: 22,
    diemHot: 71,
    khuyenNghi: 'Dòng sơn epoxy đang được chú ý. Nên nhập 20-30 lít, ưu tiên khu vực ven biển.',
    tags: ['#son_epoxy', '#chong_ri', '#vat_lieu_xay_dung'],
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAVGxDaomtTUeAkSwJJr9wuZJaUKXCYvUplrHvbQVvfUcLNpkFdXbP7ik9P83z9pr3LRQYDkpBF9qAfxiSF5a64K2dn1ofuPHmpybpIR_sMMyyupGxN8iKxYCFPU4DBIU6_HDe4PvQJIBlFS9Bu5XOSiW_G-Dba0QA-polMr4uIiNEw2_fGY720PpxBiwFw7Y0mgQxDuTuF7MrzilniYC0m2Am_d8g8nqNt1lAjVuDhh_W7_RMDti4e-fzKytKWAsBVjzgRkYMY8gR6',
    title: 'Đầu nối ống thủy lực Parker 1/2 inch',
    danhMuc: 'Phụ kiện công nghiệp',
    khuVuc: 'Toàn quốc',
    nguonKho: 'Kho Đà Nẵng',
    ngayNhapKho: '2026-06-07',
    giaBanSi: '85k - 120k/cái',
    giaNhap: '68k/cái',
    tonKho: 200,
    tocDoBan: 6.0,
    soShopQuanTam: 15,
    diemHot: 74,
    khuyenNghi:
      'Phụ kiện thủy lực thiết yếu. Tốc độ bán nhanh, nên nhập lô 50-100 cái để có giá tốt.',
    tags: ['#thuy_luc', '#parker', '#phu_kien_cong_nghiep'],
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB7q0UeyjkmVy04LF7tf5IA0ygKOw2S_vmOCkwCiXBrQfV4j9kPFOsXFxfzjdt4i3-ckzsX5RrdHr3KhVUQgrrbDPhNWmism_mk-ExVFrfK7u7FTS3Ic3Y7MzINxNvtmyfdL4ATFPv0zt1IBynDrLVb0tABvI2lk6dB0grlwTJbKrYhVmFRgXeadptejbxFOZ731PmbzcnwFXmFx0MZmW7qvgsvNvGwe97svkGokZhOcQLW66PA7fde14LdktF4mhUtdcOqnkhn2Apf',
    title: 'Cầu dao tự động MCB Schneider 1P 16A',
    danhMuc: 'Thiết bị điện',
    khuVuc: 'Hà Nội',
    nguonKho: 'Kho Hà Nội',
    ngayNhapKho: '2026-06-05',
    giaBanSi: '95k - 125k/cái',
    giaNhap: '78k/cái',
    tonKho: 350,
    tocDoBan: 12.5,
    soShopQuanTam: 31,
    diemHot: 85,
    khuyenNghi:
      'Hàng bán rất chạy, tốc độ 12 cái/ngày. Nên nhập lô 100-200 cái để hưởng chiết khấu sỉ.',
    tags: ['#thiet_bi_dien', '#schneider', '#dien_dan_dung'],
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAjYqYBGkR_Iadb7O3sIeQNtpWqJ9ThFzKm9BOnEoOjeAE90A3wKJFFf_2bunkuTYMCqxG-rZhI2sPranFao-yWEOh0ApqhjfAAZbuje4uAJVypcId7wA_hljomIOwQcSCCah1Fy-OvCW8q4Fu_GOKEK8rcUHnVgFEuCEYDJGKLI7qI0pVrjInnAhtDOJTjOxgm3_qIjxQV1OQT-PS9-tSwqZFR6TBj4W3czn_RYk-psKet5iM85xrN2qNW9iI1H_BG-KYPwDIYPCHf',
    title: 'Đá cắt sắt Hải Dương 100x3mm (50 viên)',
    danhMuc: 'Dụng cụ cầm tay',
    khuVuc: 'Miền Trung',
    nguonKho: 'Kho Đà Nẵng',
    ngayNhapKho: '2026-06-06',
    giaBanSi: '320k - 350k/hộp',
    giaNhap: '280k/hộp',
    tonKho: 80,
    tocDoBan: 3.0,
    soShopQuanTam: 19,
    diemHot: 68,
    khuyenNghi: 'Hàng tiêu hao nhanh, nên nhập đều 20-30 hộp mỗi đợt để tránh đứt hàng.',
    tags: ['#da_cat', '#hai_duong', '#dung_cu_cam_tay'],
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4I6w_ItLfuYmY_1AfuhlHvLjjxOGbzBCUPzNC0NMjVqIJ2rL752szrVKiipMNHjUpYrtvuNViqdd0hHjkOeeQUq_uwN61EpST_-wKJU4xa7zcDpdJmrS4kQKXyn7Q8BxwbWTegPTH7QS9-bn4SONcdseIhWos53ZtwU0h8UG5xF4klqJktolGinrB26apa8551CH8P6ahSuw0tjpEk9Mc1QOmfy-PrhzzlZJPoE86Y7Y_zZF0RYvokngEIVX3R1fAfS_0NJenw_HV',
    title: 'Đai treo ống có ren M10 (Bộ 100 con)',
    danhMuc: 'Phụ kiện công nghiệp',
    khuVuc: 'Toàn quốc',
    nguonKho: 'Kho Bắc Ninh',
    ngayNhapKho: '2026-06-02',
    giaBanSi: '150k - 180k/bộ',
    giaNhap: '125k/bộ',
    tonKho: 500,
    tocDoBan: 9.0,
    soShopQuanTam: 14,
    diemHot: 60,
    khuyenNghi: 'Lượng quan tâm vừa phải nhưng bán đều. Nên duy trì tồn 200-300 bộ.',
    tags: ['#phu_kien', '#treo_ong', '#co_khi'],
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZWykIdoBcv3hsnrKrDb3I7RuCyGP1qMnHJzwNnpJqntdhAzj56h6-hgnP0JTtExf8a2WnsZH5IS-kdCNnP-XwjuWJrxhCGBnFSDLwFurTw2WyvXX7gUYnYAMIt-_G4km8LP68TP9n14ZRtnurgMrgJln-DtPJvZZ0bU-ocmMejXjNuVvnOcVouGnokgdNy4bHi5CDv_c8hIi3jbRioAowGvaIPhwEMr4vUE7Sy9gjTw15nDdRPttPFXdhN_f6NjszHkYucdmZAqCY',
    title: 'Van cổng gang DN50 mặt bích JIS 10K',
    danhMuc: 'Thiết bị công nghiệp',
    khuVuc: 'TP.HCM, Miền Nam',
    nguonKho: 'Kho TP.HCM',
    ngayNhapKho: '2026-06-03',
    giaBanSi: '680k - 750k/cái',
    giaNhap: '580k/cái',
    tonKho: 12,
    tocDoBan: 0.8,
    soShopQuanTam: 25,
    diemHot: 72,
    khuyenNghi: 'Nhiều shop hỏi nhưng bán chậm do hàng đặc thù. Nên nhập 5-10 cái, tránh ôm tồn.',
    tags: ['#van_cong', '#gang', '#thiet_bi_cong_nghiep'],
  },
];

export const savedPosts = [
  {
    id: 201,
    author: 'Minh Nguyễn',
    role: 'Chuyên gia',
    roleClass: 'bg-blue-100 text-[#004785]',
    time: 'Đã lưu 2 giờ trước',
    category: 'Bán sỉ',
    title: 'Có nên nhập thêm sơn chống thấm KOVA cho mùa mưa năm nay?',
    description:
      'Tôi đang cân nhắc việc tăng 30% lượng tồn kho cho dòng KOVA CT-11A Gold. Theo dự báo thời tiết thì mùa mưa năm nay kéo dài.',
    tags: ['#kim_khi', '#son_chong_tham'],
    comments: 24,
    views: '1.2k',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZWykIdoBcv3hsnrKrDb3I7RuCyGP1qMnHJzwNnpJqntdhAzj56h6-hgnP0JTtExf8a2WnsZH5IS-kdCNnP-XwjuWJrxhCGBnFSDLwFurTw2WyvXX7gUYnYAMIt-_G4km8LP68TP9n14ZRtnurgMrgJln-DtPJvZZ0bU-ocmMejXjNuVvnOcVouGnokgdNy4bHi5CDv_c8hIi3jbRioAowGvaIPhwEMr4vUE7Sy9gjTw15nDdRPttPFXdhN_f6NjszHkYucdmZAqCY',
  },
  {
    id: 202,
    author: 'Hoàng Nam',
    role: 'Thành viên',
    roleClass: 'bg-slate-100 text-slate-600',
    time: 'Đã lưu 5 giờ trước',
    category: 'Thảo luận',
    title: 'Chia sẻ kinh nghiệm quản lý kho hơn 1500 mã hàng vật tư',
    description:
      'Việc quản lý nhiều mã hàng nhỏ như ốc vít, long đền thường gây thất thoát. Tôi xin chia sẻ quy trình 5 bước áp dụng mã vạch.',
    tags: ['#quan_ly_kho', '#kinh_nghiem'],
    comments: 32,
    views: '2.1k',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAjYqYBGkR_Iadb7O3sIeQNtpWqJ9ThFzKm9BOnEoOjeAE90A3wKJFFf_2bunkuTYMCqxG-rZhI2sPranFao-yWEOh0ApqhjfAAZbuje4uAJVypcId7wA_hljomIOwQcSCCah1Fy-OvCW8q4Fu_GOKEK8rcUHnVgFEuCEYDJGKLI7qI0pVrjInnAhtDOJTjOxgm3_qIjxQV1OQT-PS9-tSwqZFR6TBj4W3czn_RYk-psKet5iM85xrN2qNW9iI1H_BG-KYPwDIYPCHf',
  },
  {
    id: 203,
    author: 'Cty VLXD Thăng Long',
    role: 'Tổng đại lý',
    roleClass: 'bg-blue-100 text-[#004785]',
    time: 'Đã lưu 1 ngày trước',
    category: 'Bán sỉ',
    title: 'Có sẵn sơn chống thấm KOVA giá sỉ tại Hà Nội',
    description:
      'Sơn KOVA là dòng sơn chống thấm cao cấp số 1 Việt Nam. Chống thấm tuyệt đối, ngăn nấm mốc, bền màu với thời gian.',
    tags: ['#son_chong_tham', '#gia_si'],
    comments: 18,
    views: '856',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4I6w_ItLfuYmY_1AfuhlHvLjjxOGbzBCUPzNC0NMjVqIJ2rL752szrVKiipMNHjUpYrtvuNViqdd0hHjkOeeQUq_uwN61EpST_-wKJU4xa7zcDpdJmrS4kQKXyn7Q8BxwbWTegPTH7QS9-bn4SONcdseIhWos53ZtwU0h8UG5xF4klqJktolGinrB26apa8551CH8P6ahSuw0tjpEk9Mc1QOmfy-PrhzzlZJPoE86Y7Y_zZF0RYvokngEIVX3R1fAfS_0NJenw_HV',
  },
  {
    id: 204,
    author: 'Văn Hùng',
    role: 'Cảnh báo',
    roleClass: 'bg-red-50 text-red-600',
    time: 'Đã lưu 3 ngày trước',
    category: 'Tìm nguồn hàng',
    title: 'Cảnh báo lô hàng máy khoan giả Makita tràn lan thị trường',
    description:
      'Hiện nay khu vực miền Bắc đang xuất hiện nhiều lô hàng máy khoan pin giả tem mác Makita với giá chỉ bằng 1/3 hàng thật.',
    tags: ['#canh_bao', '#dung_cu_dien'],
    comments: 112,
    views: '5.4k',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZWykIdoBcv3hsnrKrDb3I7RuCyGP1qMnHJzwNnpJqntdhAzj56h6-hgnP0JTtExf8a2WnsZH5IS-kdCNnP-XwjuWJrxhCGBnFSDLwFurTw2WyvXX7gUYnYAMIt-_G4km8LP68TP9n14ZRtnurgMrgJln-DtPJvZZ0bU-ocmMejXjNuVvnOcVouGnokgdNy4bHi5CDv_c8hIi3jbRioAowGvaIPhwEMr4vUE7Sy9gjTw15nDdRPttPFXdhN_f6NjszHkYucdmZAqCY',
  },
  {
    id: 205,
    author: 'Quốc Mạnh Hardware',
    role: 'Đại lý',
    roleClass: 'bg-slate-100 text-slate-600',
    time: 'Đã lưu 1 tuần trước',
    category: 'Mua chung',
    title: 'Dự báo giá thép và phụ kiện kim khí',
    description:
      'Tình hình biến động giá nguyên liệu đang khá phức tạp. Liệu giá sẽ còn giảm sâu nữa hay sẽ bật tăng trở lại?',
    tags: ['#gia_thep', '#thi_truong'],
    comments: 56,
    views: '3.5k',
    avatarInitials: 'QM',
  },
  {
    id: 206,
    author: 'Kim Khí Hòa Phát',
    role: 'Nhà cung cấp',
    roleClass: 'bg-blue-100 text-[#004785]',
    time: 'Đã lưu 2 tuần trước',
    category: 'Thanh lý kho',
    title: 'Bảng giá bulong ốc vít tháng 6/2026',
    description:
      'Cập nhật bảng giá mới nhất các dòng bulong inox 304, ốc vít mạ kẽm, long đền đệm. Ưu đãi đặc biệt cho đơn hàng trên 50 triệu.',
    tags: ['#bulong', '#oc_vit'],
    comments: 15,
    views: '720',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuARQdi4aUjEhq51ggqlTnuIcc0VpZNbVIyHq4o-nUM6ns5h_jkW35Ra6TTnsOx3cehJ3sFf30Lp9e4PaJnKStpqcBTntpjUcjwVxXEoI6Vz0On3t1TGWljo1rJiq5cYi0UZ6oIakFojxDUFOJtMOTeSXTJXpmBo3by3LDxJRP0E6-wjhBjR9v9YY7_piKxZSNoFajlnkWeMP_VWpDxElb6Z2H-yZAS-xyw2XwCdkRlxsGdsxrTwmMqijimScpWn8O6nKEoXuN1WrMPx',
  },
];
