import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Logger } from '@nestjs/common'

const logger = new Logger('SwaggerConfig')

/**
 * Creates the OpenAPI document configuration
 * Separated for reusability and testing
 */
function createOpenApiConfig(): ReturnType<typeof DocumentBuilder.prototype.build> {
  return new DocumentBuilder()
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

## Import vào Postman
1. Truy cập \`/api/docs-json\` để lấy OpenAPI specification
2. Trong Postman, chọn **Import** > **Link** hoặc **Raw text**
3. Dán URL hoặc nội dung JSON
      `.trim(),
    )
    .setVersion('1.0.0')
    .addServer(process.env.API_BASE_URL || 'http://localhost:3000', 'API Server')
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
}

/**
 * Enterprise-grade Swagger setup that exposes only OpenAPI JSON specification
 * - No Swagger UI (lighter weight, better for production-like environments)
 * - Compatible with Vercel serverless deployment
 * - Can be imported into Postman, Insomnia, or other API tools
 * - Disabled in production environment
 */
export function setupSwagger(app: NestExpressApplication): void {
  const nodeEnv = process.env.NODE_ENV || 'development'

  // Only enable OpenAPI spec in development and staging environments
  if (nodeEnv === 'production') {
    logger.log('OpenAPI specification disabled in production')
    return
  }

  const config = createOpenApiConfig()
  const document = SwaggerModule.createDocument(app, config)

  // Expose only the JSON endpoint without Swagger UI
  // This is the enterprise-grade approach - lighter and more flexible
  app.getHttpAdapter().get('/api/docs-json', (_req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.send(document)
  })

  logger.log('OpenAPI JSON specification available at /api/docs-json')
}

/**
 * Get the OpenAPI document programmatically
 * Useful for generating static files or testing
 */
export function getOpenApiDocument(app: NestExpressApplication): OpenAPIObject {
  const config = createOpenApiConfig()
  return SwaggerModule.createDocument(app, config)
}

