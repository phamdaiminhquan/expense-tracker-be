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
    name: 'Thực phẩm – Đồ uống',
    description: 'Chi phí mua thực phẩm, nguyên liệu nấu ăn và các loại đồ uống',
    children: [
      { 
        name: 'Nguyên liệu thực phẩm', 
        description: 'Mua các nguyên liệu để nấu ăn như rau, thịt, cá, gia vị, đồ khô...' 
      },
      { 
        name: 'Bánh và đồ uống', 
        description: 'Mua bánh kẹo, đồ uống giải khát, nước đóng chai, cà phê, trà...' 
      },
      { 
        name: 'Nhà hàng quán ăn', 
        description: 'Chi phí ăn uống tại nhà hàng, quán ăn, quán cơm, quán phở...' 
      },
    ],
  },
  {
    name: 'Sinh hoạt – Tiện ích',
    description: 'Chi phí sinh hoạt hàng ngày và các tiện ích cơ bản trong gia đình',
    children: [
      { 
        name: 'Điện', 
        description: 'Tiền điện hàng tháng, nạp tiền điện' 
      },
      { 
        name: 'Nước', 
        description: 'Tiền nước sinh hoạt hàng tháng' 
      },
      { 
        name: 'Xăng dầu', 
        description: 'Chi phí đổ xăng, dầu cho xe máy, ô tô' 
      },
      { 
        name: 'Truyền hình – Viễn thông', 
        description: 'Cước internet, điện thoại, truyền hình cáp, Netflix, Spotify...' 
      },
      { 
        name: 'Tạp hóa', 
        description: 'Mua các đồ dùng lặt vặt hàng ngày tại cửa hàng tạp hóa' 
      },
      { 
        name: 'Phí dịch vụ căn hộ', 
        description: 'Phí quản lý căn hộ, phí bảo vệ, phí vệ sinh, phí gửi xe...' 
      },
      { 
        name: 'Thuê nhà', 
        description: 'Tiền thuê nhà, phòng trọ hàng tháng' 
      },
      { 
        name: 'Tiện ích khác', 
        description: 'Các chi phí tiện ích khác chưa được liệt kê' 
      },
    ],
  },
  {
    name: 'Con cái – Gia đình',
    description: 'Chi phí chăm sóc con cái và các thành viên trong gia đình',
    children: [
      { 
        name: 'Trẻ em & người lớn tuổi', 
        description: 'Chi phí chăm sóc trẻ em, người già như tã bỉm, thuốc, đồ dùng cá nhân...' 
      },
      { 
        name: 'Vật nuôi', 
        description: 'Chi phí chăm sóc thú cưng: thức ăn, khám bệnh, vệ sinh, phụ kiện...' 
      },
      { 
        name: 'Tiêu vặt', 
        description: 'Tiền tiêu vặt cho con cái, các khoản chi tiêu nhỏ lẻ' 
      },
      { 
        name: 'Học phí', 
        description: 'Học phí chính thức tại trường học, trung tâm đào tạo' 
      },
      { 
        name: 'Hỗ trợ giáo dục', 
        description: 'Đồ dùng học tập, sách vở, dụng cụ học tập, khóa học bổ trợ...' 
      },
      { 
        name: 'Nội thất & thiết bị', 
        description: 'Mua sắm đồ nội thất, thiết bị gia đình: bàn ghế, tủ, máy lạnh, máy nước nóng...' 
      },
      { 
        name: 'Tôn giáo & tâm linh', 
        description: 'Chi phí cho các hoạt động tôn giáo, tâm linh, từ thiện nhà thờ, chùa...' 
      },
    ],
  },
  {
    name: 'Mua sắm',
    description: 'Chi phí mua sắm các sản phẩm và dịch vụ',
    children: [
      { 
        name: 'Quần áo và phụ kiện', 
        description: 'Mua quần áo, giày dép, túi xách, phụ kiện thời trang' 
      },
      { 
        name: 'Đồ gia dụng', 
        description: 'Mua các đồ dùng trong nhà: bát đĩa, chén, nồi, xoong, dụng cụ nhà bếp...' 
      },
      { 
        name: 'Mua sắm trực tuyến', 
        description: 'Mua hàng online qua các sàn thương mại điện tử: Shopee, Lazada, Tiki...' 
      },
      { 
        name: 'Siêu thị/TTTM', 
        description: 'Chi phí mua sắm tại siêu thị, trung tâm thương mại, cửa hàng lớn' 
      },
      { 
        name: 'Sản phẩm cao cấp', 
        description: 'Mua các sản phẩm hàng hiệu, đồ cao cấp, xa xỉ' 
      },
      { 
        name: 'Thiết bị điện tử', 
        description: 'Mua điện thoại, laptop, máy tính, máy ảnh, loa, tai nghe...' 
      },
      { 
        name: 'Hoa tươi & quà tặng', 
        description: 'Mua hoa tươi, quà tặng, giỏ quà cho các dịp đặc biệt' 
      },
      { 
        name: 'Mua sắm khác', 
        description: 'Các khoản mua sắm khác chưa được phân loại' 
      },
    ],
  },
  {
    name: 'Sức khỏe & Làm đẹp',
    description: 'Chi phí chăm sóc sức khỏe và làm đẹp',
    children: [
      { 
        name: 'Khám chữa bệnh', 
        description: 'Chi phí khám bệnh, chữa bệnh tại bệnh viện, phòng khám, nha sĩ...' 
      },
      { 
        name: 'Thuốc & thiết bị y tế', 
        description: 'Mua thuốc, dụng cụ y tế, thiết bị chăm sóc sức khỏe tại nhà' 
      },
      { 
        name: 'Làm đẹp', 
        description: 'Chi phí làm đẹp: cắt tóc, nhuộm tóc, spa, massage, mỹ phẩm, chăm sóc da...' 
      },
      { 
        name: 'Thể thao', 
        description: 'Phí gym, yoga, thể dục, mua dụng cụ thể thao, quần áo thể thao...' 
      },
    ],
  },
  {
    name: 'Đi lại & Giao thông',
    description: 'Chi phí đi lại và giao thông vận tải',
    children: [
      { 
        name: 'Phí giao thông & chuyển phát', 
        description: 'Vé xe bus, tàu hỏa, máy bay, taxi, grab, phí gửi xe, phí cầu đường, ship hàng...' 
      },
      { 
        name: 'Phương tiện đi lại', 
        description: 'Bảo dưỡng, sửa chữa xe, thay lốp, bảo hiểm xe, đăng kiểm, rửa xe...' 
      },
    ],
  },
  {
    name: 'Giải trí & Du lịch',
    description: 'Chi phí giải trí, du lịch và các hoạt động vui chơi',
    children: [
      { 
        name: 'Dịch vụ lưu trú', 
        description: 'Chi phí khách sạn, resort, homestay khi đi du lịch' 
      },
      { 
        name: 'Du lịch & điểm vui chơi', 
        description: 'Vé tham quan, vé công viên giải trí, tour du lịch, các điểm vui chơi...' 
      },
      { 
        name: 'Phim ảnh & sự kiện', 
        description: 'Vé xem phim, vé concert, vé sự kiện thể thao, show, kịch...' 
      },
      { 
        name: 'Trò chơi', 
        description: 'Mua game, in-app purchase, phí chơi game online, arcade...' 
      },
    ],
  },
  {
    name: 'Chi phí tài chính',
    description: 'Các khoản chi phí liên quan đến tài chính và trả nợ',
    children: [
      { 
        name: 'Trả nợ thẻ tín dụng', 
        description: 'Thanh toán dư nợ thẻ tín dụng hàng tháng' 
      },
      { 
        name: 'Trả nợ vay', 
        description: 'Trả nợ vay ngân hàng, vay tín chấp, trả góp...' 
      },
      { 
        name: 'Tài chính khác', 
        description: 'Các chi phí tài chính khác: phí chuyển khoản, phí giao dịch ngân hàng...' 
      },
    ],
  },
  {
    name: 'Tặng quà & Thiện nguyện',
    description: 'Chi phí cho các hoạt động tặng quà và từ thiện',
    children: [
      { 
        name: 'Thiện nguyện', 
        description: 'Ủng hộ từ thiện, quyên góp cho các tổ chức, hội nhóm từ thiện' 
      },
      { 
        name: 'Cho tặng', 
        description: 'Tặng quà, tặng tiền cho người thân, bạn bè vào các dịp đặc biệt' 
      },
      { 
        name: 'Hiếu hỉ', 
        description: 'Chi phí phúng viếng, mừng cưới, mừng thọ, mừng tân gia...' 
      },
    ],
  },
  {
    name: 'Tiết kiệm & Đầu tư',
    description: 'Các khoản tiết kiệm và đầu tư tài chính',
    children: [
      { 
        name: 'Tiết kiệm', 
        description: 'Gửi tiền tiết kiệm ngân hàng, các khoản tiết kiệm khác' 
      },
      { 
        name: 'Đầu tư', 
        description: 'Đầu tư chứng khoán, vàng, bất động sản, cổ phiếu, trái phiếu...' 
      },
      { 
        name: 'Cho vay', 
        description: 'Cho người khác vay tiền, góp vốn kinh doanh' 
      },
      { 
        name: 'Bảo hiểm nhân thọ', 
        description: 'Đóng phí bảo hiểm nhân thọ, bảo hiểm sức khỏe định kỳ' 
      },
    ],
  },
]
