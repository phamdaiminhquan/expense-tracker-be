export default () => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    corsOrigins: (process.env.CORS_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
    logLevel: process.env.LOG_LEVEL ?? 'info',
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
    logging: process.env.DATABASE_LOGGING === 'true',
  },
  redis: {
    url: process.env.REDIS_URL ?? '',
  },
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '900s',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change-me-too',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
    apiUrl: process.env.GEMINI_API_URL ?? 'https://generativelanguage.googleapis.com',
    geminiApiVersion: process.env.GEMINI_API_VERSION ?? 'v1beta',
    geminiMethod: process.env.GEMINI_METHOD ?? 'generateContent',
    requestTimeoutMs: Number(process.env.GEMINI_TIMEOUT_MS ?? 10000),
  },
})
