import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
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

  @ApiProperty({ example: '023433', description: 'Unique fund share code (numberId)' })
  @Column({ type: 'varchar', length: 6, unique: true, nullable: true })
  @Index()
  numberId?: string | null

  @ApiPropertyOptional({ example: 'Family expense tracking fund', description: 'Fund description' })
  @Column({ type: 'text', nullable: true })
  description?: string | null

  @ApiPropertyOptional({ 
    example: '550e8400-e29b-41d4-a716-446655440000', 
    format: 'uuid', 
    description: 'ID of the last message in this fund (denormalized for performance)' 
  })
  @Column({ type: 'uuid', nullable: true })
  lastMessageId?: string | null

    @ApiPropertyOptional({ 
    example: '2024-01-01T00:00:00.000Z', 
    description: 'Timestamp of the last message (denormalized for sorting performance)' 
  })
  @Column({ type: 'timestamp', nullable: true })
  lastMessageTimestamp?: Date | null

  @ApiPropertyOptional({ example: true, description: 'Whether the category dialog is open' })
  @Column({ type: 'boolean', default: true })
  isOpenDialogCate!: boolean

  @ApiPropertyOptional({ type: () => [FundMember], description: 'Fund memberships' })

  @OneToMany(() => FundMember, (member) => member.fund)
  memberships!: FundMember[]

  @ApiPropertyOptional({ type: () => [Message], description: 'Fund messages' })
  @OneToMany(() => Message, (message) => message.fund)
  messages!: Message[]

  @ApiPropertyOptional({ type: () => Message, description: 'Last message relation' })
  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'lastMessageId' })
  lastMessage?: Message | null

}
