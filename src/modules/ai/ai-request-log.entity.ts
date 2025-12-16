import { Column, Entity } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { BaseEntity } from '../../common/base.entity'

@Entity('ai_request_logs')
export class AiRequestLog extends BaseEntity {

  @ApiProperty({ example: 'gemini-pro', description: 'AI model name used for the request' })
  @Column()
  model!: string

  @ApiProperty({ description: 'The prompt sent to the AI model' })
  @Column({ type: 'json' })
  prompt!: Record<string, unknown>

  @ApiPropertyOptional({ description: 'The response from the AI model' })
  @Column({ type: 'json', nullable: true })
  response?: Record<string, unknown> | null

  @ApiPropertyOptional({ example: 'Rate limit exceeded', description: 'Error message if request failed' })
  @Column({ type: 'text', nullable: true })
  errorMessage?: string | null

  @ApiPropertyOptional({ example: 1250, description: 'Request latency in milliseconds' })
  @Column({ type: 'integer', nullable: true })
  latencyMs?: number | null

}
