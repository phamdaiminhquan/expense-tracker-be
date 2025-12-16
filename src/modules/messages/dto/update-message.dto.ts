import { PartialType } from '@nestjs/swagger'

import { CreatemessageDto } from './create-message.dto'

export class UpdatemessageDto extends PartialType(CreatemessageDto) {}
