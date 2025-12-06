import { Column, Entity } from 'typeorm'

import { BaseEntity } from '../../common/base.entity'

@Entity('ai_request_logs')
export class AiRequestLog extends BaseEntity {

  @Column()
  model!: string

  @Column({ type: 'json' })
  prompt!: Record<string, unknown>

  @Column({ type: 'json', nullable: true })
  response?: Record<string, unknown> | null

  @Column({ type: 'text', nullable: true })
  errorMessage?: string | null

  @Column({ type: 'integer', nullable: true })
  latencyMs?: number | null

}
