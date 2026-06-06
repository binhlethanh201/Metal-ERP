const wholesalePost = {
  type: 'wholesale',
  post: {
    id: 1,
    typeLabel: 'Đăng bán sỉ',
    typeTone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    title: 'Có sẵn sơn chống thấm KOVA giá sỉ tại Hà Nội',
    author: 'Công ty TNHH Vật Liệu XD Thăng Long',
    authorRole: 'Tổng đại lý miền Bắc',
    authorVerified: true,
    authorRating: 4.8,
    authorReviewCount: 120,
    location: 'Hà Nội',
    date: '2 giờ trước',
    views: 1200,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4I6w_ItLfuYmY_1AfuhlHvLjjxOGbzBCUPzNC0NMjVqIJ2rL752szrVKiipMNHjUpYrtvuNViqdd0hHjkOeeQUq_uwN61EpST_-wKJU4xa7zcDpdJmrS4kQKXyn7Q8BxwbWTegPTH7QS9-bn4SONcdseIhWos53ZtwU0h8UG5xF4klqJktolGinrB26apa8551CH8P6ahSuw0tjpEk9Mc1QOmfy-PrhzzlZJPoE86Y7Y_zZF0RYvokngEIVX3R1fAfS_0NJenw_HV',
    tags: ['#kim_khi', '#son_chong_tham', '#gia_si'],
    description:
      'Sơn KOVA là dòng sơn chống thấm cao cấp số 1 Việt Nam hiện nay. Với ưu điểm chống thấm tuyệt đối, ngăn chặn nấm mốc, bền màu với thời gian và đặc biệt an toàn cho người sử dụng với hàm lượng VOC cực thấp.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDCw0jz3n9PDya1tWltdmDZh4D2zTE80cj7Hf-4x3WaEj9uAoa79i6-qvMzxms8Lhaf4o1KDH4_vBBpTIpGDrAzJ9CsIPbH54eYY0I6g46puw3t2CxizRk7tH3_Bj7TwRfMqsqD0ZdqWs8g74qLiUpLgx98QGFyQxgDlUazIfJjAidkFwwP9Rcjgb66TyrRkG6MPwAkYHvR4k56GnKMBCoYzi4Ys--dBCLaLY_Xoy_1wyL8YKmd7IZ6_GE1_jw_UzaFk2kd1pZ12b9U',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAxaYLPoqzswv0C9BVWeYThcYbPZax1JrDCfzJUVW_Lyv8ZGOITbfzh7LyNdQAUHnu6IGoz9GA15GQ9k9uNZnoYi9_tIiHwZ17cohRXbZGg_Z-CJNSLrlyo7wJ6A6NIA7AUbp_BkYg6p9b4r-1GZ1IZRwUvglCbV5VCqKqh81ZJfy8ViRpqCMeo75N1QGXkhKlYTAWKUqe8kTlzdSWde-BtxoKEeT58fJh3kKITDk6X163ZytmgSEZy8rF0XwJAv1XYsXnzqxdWKke4',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ9m8gsGcmUO0FCtPyX9RhIluNVkX3-YyYHYbuvN1jXqmVXhEY35h-2lfYfGvFs3GJZMhZzMFU21IAgk1gxXy4U8Me8h4K7yb92S2TEfo1m5q0vT0PNc8oEqRUmNh4uNnzxzX5EZgm8QGtyuIN2NVSXsSqfD33ZL3lLH15W-zpJrlLewF2S6QhvlKM-DtKsdJPy2JPvxysOjfEQ2JzUB2L3Qk036VIhAEM_F_0vcP3ABYfeRAAmZ9ymp-YHTZU6ziZZ_szaaSV6YFg',
    ],
    products: [
      {
        id: 'p1',
        name: 'Sơn chống thấm KOVA CT-11A Gold',
        priceRange: '1.250.000đ - 1.450.000đ',
        moq: '10 thùng',
        stock: 'Còn hàng',
        area: 'Hà Nội',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDCw0jz3n9PDya1tWltdmDZh4D2zTE80cj7Hf-4x3WaEj9uAoa79i6-qvMzxms8Lhaf4o1KDH4_vBBpTIpGDrAzJ9CsIPbH54eYY0I6g46puw3t2CxizRk7tH3_Bj7TwRfMqsqD0ZdqWs8g74qLiUpLgx98QGFyQxgDlUazIfJjAidkFwwP9Rcjgb66TyrRkG6MPwAkYHvR4k56GnKMBCoYzi4Ys--dBCLaLY_Xoy_1wyL8YKmd7IZ6_GE1_jw_UzaFk2kd1pZ12b9U',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAxaYLPoqzswv0C9BVWeYThcYbPZax1JrDCfzJUVW_Lyv8ZGOITbfzh7LyNdQAUHnu6IGoz9GA15GQ9k9uNZnoYi9_tIiHwZ17cohRXbZGg_Z-CJNSLrlyo7wJ6A6NIA7AUbp_BkYg6p9b4r-1GZ1IZRwUvglCbV5VCqKqh81ZJfy8ViRpqCMeo75N1QGXkhKlYTAWKUqe8kTlzdSWde-BtxoKEeT58fJh3kKITDk6X163ZytmgSEZy8rF0XwJAv1XYsXnzqxdWKke4',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ9m8gsGcmUO0FCtPyX9RhIluNVkX3-YyYHYbuvN1jXqmVXhEY35h-2lfYfGvFs3GJZMhZzMFU21IAgk1gxXy4U8Me8h4K7yb92S2TEfo1m5q0vT0PNc8oEqRUmNh4uNnzxzX5EZgm8QGtyuIN2NVSXsSqfD33ZL3lLH15W-zpJrlLewF2S6QhvlKM-DtKsdJPy2JPvxysOjfEQ2JzUB2L3Qk036VIhAEM_F_0vcP3ABYfeRAAmZ9ymp-YHTZU6ziZZ_szaaSV6YFg',
        ],
        specs: [
          { name: 'Thành phần', value: 'Gốc Acrylic biến tính, bột khoáng, phụ gia chống thấm' },
          { name: 'Hạn sử dụng', value: '36 tháng kể từ ngày sản xuất' },
          { name: 'Độ phủ lý thuyết', value: '4.0 - 5.0 m2/kg/2 lớp' },
          { name: 'Thời gian khô', value: 'Khô bề mặt: 30-60 phút. Khô hoàn toàn: 24h' },
          { name: 'Độ bền uốn', value: 'Đạt tiêu chuẩn TCVN 6552' },
          { name: 'Dụng cụ thi công', value: 'Rulo, cọ bản hoặc máy phun sơn' },
          { name: 'Đóng gói', value: 'Thùng 20kg' },
          { name: 'Màu sắc', value: 'Trắng, Xám, Xanh dương' },
        ],
        detailImages: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB84L8BvI-MrhrjFhDcHkflP6IVZFZ7l6VISon1Ttuqb29zhFLdO0eo1udEgNbWhF5OalCivGNwSoHrmCwkBATzbOwL4GZXctqlcTwrRSXUK7WrcF8mO7NVPhS1seKGFXg36xgUVvtMedoHvplFKub3TWb4dhy3rXCBzN1ZUBwr9ziKHO0PcEf7Mw98a3vSO94fknMPixFhMSuX0KvIbYf9-Z36pilcxwINGopbIGAl4dFmjD1hbI7PvFiToH4mdzDH-UDO-iy4cmcY',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD7h7yadoR2XhFaGGc2KGg1fTUhUq5p39NSdMZ6X41WO8URQrrzCv6UK6loTHNraSU7PiKNvOSj9mGkD3HFbKuDhHyQWOsMDosntee_vlqjplWPNrewHImKuSYOqaJf5FKi2mNQxzoviwLnBYtCmB7qKCyDrTNKAyypB7nHeLgAg2AaASnq43nenELm7QMRgqLwtYQNLAacgIPdlbcrKFy5_cS2XnpLiG6SzcTNMMWhObzylaPqmR-eZivvaVAp_dBBP5VbCd5muVTCDkY',
          'https://lh3.googleusercontent.com/aida/ADBb0uhOJEjt4FFVGwtv5S_ZUCS6ywHKCn6Ajqn-EALq2KFVdrVOQ9ym2q4kSBmoFyH-jq3rTrV9Lc3i76JwdnDTPKcTJOXLBOJiIbjaMq8X8r8q724XnlrPIbDUXDBA4jttVmeTMUaDIyiDYFQ47uE7B82g8bUNu6BjjcpkhkxgGf1fS9umBziXFWeeDIBhWXLFB_eeF8iiC2wP8HZ2WnJuqE9dgnh-KTjqeFk2D4rI6GzrF97ML-6ge9TD4GlaDE06q0f5t_pPgzGtBQ',
        ],
      },
      {
        id: 'p2',
        name: 'Sơn lót chống thấm KOVA Primer K-100',
        priceRange: '850.000đ - 980.000đ',
        moq: '20 thùng',
        stock: 'Còn hàng',
        area: 'Hà Nội',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAxaYLPoqzswv0C9BVWeYThcYbPZax1JrDCfzJUVW_Lyv8ZGOITbfzh7LyNdQAUHnu6IGoz9GA15GQ9k9uNZnoYi9_tIiHwZ17cohRXbZGg_Z-CJNSLrlyo7wJ6A6NIA7AUbp_BkYg6p9b4r-1GZ1IZRwUvglCbV5VCqKqh81ZJfy8ViRpqCMeo75N1QGXkhKlYTAWKUqe8kTlzdSWde-BtxoKEeT58fJh3kKITDk6X163ZytmgSEZy8rF0XwJAv1XYsXnzqxdWKke4',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ9m8gsGcmUO0FCtPyX9RhIluNVkX3-YyYHYbuvN1jXqmVXhEY35h-2lfYfGvFs3GJZMhZzMFU21IAgk1gxXy4U8Me8h4K7yb92S2TEfo1m5q0vT0PNc8oEqRUmNh4uNnzxzX5EZgm8QGtyuIN2NVSXsSqfD33ZL3lLH15W-zpJrlLewF2S6QhvlKM-DtKsdJPy2JPvxysOjfEQ2JzUB2L3Qk036VIhAEM_F_0vcP3ABYfeRAAmZ9ymp-YHTZU6ziZZ_szaaSV6YFg',
        ],
        specs: [
          { name: 'Thành phần', value: 'Gốc Alkyd biến tính, dung môi hữu cơ' },
          { name: 'Hạn sử dụng', value: '24 tháng kể từ ngày sản xuất' },
          { name: 'Độ phủ lý thuyết', value: '6.0 - 8.0 m2/kg/lớp' },
          { name: 'Thời gian khô', value: 'Khô bề mặt: 20-30 phút. Khô hoàn toàn: 6h' },
          { name: 'Đóng gói', value: 'Thùng 18 lít' },
        ],
        detailImages: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAxaYLPoqzswv0C9BVWeYThcYbPZax1JrDCfzJUVW_Lyv8ZGOITbfzh7LyNdQAUHnu6IGoz9GA15GQ9k9uNZnoYi9_tIiHwZ17cohRXbZGg_Z-CJNSLrlyo7wJ6A6NIA7AUbp_BkYg6p9b4r-1GZ1IZRwUvglCbV5VCqKqh81ZJfy8ViRpqCMeo75N1QGXkhKlYTAWKUqe8kTlzdSWde-BtxoKEeT58fJh3kKITDk6X163ZytmgSEZy8rF0XwJAv1XYsXnzqxdWKke4',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ9m8gsGcmUO0FCtPyX9RhIluNVkX3-YyYHYbuvN1jXqmVXhEY35h-2lfYfGvFs3GJZMhZzMFU21IAgk1gxXy4U8Me8h4K7yb92S2TEfo1m5q0vT0PNc8oEqRUmNh4uNnzxzX5EZgm8QGtyuIN2NVSXsSqfD33ZL3lLH15W-zpJrlLewF2S6QhvlKM-DtKsdJPy2JPvxysOjfEQ2JzUB2L3Qk036VIhAEM_F_0vcP3ABYfeRAAmZ9ymp-YHTZU6ziZZ_szaaSV6YFg',
        ],
      },
      {
        id: 'p3',
        name: 'Sơn phủ bóng KOVA Clear Coat CC-200',
        priceRange: '1.100.000đ - 1.300.000đ',
        moq: '15 thùng',
        stock: 'Sắp hết hàng',
        area: 'Hà Nội & TP.HCM',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ9m8gsGcmUO0FCtPyX9RhIluNVkX3-YyYHYbuvN1jXqmVXhEY35h-2lfYfGvFs3GJZMhZzMFU21IAgk1gxXy4U8Me8h4K7yb92S2TEfo1m5q0vT0PNc8oEqRUmNh4uNnzxzX5EZgm8QGtyuIN2NVSXsSqfD33ZL3lLH15W-zpJrlLewF2S6QhvlKM-DtKsdJPy2JPvxysOjfEQ2JzUB2L3Qk036VIhAEM_F_0vcP3ABYfeRAAmZ9ymp-YHTZU6ziZZ_szaaSV6YFg',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDCw0jz3n9PDya1tWltdmDZh4D2zTE80cj7Hf-4x3WaEj9uAoa79i6-qvMzxms8Lhaf4o1KDH4_vBBpTIpGDrAzJ9CsIPbH54eYY0I6g46puw3t2CxizRk7tH3_Bj7TwRfMqsqD0ZdqWs8g74qLiUpLgx98QGFyQxgDlUazIfJjAidkFwwP9Rcjgb66TyrRkG6MPwAkYHvR4k56GnKMBCoYzi4Ys--dBCLaLY_Xoy_1wyL8YKmd7IZ6_GE1_jw_UzaFk2kd1pZ12b9U',
        ],
        specs: [
          { name: 'Thành phần', value: 'Polyurethane gốc nước' },
          { name: 'Hạn sử dụng', value: '18 tháng kể từ ngày sản xuất' },
          { name: 'Độ phủ lý thuyết', value: '5.0 - 6.0 m2/kg/2 lớp' },
          { name: 'Thời gian khô', value: 'Khô bề mặt: 60 phút. Khô hoàn toàn: 48h' },
          { name: 'Độ bóng', value: '> 90 GU (60°)' },
        ],
        detailImages: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ9m8gsGcmUO0FCtPyX9RhIluNVkX3-YyYHYbuvN1jXqmVXhEY35h-2lfYfGvFs3GJZMhZzMFU21IAgk1gxXy4U8Me8h4K7yb92S2TEfo1m5q0vT0PNc8oEqRUmNh4uNnzxzX5EZgm8QGtyuIN2NVSXsSqfD33ZL3lLH15W-zpJrlLewF2S6QhvlKM-DtKsdJPy2JPvxysOjfEQ2JzUB2L3Qk036VIhAEM_F_0vcP3ABYfeRAAmZ9ymp-YHTZU6ziZZ_szaaSV6YFg',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDCw0jz3n9PDya1tWltdmDZh4D2zTE80cj7Hf-4x3WaEj9uAoa79i6-qvMzxms8Lhaf4o1KDH4_vBBpTIpGDrAzJ9CsIPbH54eYY0I6g46puw3t2CxizRk7tH3_Bj7TwRfMqsqD0ZdqWs8g74qLiUpLgx98QGFyQxgDlUazIfJjAidkFwwP9Rcjgb66TyrRkG6MPwAkYHvR4k56GnKMBCoYzi4Ys--dBCLaLY_Xoy_1wyL8YKmd7IZ6_GE1_jw_UzaFk2kd1pZ12b9U',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB84L8BvI-MrhrjFhDcHkflP6IVZFZ7l6VISon1Ttuqb29zhFLdO0eo1udEgNbWhF5OalCivGNwSoHrmCwkBATzbOwL4GZXctqlcTwrRSXUK7WrcF8mO7NVPhS1seKGFXg36xgUVvtMedoHvplFKub3TWb4dhy3rXCBzN1ZUBwr9ziKHO0PcEf7Mw98a3vSO94fknMPixFhMSuX0KvIbYf9-Z36pilcxwINGopbIGAl4dFmjD1hbI7PvFiToH4mdzDH-UDO-iy4cmcY',
        ],
      },
      {
        id: 'p4',
        name: 'Sơn chống thấm pha trộn xi măng KOVA CT-15',
        priceRange: '650.000đ - 780.000đ',
        moq: '25 bao',
        stock: 'Còn hàng',
        area: 'Toàn quốc',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDCw0jz3n9PDya1tWltdmDZh4D2zTE80cj7Hf-4x3WaEj9uAoa79i6-qvMzxms8Lhaf4o1KDH4_vBBpTIpGDrAzJ9CsIPbH54eYY0I6g46puw3t2CxizRk7tH3_Bj7TwRfMqsqD0ZdqWs8g74qLiUpLgx98QGFyQxgDlUazIfJjAidkFwwP9Rcjgb66TyrRkG6MPwAkYHvR4k56GnKMBCoYzi4Ys--dBCLaLY_Xoy_1wyL8YKmd7IZ6_GE1_jw_UzaFk2kd1pZ12b9U',
        ],
        specs: [
          { name: 'Thành phần', value: 'Xi măng Portland, phụ gia polymer, cốt liệu mịn' },
          { name: 'Hạn sử dụng', value: '12 tháng (bảo quản nơi khô ráo)' },
          { name: 'Độ phủ lý thuyết', value: '2.0 - 2.5 m2/kg/2 lớp' },
          { name: 'Thời gian khô', value: 'Khô bề mặt: 2-4h. Khô hoàn toàn: 7 ngày' },
          { name: 'Cường độ bám dính', value: '> 1.5 MPa (TCVN 6560)' },
        ],
        detailImages: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDCw0jz3n9PDya1tWltdmDZh4D2zTE80cj7Hf-4x3WaEj9uAoa79i6-qvMzxms8Lhaf4o1KDH4_vBBpTIpGDrAzJ9CsIPbH54eYY0I6g46puw3t2CxizRk7tH3_Bj7TwRfMqsqD0ZdqWs8g74qLiUpLgx98QGFyQxgDlUazIfJjAidkFwwP9Rcjgb66TyrRkG6MPwAkYHvR4k56GnKMBCoYzi4Ys--dBCLaLY_Xoy_1wyL8YKmd7IZ6_GE1_jw_UzaFk2kd1pZ12b9U',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAxaYLPoqzswv0C9BVWeYThcYbPZax1JrDCfzJUVW_Lyv8ZGOITbfzh7LyNdQAUHnu6IGoz9GA15GQ9k9uNZnoYi9_tIiHwZ17cohRXbZGg_Z-CJNSLrlyo7wJ6A6NIA7AUbp_BkYg6p9b4r-1GZ1IZRwUvglCbV5VCqKqh81ZJfy8ViRpqCMeo75N1QGXkhKlYTAWKUqe8kTlzdSWde-BtxoKEeT58fJh3kKITDk6X163ZytmgSEZy8rF0XwJAv1XYsXnzqxdWKke4',
        ],
      },
      {
        id: 'p5',
        name: 'Sơn chống thấm đàn hồi KOVA Elastic E-300',
        priceRange: '1.550.000đ - 1.850.000đ',
        moq: '8 thùng',
        stock: 'Còn hàng',
        area: 'Hà Nội',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAxaYLPoqzswv0C9BVWeYThcYbPZax1JrDCfzJUVW_Lyv8ZGOITbfzh7LyNdQAUHnu6IGoz9GA15GQ9k9uNZnoYi9_tIiHwZ17cohRXbZGg_Z-CJNSLrlyo7wJ6A6NIA7AUbp_BkYg6p9b4r-1GZ1IZRwUvglCbV5VCqKqh81ZJfy8ViRpqCMeo75N1QGXkhKlYTAWKUqe8kTlzdSWde-BtxoKEeT58fJh3kKITDk6X163ZytmgSEZy8rF0XwJAv1XYsXnzqxdWKke4',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ9m8gsGcmUO0FCtPyX9RhIluNVkX3-YyYHYbuvN1jXqmVXhEY35h-2lfYfGvFs3GJZMhZzMFU21IAgk1gxXy4U8Me8h4K7yb92S2TEfo1m5q0vT0PNc8oEqRUmNh4uNnzxzX5EZgm8QGtyuIN2NVSXsSqfD33ZL3lLH15W-zpJrlLewF2S6QhvlKM-DtKsdJPy2JPvxysOjfEQ2JzUB2L3Qk036VIhAEM_F_0vcP3ABYfeRAAmZ9ymp-YHTZU6ziZZ_szaaSV6YFg',
        ],
        specs: [
          { name: 'Thành phần', value: 'Acrylic co-polymer đàn hồi, bột khoáng siêu mịn' },
          { name: 'Hạn sử dụng', value: '24 tháng kể từ ngày sản xuất' },
          { name: 'Độ phủ lý thuyết', value: '3.0 - 3.5 m2/kg/2 lớp' },
          { name: 'Thời gian khô', value: 'Khô bề mặt: 45 phút. Khô hoàn toàn: 24h' },
          { name: 'Độ giãn dài', value: '> 300% (ASTM D412)' },
          { name: 'Khả năng bít vết nứt', value: 'Lên đến 1.5mm' },
        ],
        detailImages: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAxaYLPoqzswv0C9BVWeYThcYbPZax1JrDCfzJUVW_Lyv8ZGOITbfzh7LyNdQAUHnu6IGoz9GA15GQ9k9uNZnoYi9_tIiHwZ17cohRXbZGg_Z-CJNSLrlyo7wJ6A6NIA7AUbp_BkYg6p9b4r-1GZ1IZRwUvglCbV5VCqKqh81ZJfy8ViRpqCMeo75N1QGXkhKlYTAWKUqe8kTlzdSWde-BtxoKEeT58fJh3kKITDk6X163ZytmgSEZy8rF0XwJAv1XYsXnzqxdWKke4',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ9m8gsGcmUO0FCtPyX9RhIluNVkX3-YyYHYbuvN1jXqmVXhEY35h-2lfYfGvFs3GJZMhZzMFU21IAgk1gxXy4U8Me8h4K7yb92S2TEfo1m5q0vT0PNc8oEqRUmNh4uNnzxzX5EZgm8QGtyuIN2NVSXsSqfD33ZL3lLH15W-zpJrlLewF2S6QhvlKM-DtKsdJPy2JPvxysOjfEQ2JzUB2L3Qk036VIhAEM_F_0vcP3ABYfeRAAmZ9ymp-YHTZU6ziZZ_szaaSV6YFg',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB84L8BvI-MrhrjFhDcHkflP6IVZFZ7l6VISon1Ttuqb29zhFLdO0eo1udEgNbWhF5OalCivGNwSoHrmCwkBATzbOwL4GZXctqlcTwrRSXUK7WrcF8mO7NVPhS1seKGFXg36xgUVvtMedoHvplFKub3TWb4dhy3rXCBzN1ZUBwr9ziKHO0PcEf7Mw98a3vSO94fknMPixFhMSuX0KvIbYf9-Z36pilcxwINGopbIGAl4dFmjD1hbI7PvFiToH4mdzDH-UDO-iy4cmcY',
        ],
      },
    ],
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
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBrpEhsEKZGy4ZBnNGmI50My1PuAitDMUnUw8I-vdchxHBKcp4lj0Ln2yizP58G-sBtgyvEmmUPyJ9rDchc0melNGAtMrVoJGbR_0stuCLjOpWigUOWgvWb37QhUsnU3VGv4ugn_atysGTusu7DCWkgvouR1ofKYdz8rOgAxfq10cFS0Hdx1dKyXz4pdwZY3dO8g64sH9aSeiBU2ml9AaGTHojvzkd_nFQSnbYBJZHQK--iyfzmyv1w-472yWeIC38DUocF3AHzIlE3',
      replies: [
        {
          id: 11,
          author: 'Lê Thị Bích',
          time: '45 phút trước',
          content:
            'Mình cũng đang phân vân, không biết KOVA CT-11A Gold có chương trình chiết khấu gì mới cho tháng này không nhỉ?',
          likes: 12,
          avatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCCxlqLJJqOIHXp06ZQpOSR3Jd6P5zHNtcXiJZqtB079IIKsbDJwd1xigZS-lqBdvDdw0k66fj-8vHXbzYJkO8Xtam3mneE6Ij7VRZSltkchNk0PBj6xyaIximPDp5NgtQTpMxJzTNCkWCXXGjqld6wtWLQArlh7q2HNjsyXv7VVdHBKYhRaTEJWp1FC3GRhQ1vCcHFusgtQQ5GIGBzC2vS9IYhY0O6sTj1wIV5YN-ODESF3io_KAowhDPVLEx24aHa3KTnjtASjcUn',
        },
        {
          id: 12,
          author: 'Nguyễn Văn A',
          role: 'TÁC GIẢ',
          time: '30 phút trước',
          content:
            'Theo tôi biết thì đang có chương trình tích điểm đổi quà cho đơn hàng trên 50 triệu đó bạn.',
          likes: 0,
          avatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCd7kAzZGsawf2ZQAN57Bsk8gVkPiWD9arBCWHLjg6ufHd97yZTYrvQo3xCtGQriM3eOdInWBcO61hueNNIsMWnYmBNIUrjvKOuu-1GtuqyIq1TKaVOIGmUMC-Cza2B-wHCMvOWnC8CUXUJZh3Jb6wLvziATIcpGPUrB0ukKIK6yVJYMq5XJJczpggzmiyWzbo2igT8L7B0ziAwsdAK0TeAd3-5-L6Y3QyosjGG_WbBR7HjL2_Aw4acMTT26KrvGPVMofcjAMiRgSNZ',
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
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCCxlqLJJqOIHXp06ZQpOSR3Jd6P5zHNtcXiJZqtB079IIKsbDJwd1xigZS-lqBdvDdw0k66fj-8vHXbzYJkO8Xtam3mneE6Ij7VRZSltkchNk0PBj6xyaIximPDp5NgtQTpMxJzTNCkWCXXGjqld6wtWLQArlh7q2HNjsyXv7VVdHBKYhRaTEJWp1FC3GRhQ1vCcHFusgtQQ5GIGBzC2vS9IYhY0O6sTj1wIV5YN-ODESF3io_KAowhDPVLEx24aHa3KTnjtASjcUn',
      replies: [
        {
          id: 21,
          author: 'Nguyễn Văn A',
          role: 'TÁC GIẢ',
          time: '30 phút trước',
          content:
            'Theo tôi biết thì đang có chương trình tích điểm đổi quà cho đơn hàng trên 50 triệu đó bạn.',
          likes: 0,
          avatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCd7kAzZGsawf2ZQAN57Bsk8gVkPiWD9arBCWHLjg6ufHd97yZTYrvQo3xCtGQriM3eOdInWBcO61hueNNIsMWnYmBNIUrjvKOuu-1GtuqyIq1TKaVOIGmUMC-Cza2B-wHCMvOWnC8CUXUJZh3Jb6wLvziATIcpGPUrB0ukKIK6yVJYMq5XJJczpggzmiyWzbo2igT8L7B0ziAwsdAK0TeAd3-5-L6Y3QyosjGG_WbBR7HjL2_Aw4acMTT26KrvGPVMofcjAMiRgSNZ',
        },
      ],
    },
  ],
  relatedPosts: [
    {
      id: 1,
      title: 'Sỉ gạch men ốp lát Prime mẫu mới 2024',
      price: 'Từ 85.000đ/m2',
      author: 'Đại lý Hùng Cường',
      location: 'Hà Đông',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCmnX_7QP1yfIYhYfhpQIuaTzHN3O8xmc5BvwJy3kyAK8vM1QYAwfTengDN4GEqxIh_acr4qwm_hWssFPglBTtygwPUnK9FYCdOmlJ8zwr9kxE0h_y5cw3cPnuRldiEsOVj6cAiRan2Rf4eWfpAwtNFki3EwH3U4-Ax8Do-SKMxYUd5wPmpsXR3O4C9JneN3uO8-ANQumZxZWHemShbyzNrxL6lFJgSaa4pjUdBCn72ZcyQfDq9ReDrM9KScNQlWpkSEKUa0BpitvIt',
    },
    {
      id: 2,
      title: 'Tìm đối tác thầu sơn bả dự án chung cư mini',
      badge: 'Dự án • Cần gấp',
      badgeTone: 'text-secondary',
      author: 'Công ty XD Hòa Bình',
      time: '3 giờ trước',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDO7sQgRlr5m1UZAiaY-zmtAHlFUbfwGqFkxH7KLJWEwvr3hv_G8Yled6PAqcmqOC_f-JMTNVBQUUPewekJvdwt8zKAanHcLyEpHWSR_gu7qzxhbDwLpnMsIzva8pvh-4DVwjKgNn0PCOFStTwsfziKYMidmevZFJ4ssFL3rmCKCRyKG0HrU-6coxTAde1vcy1fBU48fb93epN5z0NOmZyOr7FJ8-ScwDmiPgXE5IboPxkzMwSNrOxI5mcWSFpIBkO4MlJXgPQLSfLM',
    },
    {
      id: 3,
      title: 'Thanh lý lô thép Hòa Phát 50 tấn tồn kho',
      price: '17.200đ/kg',
      author: 'Kho Thép Miền Bắc',
      location: '5 giờ trước',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDtJ4hyUCgCghnV41FK2Y6BFKj60n9cGH2KJuDI3mOo_C96pWQP8G7Jl3ObaakANuQp4TMEqhmarB2sw4mrnvwQRbZpBE9yuVqyrvH2248wMrYBqBTzHFxW5qgL5moJT_6Pv6Z3N0s-0kDDtYpPU20I1ZrR-l4lwrIdZDQ8oB8_PQCKpJ4e0XDJaVKEgsltIYXp4tBP-bVGKe9Jm9c2pfPd0hG_A58VTnscRJwg77TpeFFEoDvIkFrzyFso6Y5LBxnYZVhUIfcay8do',
    },
  ],
  trends: [
    { name: 'Máy khoan Makita HP1630', change: '+12%', isPositive: true },
    { name: 'Thép xây dựng Hòa Phát', change: '-2.5%', isPositive: false },
    { name: 'Sơn Dulux Weathershield', change: '+18%', isPositive: true },
  ],
  tags: ['Sơn KOVA', 'Chống thấm', 'Đại lý', 'B2B', 'Vật liệu'],
};

const supplyPost = {
  type: 'supply',
  post: {
    id: 2,
    typeLabel: 'Tìm nguồn hàng',
    typeTone: 'bg-orange-50 text-orange-700 border-orange-100',
    title: 'Cần tìm xưởng gia công Bulong neo M24 số lượng lớn tại Long An',
    author: 'Đại lý Tiến Mạnh',
    authorRole: 'Nhà mua hàng',
    authorVerified: true,
    authorRating: 4.5,
    authorReviewCount: 48,
    location: 'Long An',
    date: '5 giờ trước',
    views: 245,
    avatar: 'DT',
    tags: ['#tim_nguon_hang', '#bulong_neo', '#gia_cong_co_khi', '#gap'],
    description:
      'Đại lý chúng tôi đang cần tìm xưởng sản xuất trực tiếp có khả năng gia công Bulong neo M24x800, mạ kẽm nhúng nóng. Số lượng đợt 1 khoảng 5.000 bộ. Yêu cầu báo giá xuất xưởng cạnh tranh, có chứng chỉ CO/CQ đầy đủ.\n\nYêu cầu bắt buộc:\n- Thép CT3 hoặc SS400 đúng tiêu chuẩn\n- Mạ kẽm nhúng nóng TCVN 5408\n- Ren hệ mét M24 bước 3.0\n- Chịu lực kéo tối thiểu 800 MPa\n\nƯu tiên xưởng khu vực Long An, Tiền Giang, TP.HCM.',
    neededQty: '5.000 bộ (đợt 1)',
    deadline: 'Trước 25/06/2026',
    area: 'Long An & Miền Tây',
    products: [],
  },
  comments: [
    {
      id: 1,
      author: 'Cơ Khí Minh Phát',
      role: 'Nhà cung cấp',
      time: '3 giờ trước',
      content:
        'Bên mình có xưởng tại Bến Lức - Long An, chuyên gia công bulong neo các loại. Đã từng làm lô 10.000 bộ M24 cho dự án điện gió. Gửi em báo giá qua Zalo nhé.',
      likes: 8,
      isBest: true,
      avatar: 'CM',
      replies: [
        {
          id: 11,
          author: 'Đại lý Tiến Mạnh',
          role: 'TÁC GIẢ',
          time: '2 giờ trước',
          content: 'Cảm ơn anh, em gửi bản vẽ qua Zalo rồi. Anh check giúp em nhé.',
          likes: 2,
          avatar: 'DT',
        },
      ],
    },
    {
      id: 2,
      author: 'Thép XD Miền Nam',
      time: '1 giờ trước',
      content:
        'Bên mình cung cấp thép tấm, thép tròn SS400 chính phẩm Hòa Phát. Nếu cần nguyên liệu thì liên hệ mình nhé.',
      likes: 3,
      isBest: false,
      avatar: 'TX',
      replies: [],
    },
  ],
  relatedPosts: [
    {
      id: 1,
      title: 'Xưởng bulong ốc vít Minh Phát - Nhận gia công số lượng lớn',
      price: 'Liên hệ',
      author: 'Cơ Khí Minh Phát',
      location: 'Bến Lức, Long An',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDtJ4hyUCgCghnV41FK2Y6BFKj60n9cGH2KJuDI3mOo_C96pWQP8G7Jl3ObaakANuQp4TMEqhmarB2sw4mrnvwQRbZpBE9yuVqyrvH2248wMrYBqBTzHFxW5qgL5moJT_6Pv6Z3N0s-0kDDtYpPU20I1ZrR-l4lwrIdZDQ8oB8_PQCKpJ4e0XDJaVKEgsltIYXp4tBP-bVGKe9Jm9c2pfPd0hG_A58VTnscRJwg77TpeFFEoDvIkFrzyFso6Y5LBxnYZVhUIfcay8do',
    },
    {
      id: 2,
      title: 'Cung cấp bulong neo mạ kẽm nhúng nóng đủ kích cỡ',
      price: 'Từ 12.000đ/bộ',
      author: 'Kim Khí Thành Đạt',
      location: 'TP.HCM',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCmnX_7QP1yfIYhYfhpQIuaTzHN3O8xmc5BvwJy3kyAK8vM1QYAwfTengDN4GEqxIh_acr4qwm_hWssFPglBTtygwPUnK9FYCdOmlJ8zwr9kxE0h_y5cw3cPnuRldiEsOVj6cAiRan2Rf4eWfpAwtNFki3EwH3U4-Ax8Do-SKMxYUd5wPmpsXR3O4C9JneN3uO8-ANQumZxZWHemShbyzNrxL6lFJgSaa4pjUdBCn72ZcyQfDq9ReDrM9KScNQlWpkSEKUa0BpitvIt',
    },
  ],
  trends: [
    { name: 'Bulong neo M24 DIN 529', change: '+28%', isPositive: true },
    { name: 'Thép tròn SS400', change: '-1.5%', isPositive: false },
    { name: 'Mạ kẽm nhúng nóng', change: '+15%', isPositive: true },
  ],
  tags: ['Bulong neo', 'Gia công', 'Tìm nguồn', 'Cơ khí', 'Long An'],
};

const clearancePost = {
  type: 'clearance',
  post: {
    id: 3,
    typeLabel: 'Thanh lý kho',
    typeTone: 'bg-red-50 text-red-700 border-red-100',
    title: 'Thanh lý lô thép Hòa Phát 50 tấn tồn kho - Giá cực rẻ tại Hà Nội',
    author: 'Kho Thép Miền Bắc',
    authorRole: 'Chủ kho',
    authorVerified: true,
    authorRating: 4.6,
    authorReviewCount: 85,
    location: 'Hà Nội',
    date: '30 phút trước',
    views: 890,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDtJ4hyUCgCghnV41FK2Y6BFKj60n9cGH2KJuDI3mOo_C96pWQP8G7Jl3ObaakANuQp4TMEqhmarB2sw4mrnvwQRbZpBE9yuVqyrvH2248wMrYBqBTzHFxW5qgL5moJT_6Pv6Z3N0s-0kDDtYpPU20I1ZrR-l4lwrIdZDQ8oB8_PQCKpJ4e0XDJaVKEgsltIYXp4tBP-bVGKe9Jm9c2pfPd0hG_A58VTnscRJwg77TpeFFEoDvIkFrzyFso6Y5LBxnYZVhUIfcay8do',
    tags: ['#thanh_ly_kho', '#thep_hoa_phat', '#gia_re', '#x_kho'],
    description:
      'Cần thanh lý gấp lô thép Hòa Phát tồn kho do chuyển đổi mặt bằng kho. Hàng mới 95%, còn nguyên tem mác, chưa rỉ sét. Ưu tiên khách mua nguyên lô, hỗ trợ vận chuyển trong bán kính 50km.\n\nTình trạng: Tồn kho 3-4 tháng, bảo quản trong kho kín.\nLý do thanh lý: Chuyển kho về Bắc Ninh, cần giải phóng mặt bằng gấp.\nĐiều kiện bán: Ưu tiên mua nguyên lô, có thương lượng.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDtJ4hyUCgCghnV41FK2Y6BFKj60n9cGH2KJuDI3mOo_C96pWQP8G7Jl3ObaakANuQp4TMEqhmarB2sw4mrnvwQRbZpBE9yuVqyrvH2248wMrYBqBTzHFxW5qgL5moJT_6Pv6Z3N0s-0kDDtYpPU20I1ZrR-l4lwrIdZDQ8oB8_PQCKpJ4e0XDJaVKEgsltIYXp4tBP-bVGKe9Jm9c2pfPd0hG_A58VTnscRJwg77TpeFFEoDvIkFrzyFso6Y5LBxnYZVhUIfcay8do',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmnX_7QP1yfIYhYfhpQIuaTzHN3O8xmc5BvwJy3kyAK8vM1QYAwfTengDN4GEqxIh_acr4qwm_hWssFPglBTtygwPUnK9FYCdOmlJ8zwr9kxE0h_y5cw3cPnuRldiEsOVj6cAiRan2Rf4eWfpAwtNFki3EwH3U4-Ax8Do-SKMxYUd5wPmpsXR3O4C9JneN3uO8-ANQumZxZWHemShbyzNrxL6lFJgSaa4pjUdBCn72ZcyQfDq9ReDrM9KScNQlWpkSEKUa0BpitvIt',
    ],
    products: [
      {
        id: 'p1',
        name: 'Thép cuộn Hòa Phát CB240',
        originalPrice: '17.500đ/kg',
        clearancePrice: '15.000đ/kg',
        discount: '-14%',
        remaining: 'Còn 32 tấn',
        area: 'Hà Nội',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDtJ4hyUCgCghnV41FK2Y6BFKj60n9cGH2KJuDI3mOo_C96pWQP8G7Jl3ObaakANuQp4TMEqhmarB2sw4mrnvwQRbZpBE9yuVqyrvH2248wMrYBqBTzHFxW5qgL5moJT_6Pv6Z3N0s-0kDDtYpPU20I1ZrR-l4lwrIdZDQ8oB8_PQCKpJ4e0XDJaVKEgsltIYXp4tBP-bVGKe9Jm9c2pfPd0hG_A58VTnscRJwg77TpeFFEoDvIkFrzyFso6Y5LBxnYZVhUIfcay8do',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCmnX_7QP1yfIYhYfhpQIuaTzHN3O8xmc5BvwJy3kyAK8vM1QYAwfTengDN4GEqxIh_acr4qwm_hWssFPglBTtygwPUnK9FYCdOmlJ8zwr9kxE0h_y5cw3cPnuRldiEsOVj6cAiRan2Rf4eWfpAwtNFki3EwH3U4-Ax8Do-SKMxYUd5wPmpsXR3O4C9JneN3uO8-ANQumZxZWHemShbyzNrxL6lFJgSaa4pjUdBCn72ZcyQfDq9ReDrM9KScNQlWpkSEKUa0BpitvIt',
        ],
        specs: [
          { name: 'Mác thép', value: 'CB240, CB300 theo TCVN 1651' },
          { name: 'Đường kính', value: 'D6 - D10' },
          { name: 'Tiêu chuẩn', value: 'TCVN 1651-1:2018' },
          { name: 'Xuất xứ', value: 'Hòa Phát - Việt Nam' },
          { name: 'Tình trạng', value: 'Mới 95%, bảo quản kho kín' },
          { name: 'Chứng từ', value: 'CO/CQ đầy đủ, hóa đơn VAT' },
        ],
      },
      {
        id: 'p2',
        name: 'Thép cây Hòa Phát D16 CB400',
        originalPrice: '18.200đ/kg',
        clearancePrice: '15.500đ/kg',
        discount: '-15%',
        remaining: 'Còn 12 tấn',
        area: 'Hà Nội & Bắc Ninh',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDCw0jz3n9PDya1tWltdmDZh4D2zTE80cj7Hf-4x3WaEj9uAoa79i6-qvMzxms8Lhaf4o1KDH4_vBBpTIpGDrAzJ9CsIPbH54eYY0I6g46puw3t2CxizRk7tH3_Bj7TwRfMqsqD0ZdqWs8g74qLiUpLgx98QGFyQxgDlUazIfJjAidkFwwP9Rcjgb66TyrRkG6MPwAkYHvR4k56GnKMBCoYzi4Ys--dBCLaLY_Xoy_1wyL8YKmd7IZ6_GE1_jw_UzaFk2kd1pZ12b9U',
        ],
        specs: [
          { name: 'Mác thép', value: 'CB400 theo TCVN 1651' },
          { name: 'Đường kính', value: 'D16, D20, D25' },
          { name: 'Chiều dài', value: '11.7m/cây' },
          { name: 'Tiêu chuẩn', value: 'TCVN 1651-1:2018' },
          { name: 'Tình trạng', value: 'Mới 95%, nguyên bó' },
        ],
      },
      {
        id: 'p3',
        name: 'Thép hình Hòa Phát I-Beam',
        originalPrice: '21.000đ/kg',
        clearancePrice: '17.800đ/kg',
        discount: '-15%',
        remaining: 'Còn 6 tấn',
        area: 'Hà Nội',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAxaYLPoqzswv0C9BVWeYThcYbPZax1JrDCfzJUVW_Lyv8ZGOITbfzh7LyNdQAUHnu6IGoz9GA15GQ9k9uNZnoYi9_tIiHwZ17cohRXbZGg_Z-CJNSLrlyo7wJ6A6NIA7AUbp_BkYg6p9b4r-1GZ1IZRwUvglCbV5VCqKqh81ZJfy8ViRpqCMeo75N1QGXkhKlYTAWKUqe8kTlzdSWde-BtxoKEeT58fJh3kKITDk6X163ZytmgSEZy8rF0XwJAv1XYsXnzqxdWKke4',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ9m8gsGcmUO0FCtPyX9RhIluNVkX3-YyYHYbuvN1jXqmVXhEY35h-2lfYfGvFs3GJZMhZzMFU21IAgk1gxXy4U8Me8h4K7yb92S2TEfo1m5q0vT0PNc8oEqRUmNh4uNnzxzX5EZgm8QGtyuIN2NVSXsSqfD33ZL3lLH15W-zpJrlLewF2S6QhvlKM-DtKsdJPy2JPvxysOjfEQ2JzUB2L3Qk036VIhAEM_F_0vcP3ABYfeRAAmZ9ymp-YHTZU6ziZZ_szaaSV6YFg',
        ],
        specs: [
          { name: 'Mác thép', value: 'SS400, Q235B' },
          { name: 'Kích thước', value: 'I200x100, I300x150' },
          { name: 'Tiêu chuẩn', value: 'JIS G3101 / TCVN' },
          { name: 'Tình trạng', value: 'Mới 90%, tồn kho 5 tháng' },
        ],
      },
    ],
  },
  comments: [
    {
      id: 1,
      author: 'Đại lý Sắt Thép Hưng Thịnh',
      role: null,
      time: '20 phút trước',
      content:
        'Giá này quá tốt! Cho mình đặt 10 tấn thép D10 và D12 nhé. Mai mình qua kho xem hàng và chốt cọc luôn.',
      likes: 15,
      isBest: true,
      avatar: 'HT',
      replies: [
        {
          id: 11,
          author: 'Kho Thép Miền Bắc',
          role: 'TÁC GIẢ',
          time: '15 phút trước',
          content: 'Dạ ok anh, em để dành 10 tấn cho anh. Sáng mai 8h mở cửa kho, anh qua nhé.',
          likes: 3,
          avatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDtJ4hyUCgCghnV41FK2Y6BFKj60n9cGH2KJuDI3mOo_C96pWQP8G7Jl3ObaakANuQp4TMEqhmarB2sw4mrnvwQRbZpBE9yuVqyrvH2248wMrYBqBTzHFxW5qgL5moJT_6Pv6Z3N0s-0kDDtYpPU20I1ZrR-l4lwrIdZDQ8oB8_PQCKpJ4e0XDJaVKEgsltIYXp4tBP-bVGKe9Jm9c2pfPd0hG_A58VTnscRJwg77TpeFFEoDvIkFrzyFso6Y5LBxnYZVhUIfcay8do',
        },
      ],
    },
    {
      id: 2,
      author: 'Nhà thầu Minh Đức',
      time: '10 phút trước',
      content: 'Còn thép D16 không anh? Em cần 5 tấn cho công trình bên Gia Lâm.',
      likes: 2,
      isBest: false,
      avatar: 'MD',
      replies: [],
    },
  ],
  relatedPosts: [
    {
      id: 1,
      title: 'Xả kho đá cắt Hải Dương 100mm giá cực sốc',
      price: 'Chỉ từ 4.500đ/viên',
      author: 'Kim Khí Miền Bắc',
      location: 'Bắc Ninh',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAxaYLPoqzswv0C9BVWeYThcYbPZax1JrDCfzJUVW_Lyv8ZGOITbfzh7LyNdQAUHnu6IGoz9GA15GQ9k9uNZnoYi9_tIiHwZ17cohRXbZGg_Z-CJNSLrlyo7wJ6A6NIA7AUbp_BkYg6p9b4r-1GZ1IZRwUvglCbV5VCqKqh81ZJfy8ViRpqCMeo75N1QGXkhKlYTAWKUqe8kTlzdSWde-BtxoKEeT58fJh3kKITDk6X163ZytmgSEZy8rF0XwJAv1XYsXnzqxdWKke4',
    },
    {
      id: 2,
      title: 'Thanh lý máy cắt sắt Makita LC1230 đời 2023',
      price: 'Giá thanh lý: 12.5tr',
      author: 'Dụng Cụ Pro',
      location: 'TP.HCM',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ9m8gsGcmUO0FCtPyX9RhIluNVkX3-YyYHYbuvN1jXqmVXhEY35h-2lfYfGvFs3GJZMhZzMFU21IAgk1gxXy4U8Me8h4K7yb92S2TEfo1m5q0vT0PNc8oEqRUmNh4uNnzxzX5EZgm8QGtyuIN2NVSXsSqfD33ZL3lLH15W-zpJrlLewF2S6QhvlKM-DtKsdJPy2JPvxysOjfEQ2JzUB2L3Qk036VIhAEM_F_0vcP3ABYfeRAAmZ9ymp-YHTZU6ziZZ_szaaSV6YFg',
    },
  ],
  trends: [
    { name: 'Thép Hòa Phát D10', change: '-8%', isPositive: false },
    { name: 'Thép Việt Nhật', change: '-3%', isPositive: false },
  ],
  tags: ['Thanh lý', 'Thép', 'Hòa Phát', 'Giá rẻ', 'Tồn kho'],
};

const groupBuyPost = {
  type: 'groupBuy',
  post: {
    id: 4,
    typeLabel: 'Mua chung',
    typeTone: 'bg-purple-50 text-purple-700 border-purple-100',
    title: 'Rủ mua chung máy khoan pin Bosch GSB 18V-50 - Tiết kiệm 22% khi đủ 20 người',
    author: 'Anh Tuấn - Kim Khí SG',
    authorRole: 'Trưởng nhóm mua',
    authorVerified: true,
    authorRating: 4.9,
    authorReviewCount: 32,
    location: 'TP.HCM',
    date: '1 giờ trước',
    views: 560,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZWykIdoBcv3hsnrKrDb3I7RuCyGP1qMnHJzwNnpJqntdhAzj56h6-hgnP0JTtExf8a2WnsZH5IS-kdCNnP-XwjuWJrxhCGBnFSDLwFurTw2WyvXX7gUYnYAMIt-_G4km8LP68TP9n14ZRtnurgMrgJln-DtPJvZZ0bU-ocmMejXjNuVvnOcVouGnokgdNy4bHi5CDv_c8hIi3jbRioAowGvaIPhwEMr4vUE7Sy9gjTw15nDdRPttPFXdhN_f6NjszHkYucdmZAqCY',
    tags: ['#mua_chung', '#bosch', '#may_khoan_pin', '#gop_don'],
    description:
      'Mình đang tổ chức mua chung lô máy khoan pin Bosch GSB 18V-50 (hàng chính hãng nhập khẩu). Đây là dòng chuyên nghiệp 18V, không chổi than, lực siết 50Nm. Khi mua lẻ giá ~3.650.000đ/máy.\n\nKhi gom đủ số lượng, giá sẽ giảm sâu theo bậc bên dưới. Mình đứng ra làm việc trực tiếp với nhà phân phối, có VAT đầy đủ, bảo hành 6 tháng 1 đổi 1.\n\nAi tham gia thì comment hoặc nhắn Zalo mình: 090xxxxxxx.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDCw0jz3n9PDya1tWltdmDZh4D2zTE80cj7Hf-4x3WaEj9uAoa79i6-qvMzxms8Lhaf4o1KDH4_vBBpTIpGDrAzJ9CsIPbH54eYY0I6g46puw3t2CxizRk7tH3_Bj7TwRfMqsqD0ZdqWs8g74qLiUpLgx98QGFyQxgDlUazIfJjAidkFwwP9Rcjgb66TyrRkG6MPwAkYHvR4k56GnKMBCoYzi4Ys--dBCLaLY_Xoy_1wyL8YKmd7IZ6_GE1_jw_UzaFk2kd1pZ12b9U',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAxaYLPoqzswv0C9BVWeYThcYbPZax1JrDCfzJUVW_Lyv8ZGOITbfzh7LyNdQAUHnu6IGoz9GA15GQ9k9uNZnoYi9_tIiHwZ17cohRXbZGg_Z-CJNSLrlyo7wJ6A6NIA7AUbp_BkYg6p9b4r-1GZ1IZRwUvglCbV5VCqKqh81ZJfy8ViRpqCMeo75N1QGXkhKlYTAWKUqe8kTlzdSWde-BtxoKEeT58fJh3kKITDk6X163ZytmgSEZy8rF0XwJAv1XYsXnzqxdWKke4',
    ],
    participants: 12,
    targetParticipants: 20,
    deadline: 'Còn 3 ngày',
    area: 'TP.HCM & Toàn quốc',
    priceTiers: [
      { qty: '1-4 người', price: '3.650.000đ', note: 'Giá lẻ thị trường' },
      { qty: '5-9 người', price: '3.200.000đ', note: 'Giảm 12%' },
      { qty: '10-19 người', price: '3.000.000đ', note: 'Giảm 18%' },
      { qty: '20+ người', price: '2.850.000đ', note: 'Giảm 22% - Mục tiêu!' },
    ],
    products: [
      {
        id: 'p1',
        name: 'Máy khoan pin Bosch GSB 18V-50',
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDCw0jz3n9PDya1tWltdmDZh4D2zTE80cj7Hf-4x3WaEj9uAoa79i6-qvMzxms8Lhaf4o1KDH4_vBBpTIpGDrAzJ9CsIPbH54eYY0I6g46puw3t2CxizRk7tH3_Bj7TwRfMqsqD0ZdqWs8g74qLiUpLgx98QGFyQxgDlUazIfJjAidkFwwP9Rcjgb66TyrRkG6MPwAkYHvR4k56GnKMBCoYzi4Ys--dBCLaLY_Xoy_1wyL8YKmd7IZ6_GE1_jw_UzaFk2kd1pZ12b9U',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAxaYLPoqzswv0C9BVWeYThcYbPZax1JrDCfzJUVW_Lyv8ZGOITbfzh7LyNdQAUHnu6IGoz9GA15GQ9k9uNZnoYi9_tIiHwZ17cohRXbZGg_Z-CJNSLrlyo7wJ6A6NIA7AUbp_BkYg6p9b4r-1GZ1IZRwUvglCbV5VCqKqh81ZJfy8ViRpqCMeo75N1QGXkhKlYTAWKUqe8kTlzdSWde-BtxoKEeT58fJh3kKITDk6X163ZytmgSEZy8rF0XwJAv1XYsXnzqxdWKke4',
        ],
        specs: [
          { name: 'Điện áp', value: '18V Lithium-ion' },
          { name: 'Lực siết tối đa', value: '50 Nm' },
          { name: 'Tốc độ không tải', value: '0-460 / 0-1.800 vòng/phút' },
          { name: 'Đầu kẹp', value: '13mm không khóa tự động' },
          { name: 'Trọng lượng', value: '1.2kg (không pin)' },
          { name: 'Bảo hành', value: '6 tháng 1 đổi 1' },
        ],
      },
    ],
  },
  comments: [
    {
      id: 1,
      author: 'Thợ Xây Dựng TV',
      role: null,
      time: '45 phút trước',
      content: 'Cho mình đăng ký 2 máy nhé. Đợt trước mua lẻ 3tr65, giờ gom được giá này quá ngon!',
      likes: 8,
      isBest: false,
      avatar: 'TX',
      replies: [],
    },
    {
      id: 2,
      author: 'Cửa Hàng Điện Cơ',
      role: 'Thành viên',
      time: '30 phút trước',
      content:
        'Mình đăng ký 3 máy. Mọi người tham gia nhanh để đủ 20 người nha, còn 3 ngày nữa thôi!',
      likes: 5,
      isBest: true,
      avatar: 'DC',
      replies: [
        {
          id: 21,
          author: 'Anh Tuấn - Kim Khí SG',
          role: 'TÁC GIẢ',
          time: '25 phút trước',
          content:
            'Cảm ơn 2 bạn! Đã có 12/20 người rồi, còn 8 slot nữa thôi. Mình sẽ chốt đơn vào tối thứ 6.',
          likes: 4,
          avatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBZWykIdoBcv3hsnrKrDb3I7RuCyGP1qMnHJzwNnpJqntdhAzj56h6-hgnP0JTtExf8a2WnsZH5IS-kdCNnP-XwjuWJrxhCGBnFSDLwFurTw2WyvXX7gUYnYAMIt-_G4km8LP68TP9n14ZRtnurgMrgJln-DtPJvZZ0bU-ocmMejXjNuVvnOcVouGnokgdNy4bHi5CDv_c8hIi3jbRioAowGvaIPhwEMr4vUE7Sy9gjTw15nDdRPttPFXdhN_f6NjszHkYucdmZAqCY',
        },
      ],
    },
  ],
  relatedPosts: [
    {
      id: 1,
      title: 'Mua chung máy hàn que Hồng Ký HK-200A - Giảm 30%',
      badge: 'Còn 5 slot',
      badgeTone: 'text-purple-600',
      author: 'Hội Thợ Hàn SG',
      time: '2 giờ trước',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCmnX_7QP1yfIYhYfhpQIuaTzHN3O8xmc5BvwJy3kyAK8vM1QYAwfTengDN4GEqxIh_acr4qwm_hWssFPglBTtygwPUnK9FYCdOmlJ8zwr9kxE0h_y5cw3cPnuRldiEsOVj6cAiRan2Rf4eWfpAwtNFki3EwH3U4-Ax8Do-SKMxYUd5wPmpsXR3O4C9JneN3uO8-ANQumZxZWHemShbyzNrxL6lFJgSaa4pjUdBCn72ZcyQfDq9ReDrM9KScNQlWpkSEKUa0BpitvIt',
    },
    {
      id: 2,
      title: 'Gom đơn mua sỉ sơn chống thấm KOVA - Chiết khấu 35%',
      price: 'Giá sỉ gốc tận kho',
      author: 'Đại Lý Sơn VIP',
      location: 'Hà Nội',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ9m8gsGcmUO0FCtPyX9RhIluNVkX3-YyYHYbuvN1jXqmVXhEY35h-2lfYfGvFs3GJZMhZzMFU21IAgk1gxXy4U8Me8h4K7yb92S2TEfo1m5q0vT0PNc8oEqRUmNh4uNnzxzX5EZgm8QGtyuIN2NVSXsSqfD33ZL3lLH15W-zpJrlLewF2S6QhvlKM-DtKsdJPy2JPvxysOjfEQ2JzUB2L3Qk036VIhAEM_F_0vcP3ABYfeRAAmZ9ymp-YHTZU6ziZZ_szaaSV6YFg',
    },
  ],
  trends: [
    { name: 'Máy khoan pin Bosch', change: '+42%', isPositive: true },
    { name: 'Máy hàn điện tử', change: '+18%', isPositive: true },
  ],
  tags: ['Mua chung', 'Bosch', 'Máy khoan', 'Giá sỉ', 'Góp đơn'],
};

const postDetailMockData = {
  wholesale: wholesalePost,
  supply: supplyPost,
  clearance: clearancePost,
  groupBuy: groupBuyPost,
};

export { wholesalePost, supplyPost, clearancePost, groupBuyPost };
export default postDetailMockData;
