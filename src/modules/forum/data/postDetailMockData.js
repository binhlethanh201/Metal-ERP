const postDetailMockData = {
  post: {
    id: 1,
    title: 'Có nên nhập thêm sơn chống thấm KOVA trong tháng này không?',
    author: 'Nguyễn Văn A',
    authorRole: 'Chuyên gia',
    date: '2 giờ trước',
    views: 1200,
    tags: ['#kim_khi', '#vat_tu_xay_dung'],
    content:
      'Chào các anh em trong ngành, tình hình là tôi thấy nhu cầu sơn chống thấm đang tăng mạnh do bước vào mùa mưa ở cả miền Bắc và miền Nam. Qua theo dõi dữ liệu thị trường tuần qua, dòng KOVA đang có lượng tìm kiếm tăng đột biến 35%.',
    content2:
      'Tuy nhiên, giá nguyên liệu đầu vào đang có dấu hiệu biến động. Anh em đại lý cho hỏi có nên ôm hàng số lượng lớn ngay lúc này để giữ giá, hay nhập cầm chừng theo tiến độ công trình?',
    trend: '+30% tăng trưởng nhu cầu',
    location: 'Hà Nội, TP.HCM',
    product: {
      name: 'Sơn chống thấm KOVA CT-11A Gold',
      price: '850.000đ',
      trend: '+35% tăng trưởng',
    },
  },
  comments: [
    {
      id: 1,
      author: 'Trần Hoàng M.',
      role: null,
      time: '1 giờ trước',
      content:
        'Với kinh nghiệm làm đại lý cấp 1 hơn 10 năm, tôi khuyên anh nên nhập ngay 50% kế hoạch tháng này. Dự báo giá hóa chất chống thấm sẽ tăng nhẹ 5-7% vào đầu tháng sau do chi phí vận tải.',
      likes: 28,
      isBest: true,
      replies: [
        {
          id: 1,
          author: 'Lê Thị Bích',
          time: '45 phút trước',
          content:
            'Mình cũng đang phân vân, không biết KOVA CT-11A Gold có chương trình chiết khấu gì mới cho tháng này không nhỉ?',
          likes: 12,
        },
        {
          id: 2,
          author: 'Nguyễn Văn A',
          role: 'TÁC GIẢ',
          time: '30 phút trước',
          content:
            'Theo tôi biết thì đang có chương trình tích điểm đổi quà cho đơn hàng trên 50 triệu đó bạn.',
          likes: 0,
        },
      ],
    },
    {
      id: 2,
      author: 'Lê Thị Bích',
      role: null,
      time: '45 phút trước',
      content:
        'Mình cũng đang phân vân, không biết KOVA CT-11A Gold có chương trình chiết khấu gì mới cho tháng này không nhỉ?',
      likes: 12,
      isBest: false,
      replies: [
        {
          id: 21,
          author: 'Nguyễn Văn A',
          role: 'TÁC GIẢ',
          time: '30 phút trước',
          content:
            'Theo tôi biết thì đang có chương trình tích điểm đổi quà cho đơn hàng trên 50 triệu đó bạn.',
          likes: 0,
        },
      ],
    },
  ],
  relatedPosts: [
    {
      id: 2,
      title: 'Kinh nghiệm phân biệt sơn KOVA thật và giả cho đại lý mới',
      comments: 15,
      date: '2 ngày trước',
    },
    {
      id: 3,
      title: 'Top 5 dòng sơn chống thấm bán chạy nhất năm 2024',
      comments: 42,
      date: '5 ngày trước',
    },
  ],
  trends: [
    {
      name: 'Máy khoan Makita HP1630',
      change: '+12%',
      isPositive: true,
    },
    {
      name: 'Thép xây dựng Hòa Phát',
      change: '-2.5%',
      isPositive: false,
    },
    {
      name: 'Sơn Dulux Weathershield',
      change: '+18%',
      isPositive: true,
    },
  ],
  tags: ['Sơn KOVA', 'Chống thấm', 'Đại lý', 'B2B', 'Vật liệu'],
};

export default postDetailMockData;
