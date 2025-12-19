import { applyDecorators } from '@nestjs/common'
import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export function ApiPropertyOptionalCustom(
  options?: Parameters<typeof ApiPropertyOptional>[0],
): PropertyDecorator {
  return applyDecorators(ApiPropertyOptional(options), IsOptional())
}

