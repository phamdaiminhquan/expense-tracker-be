import { Column, Entity } from 'typeorm'
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger'

import { BaseEntity } from '../../common/base.entity'

@Entity('users')
export class User extends BaseEntity {

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @Column({ unique: true })
  email!: string

  @ApiProperty({ example: 'Nguyen Van A', description: 'User display name' })
  @Column()
  name!: string

  @ApiHideProperty()
  @Column({ select: false })
  passwordHash!: string

}
