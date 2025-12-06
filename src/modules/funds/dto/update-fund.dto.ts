import { PartialType } from '@nestjs/swagger'

import { CreateFundDto } from './create-fund.dto'

export class UpdateFundDto extends PartialType(CreateFundDto) {}
