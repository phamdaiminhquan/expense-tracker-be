import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { firstValueFrom } from 'rxjs'

import { AiRequestLog } from './ai-request-log.entity'
import { Category } from '../categories/category.entity'
import { ParsedExpensePayload } from './interfaces/parsed-expense.interface'

@Injectable()
export class ModelService {
  private readonly logger = new Logger(ModelService.name)

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(AiRequestLog)
    private readonly logRepository: Repository<AiRequestLog>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async parseExpense(input: { fundId: string; prompt: string }): Promise<ParsedExpensePayload> {
    const categories = await this.categoryRepository.find({ where: { fundId: input.fundId } })
    const requestBody = this.buildRequestBody(input.prompt, categories)

    const model = this.configService.get<string>('ai.model')
    const urlBase = this.configService.get<string>('ai.apiUrl')
    const apiKey = this.configService.get<string>('ai.geminiApiKey')
    const version = this.configService.get<string>('ai.geminiApiVersion')
    const method = this.configService.get<string>('ai.geminiMethod') ?? 'generateContent'
    const timeout = this.configService.get<number>('ai.requestTimeoutMs', 10000)

    if (!urlBase || !apiKey) {
      this.logger.error('AI provider configuration missing')
      throw new ServiceUnavailableException('AI provider is not configured')
    }

    const apiVersion = version ?? 'v1'
    const url = `${urlBase}/${apiVersion}/models/${model}:${method}`
    const logEntry = this.logRepository.create({
      model,
      prompt: requestBody,
    })
    const startedAt = Date.now()

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, requestBody, {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
          timeout,
        }),
      )

      const latency = Date.now() - startedAt
      const parsed = this.parseGeminiResponse(response.data)

      await this.logRepository.save({
        ...logEntry,
        response: response.data,
        latencyMs: latency,
      })

      return parsed
    } catch (error) {
      const latency = Date.now() - startedAt

      await this.logRepository.save({
        ...logEntry,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        latencyMs: latency,
      })

      this.logger.error(
        'Failed to parse expense with Gemini',
        error instanceof Error ? error.stack : String(error),
      )
      throw new ServiceUnavailableException('AI parsing service unavailable')
    }
  }

  private buildRequestBody(prompt: string, categories: Category[]) {
    const categoriesInfo =
      categories.length > 0
        ? `\n\nAvailable categories:\n${categories
            .map((c) => `- ID: \"${c.id}\", Name: \"${c.name}\", Description: \"${c.description ?? ''}\"`)
            .join('\n')}\n\nIf the expense matches one of the categories above, include \"categoryId\" with the category's ID. If no category matches, set \"categoryId\" to null.`
        : '\n\nNo categories available, set "categoryId" to null.'

    const instruction = `Parse this Vietnamese/English expense entry into JSON format. Extract:
- spendValue: amount spent in thousands VND (number without zeros, null if not spending)
- earnValue: amount earned in thousands VND (number without zeros, null if not earning)
- content: description of what was bought/earned (string)
- categoryId: the ID of the matching category if applicable, or null${categoriesInfo}

Rules:
- If text contains "nhận", "thu", "earn", "kiếm", treat as earning (set earnValue, spendValue=null)
- Otherwise it's spending (set spendValue, earnValue=null)
- Amount is in thousands (35 means 35,000 VND)
- Match category based on description if available
- Return ONLY valid JSON, no markdown formatting

Now parse this: "${prompt}"

Return ONLY the JSON object, no other text.`

    return {
      contents: [
        {
          parts: [
            {
              text: instruction,
            },
          ],
        },
      ],
    }
  }

  private parseGeminiResponse(response: any): ParsedExpensePayload {
    const textResponse: string | undefined = response?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!textResponse) {
      throw new ServiceUnavailableException('Empty response from AI provider')
    }

    const jsonMatch = textResponse.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : textResponse

    try {
      const parsed = JSON.parse(jsonStr)
      const content = typeof parsed.content === 'string' ? parsed.content.trim() : ''
      if (!content) {
        throw new Error('Invalid AI response: missing content')
      }

      return {
        spendValue: this.toNumberOrNull(parsed.spendValue ?? parsed.spend ?? null),
        earnValue: this.toNumberOrNull(parsed.earnValue ?? parsed.earn ?? null),
        content,
        categoryId: parsed.categoryId ?? null,
        metadata: parsed.metadata ?? null,
      }
    } catch (error) {
      this.logger.error('Failed to parse Gemini response', error)
      throw new ServiceUnavailableException('Failed to parse AI response')
    }
  }

  private toNumberOrNull(value: unknown): number | null {
    if (value === null || value === undefined) {
      return null
    }

    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric : null
  }
}
