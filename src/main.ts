import { INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'

import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap(): Promise<INestApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // Tạm thời mở CORS thoáng (origin: true)
  app.enableCors({
    origin: true,
    credentials: true,
  })
  logger.log(`CORS configured: ${JSON.stringify({ NODE_ENV: process.env.NODE_ENV})}`);

  const configService = app.get(ConfigService)
  const env = configService.get<string>('app.env', 'development')

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  app.use(helmet())

  if (env !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Expense Tracker API')
      .setDescription('API documentation for Expense Tracker backend')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('docs', app, document)
  }

  app.enableShutdownHooks()

  return app
}

if (require.main === module) {
  bootstrap()
    .then(async (app) => {
      const configService = app.get(ConfigService)
      const bootstrapLogger = new Logger('Bootstrap')
      const port = configService.get<number>('app.port', 3000)

      await app.listen(port, '0.0.0.0')
      bootstrapLogger.log(`🚀 Backend listening on http://localhost:${port}`)
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to bootstrap NestJS application', error)
      process.exit(1)
    })
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap()
  const instance = app.getHttpAdapter().getInstance()
  return instance(req, res)
}
