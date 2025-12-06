import { Logger } from '@nestjs/common'
import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm'

export class DatabaseLogger implements TypeOrmLogger {
  private readonly logger = new Logger('TypeORM')

  logQuery(query: string, parameters?: unknown[]) {
    this.logger.debug(`Query: ${query} -- Params: ${JSON.stringify(parameters ?? [])}`)
  }

  logQueryError(error: string, query: string, parameters?: unknown[]) {
    this.logger.error(`Query Failed: ${query} -- Params: ${JSON.stringify(parameters ?? [])}`, error)
  }

  logQuerySlow(time: number, query: string, parameters?: unknown[]) {
    this.logger.warn(`Slow Query (${time}ms): ${query} -- Params: ${JSON.stringify(parameters ?? [])}`)
  }

  logSchemaBuild(message: string) {
    this.logger.debug(message)
  }

  logMigration(message: string) {
    this.logger.log(message)
  }

  log(level: 'log' | 'info' | 'warn', message: string) {
    if (level === 'log' || level === 'info') {
      this.logger.log(message)
    } else if (level === 'warn') {
      this.logger.warn(message)
    }
  }
}
