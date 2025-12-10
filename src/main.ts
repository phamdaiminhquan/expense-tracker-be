import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'

import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'

let cachedApp: NestExpressApplication | null = null

async function createApp(): Promise<NestExpressApplication> {
  if (cachedApp) return cachedApp

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  })

  // Tạm thời mở CORS thoáng (origin: true)
  app.enableCors({
    origin: true,
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  app.use(helmet())

  cachedApp = app
  return app
}

if (require.main === module) {
  createApp()
    .then(async (app) => {
      const logger = new Logger('Bootstrap')
      const port = Number(process.env.PORT) || 3000
      await app.listen(port, '0.0.0.0')
      logger.log(`🚀 Backend listening on http://localhost:${port}`)
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to bootstrap NestJS application', error)
      process.exit(1)
    })
}

export default async function handler(req: any, res: any) {
  const app = await createApp()
  const instance = app.getHttpAdapter().getInstance()
  return instance(req, res)
}
