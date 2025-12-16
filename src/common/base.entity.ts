import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class BaseEntity {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Unique identifier' })
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Creation timestamp' })
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    createdAt!: Date

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'ID of the user who created this record' })
    @Column({ type: 'uuid', nullable: true })
    createdById?: string | null

    @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Last update timestamp' })
    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    updatedAt!: Date

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'ID of the user who last updated this record' })
    @Column({ type: 'uuid', nullable: true })
    updatedById?: string | null

    @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z', description: 'Soft delete timestamp', nullable: true })
    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deletedAt?: Date | null
}