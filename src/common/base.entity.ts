import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export class BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    createdAt!: Date

    @Column({ type: 'uuid', nullable: true })
    createdById?: string | null

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    updatedAt!: Date

    @Column({ type: 'uuid', nullable: true })
    updatedById?: string | null

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deletedAt?: Date | null
}