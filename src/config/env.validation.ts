import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

type Environment = 'development' | 'production' | 'test'

class EnvironmentVariables {
  @IsEnum(['development', 'production', 'test'] as const)
  NODE_ENV!: Environment

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET!: string

  @IsString()
  @IsOptional()
  JWT_REFRESH_SECRET?: string

  @IsString()
  @IsOptional()
  DATABASE_URL?: string

  @IsString()
  @IsOptional()
  REDIS_URL?: string
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  })

  if (errors.length > 0) {
    throw new Error(errors.toString())
  }

  return config
}
