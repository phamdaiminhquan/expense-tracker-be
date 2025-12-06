import { Column, Entity } from 'typeorm'

import { BaseEntity } from '../../common/base.entity'

@Entity('users')
export class User extends BaseEntity {

  @Column({ unique: true })
  email!: string

  @Column()
  name!: string

  @Column({ select: false })
  passwordHash!: string

}
