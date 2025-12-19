/**
 * Default categories được định nghĩa sẵn cho tất cả funds
 * Cấu trúc 2 cấp: parent category và child categories
 */
export interface DefaultCategoryDefinition {
  name: string
  description?: string
  children?: Array<{
    name: string
    description?: string
  }>
}

export const DEFAULT_CATEGORIES: DefaultCategoryDefinition[] = [
  {
    name: 'Food & Drinks',
    description: 'Chi phí ăn uống',
    children: [
      { name: 'Groceries', description: 'Đi chợ, siêu thị' },
      { name: 'Restaurants', description: 'Nhà hàng, quán ăn' },
      { name: 'Coffee & Tea', description: 'Cà phê, trà' },
      { name: 'Fast Food', description: 'Đồ ăn nhanh' },
    ],
  },
  {
    name: 'Transportation',
    description: 'Chi phí đi lại',
    children: [
      { name: 'Gas/Fuel', description: 'Xăng, dầu' },
      { name: 'Public Transport', description: 'Xe bus, tàu, taxi' },
      { name: 'Parking', description: 'Gửi xe' },
      { name: 'Maintenance', description: 'Bảo dưỡng xe' },
    ],
  },
  {
    name: 'Shopping',
    description: 'Mua sắm',
    children: [
      { name: 'Clothing', description: 'Quần áo' },
      { name: 'Electronics', description: 'Điện tử' },
      { name: 'Home & Garden', description: 'Nhà cửa, vườn' },
      { name: 'Personal Care', description: 'Chăm sóc cá nhân' },
    ],
  },
  {
    name: 'Bills & Utilities',
    description: 'Hóa đơn, tiện ích',
    children: [
      { name: 'Electricity', description: 'Điện' },
      { name: 'Water', description: 'Nước' },
      { name: 'Internet', description: 'Internet' },
      { name: 'Phone', description: 'Điện thoại' },
    ],
  },
  {
    name: 'Entertainment',
    description: 'Giải trí',
    children: [
      { name: 'Movies', description: 'Phim ảnh' },
      { name: 'Games', description: 'Trò chơi' },
      { name: 'Events', description: 'Sự kiện' },
      { name: 'Hobbies', description: 'Sở thích' },
    ],
  },
  {
    name: 'Health & Fitness',
    description: 'Sức khỏe, thể dục',
    children: [
      { name: 'Medical', description: 'Y tế' },
      { name: 'Pharmacy', description: 'Thuốc' },
      { name: 'Gym', description: 'Phòng gym' },
      { name: 'Sports', description: 'Thể thao' },
    ],
  },
  {
    name: 'Education',
    description: 'Giáo dục',
    children: [
      { name: 'Tuition', description: 'Học phí' },
      { name: 'Books', description: 'Sách' },
      { name: 'Courses', description: 'Khóa học' },
      { name: 'Supplies', description: 'Đồ dùng học tập' },
    ],
  },
  {
    name: 'Income',
    description: 'Thu nhập',
    children: [
      { name: 'Salary', description: 'Lương' },
      { name: 'Freelance', description: 'Làm tự do' },
      { name: 'Investment', description: 'Đầu tư' },
      { name: 'Gift', description: 'Quà tặng' },
    ],
  },
]

