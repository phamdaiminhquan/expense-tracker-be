import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'

export function setupSwagger(app: NestExpressApplication): void {
  const nodeEnv = process.env.NODE_ENV || 'development'

  // Only enable Swagger in development and staging environments
  if (nodeEnv === 'production') {
    return
  }

  const config = new DocumentBuilder()
    .setTitle('API Quản Lý Chi Tiêu')
    .setDescription(
      `
## Tổng quan
API Quản Lý Chi Tiêu cung cấp các endpoint để quản lý tài chính cá nhân và nhóm.

## Tính năng
- **Xác thực**: Đăng nhập, đăng ký, xác thực bằng JWT (token truy cập và làm mới)
- **Quản lý quỹ**: Tạo và quản lý quỹ cá nhân hoặc nhóm
- **Danh mục**: Phân loại giao dịch theo danh mục tuỳ chỉnh
- **Tin nhắn/Giao dịch**: Phân tích chi tiêu từ ngôn ngữ tự nhiên bằng AI
- **Thống kê**: Xem báo cáo, tổng hợp chi tiêu

## Xác thực
Hầu hết các endpoint yêu cầu xác thực. Sử dụng các endpoint \`/auth/login\` hoặc \`/auth/register\` để lấy token.
Gửi access token trong header Authorization theo dạng: \`Bearer <token>\`
      `.trim(),
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Nhập JWT access token của bạn',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Các endpoint xác thực')
    .addTag('funds', 'Các endpoint quản lý quỹ')
    .addTag('categories', 'Các endpoint quản lý danh mục')
    .addTag('messages', 'Các endpoint tin nhắn/giao dịch')
    .addTag('statistics', 'Các endpoint thống kê & báo cáo')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'API Quản Lý Chi Tiêu',
  })
}

