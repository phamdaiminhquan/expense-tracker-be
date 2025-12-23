import { ApiProperty } from '@nestjs/swagger'
import { Equals, IsBoolean } from 'class-validator'

export class CloseDialogCateDto {
  @ApiProperty({ example: false, description: 'Set category dialog to closed' })
  @IsBoolean()
  @Equals(false)
  isOpenDialogCate!: boolean
}
