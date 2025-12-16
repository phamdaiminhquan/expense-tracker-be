import { Column, Entity, OneToMany } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { FundMember } from './fund-member.entity'
import { Message } from '../../messages/message.entity'
import { BaseEntity } from '../../../common/base.entity'
import { FundType } from '../enums/fund-type.enum'

@Entity('funds')
export class Fund extends BaseEntity {

  @ApiProperty({ example: 'Family budget', description: 'Fund name' })
  @Column()
  name!: string

  @ApiProperty({ enum: FundType, example: FundType.PERSONAL, description: 'Fund type' })
  @Column({ type: 'enum', enum: FundType, default: FundType.PERSONAL })
  type!: FundType

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Owner user ID' })
  @Column({ type: 'uuid' })
  ownerId!: string

  @ApiPropertyOptional({ type: () => [FundMember], description: 'Fund memberships' })
  @OneToMany(() => FundMember, (member) => member.fund)
  memberships!: FundMember[]

  @ApiPropertyOptional({ type: () => [Message], description: 'Fund messages' })
  @OneToMany(() => Message, (message) => message.fund)
  messages!: Message[]

}
