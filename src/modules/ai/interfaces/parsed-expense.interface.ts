export interface ParsedExpensePayload {
  spendValue: number | null
  earnValue: number | null
  content: string
  categoryId?: string | null
  metadata?: Record<string, unknown>
}
