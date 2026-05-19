/**
 * Mock data cho Forum Module
 */

export const mockCategories = [
  { id: 1, name: 'Thời trang', icon: '👔', postCount: 45 },
  { id: 2, name: 'Phụ kiện', icon: '👜', postCount: 32 },
  { id: 3, name: 'Giày dép', icon: '👟', postCount: 28 },
  { id: 4, name: 'Công nghệ', icon: '📱', postCount: 15 },
  { id: 5, name: 'Xu hướng bán hàng', icon: '📊', postCount: 22 },
];

export const mockPosts = [
  {
    id: 1,
    title: 'Cách chọn áo sơ mi nam phù hợp với từng dáng người',
    content: 'Bài viết chia sẻ kinh nghiệm chọn áo sơ mi nam...',
    author: 'Nguyễn Văn A',
    category: 'Thời trang',
    date: '2024-05-08',
    views: 125,
    likes: 42,
    comments: 8,
    liked: false,
  },
  {
    id: 2,
    title: 'Xu hướng bán quần áo online năm 2024',
    content: 'Những xu hướng nổi bật trong lĩnh vực bán hàng online...',
    author: 'Trần Thị B',
    category: 'Xu hướng bán hàng',
    date: '2024-05-07',
    views: 89,
    likes: 23,
    comments: 5,
    liked: true,
  },
];

export const mockComments = [
  {
    id: 1,
    author: 'Người dùng 1',
    content: 'Bài viết rất hữu ích, cảm ơn bạn!',
    date: '2024-05-08',
    likes: 2,
  },
  {
    id: 2,
    author: 'Người dùng 2',
    content: 'Mình cũng có ý kiến tương tự',
    date: '2024-05-08',
    likes: 1,
  },
];

export const mockTrends = [
  {
    id: 1,
    title: 'Quần áo cao cấp bán chạy nhất tháng 5',
    trend: 'up',
    percentage: 35,
  },
  {
    id: 2,
    title: 'Giày thể thao được ưa chuộng',
    trend: 'up',
    percentage: 28,
  },
  {
    id: 3,
    title: 'Phụ kiện bán chậm lại',
    trend: 'down',
    percentage: -12,
  },
];

export const mockSuggestions = [
  {
    id: 1,
    productName: 'Áo sơ mi nam cao cấp',
    reason: 'Được yêu cầu nhiều lần',
    votes: 15,
  },
  {
    id: 2,
    productName: 'Giày thể thao cao cấp',
    reason: 'Xu hướng tăng cao',
    votes: 12,
  },
];

// Dữ liệu tin tức ngành cho trang Tin tức
export const mockIndustryNews = [
  {
    id: 1,
    source: 'CafeF',
    time: '2 giờ trước',
    isHot: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAY2Mnj0yc32gHxBnhpJLLw-WK5Yll2aZGXcpwHi2jC_HjQrNREFxdR9oaOFBSUNs9MtGzk5Mz4oo4oWIo_Hxfok_bEewnT1tnf4cHKBqi01pBlUWBqy7Pp0ftv3NIKIAqSbAIzKpcVJ2IfHwcFFWI7Ka6hrZ_RiM0jz2nOpD-HeYukVrqb5H7xh4-Ry0srYCJNYPNKQS_sCZRP2TBEEb_uwFdIsKCRTwJisMHdUigLMU3RY2wtkC8vKlJD1qCcqkX6sYyuD8SKRQ',
    title: 'Nhu cầu vật liệu chống thấm tăng mạnh trước mùa mưa',
    description:
      'Dữ liệu từ các chuỗi bán lẻ cho thấy lượng tiêu thụ các sản phẩm chống thấm, sơn lót ngoại thất tăng 35% so với cùng kỳ năm ngoái...',
    tags: ['#xây_dựng', '#chống_thấm'],
  },
  {
    id: 2,
    source: 'VnEconomy',
    time: '5 giờ trước',
    isHot: false,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDDcw-YOEKqTUXRATKv3tulrf5C5YOWKsFTgJkliENEVxVxkjLmxmYHD1Of7_nPdl3O9fxF9-Lgel8OJw36IyMO31_E5uNXt9Ol8HGdhCbhTvjuvUQ_Zzkv5UbPu3puUQ3RG7jtpScLFiE47Eo6wGE-8Ki3dLnNHAVPBDC6csohwmkej6x8I-C-dnFXPMvo3iW23hXz3jDFtHCijjYZf98DKqH4tCBFNN04qMbP49ew-vlgWaoGDRwKarXQJzcl8BUIqORyBYVXuw',
    title: 'Chính sách thuế mới áp dụng cho hộ kinh doanh vật liệu từ quý 3',
    description:
      'Dự thảo nghị định mới về đơn giản hóa thủ tục quyết toán thuế đối với cửa hàng bán lẻ có doanh thu dưới 10 tỷ đồng/năm...',
    tags: ['#chính_sách', '#thuế'],
  },
  {
    id: 3,
    source: 'Kinh tế Đô thị',
    time: 'Hôm qua',
    isHot: false,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDEuw3vf8ZkAl0XcALVX780H1dBSLlW-MRbS0bj-Rb2vTgL-JSFzkp3lbq29QXsJCQcb7dVHkL5fGtsZIJG34Sl7udbB4eYPcojhHWPuRlBITo3emGKZMfVp4ftUhImiRJ-MJsaFXW91h-6xdBbfUMVwBD2Wkq3Fr2Cq_mg2uzrsTkmvgyAMRsjhpi2leiy_1B0l1laljNvkT8VZl2e3U1XOVkgE4G-9ezKkMd5hXIKgfXb9VnU0Y8AglHqZ9J7uxuhKbZvXYcBgA',
    title: 'Thị trường sơn trang trí: Phân khúc trung cấp chiếm ưu thế',
    description:
      'Người tiêu dùng có xu hướng lựa chọn các dòng sơn có tính năng kháng khuẩn và bền màu nhưng mức giá vừa phải...',
    tags: ['#sơn_nhà', '#xu_hướng'],
  },
];

// Dữ liệu AI tóm tắt nhanh
export const mockAISummary = [
  'Nhu cầu vật liệu chống thấm đang ở đỉnh điểm do thời tiết chuyển mùa.',
  'Cẩn trọng với biến động giá thép trong tuần tới do đứt gãy cung ứng.',
  'Sản phẩm ECO-friendly ngày càng được ưa chuộng tại các đô thị lớn.',
];

// Dữ liệu tin liên quan sản phẩm hot
export const mockHotProductNews = [
  {
    id: 1,
    brand: 'KOVA Paint',
    title: 'KOVA ra mắt dòng sơn chống thấm mới tích hợp nano bạc',
  },
  {
    id: 2,
    brand: 'Thép Hòa Phát',
    title: 'Điều chỉnh chiết khấu cho đại lý khu vực miền Trung',
  },
];

// Dữ liệu thảo luận diễn đàn
export const mockForumDiscussions = [
  {
    id: 1,
    title: 'Kinh nghiệm trữ hàng chống thấm mùa mưa cho người mới',
    comments: 24,
    views: 156,
  },
  {
    id: 2,
    title: 'Làm sao để đối phó với việc tăng giá của các hãng sơn?',
    comments: 42,
    views: 312,
  },
  {
    id: 3,
    title: 'Review top 3 loại gạch men bán chạy nhất tháng 5',
    comments: 18,
    views: 89,
  },
];

const mockData = {
  mockCategories,
  mockPosts,
  mockComments,
  mockTrends,
  mockSuggestions,
  mockIndustryNews,
  mockAISummary,
  mockHotProductNews,
  mockForumDiscussions,
};

export default mockData;
