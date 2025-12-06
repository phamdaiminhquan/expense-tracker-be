import { Module } from '@nestjs/common'
import { Logger } from '@nestjs/common'

@Module({
  providers: [Logger],
  exports: [Logger],
})
export class LoggerModule {}
