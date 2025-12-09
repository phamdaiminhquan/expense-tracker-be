# Transactions module API

Protected with Bearer access token.

## List transactions by fund
GET `/funds/{fundId}/transactions`
Response: array of transactions for the fund.

## Create transaction
POST `/funds/{fundId}/transactions`
```json
{
  "rawPrompt": "Mua cafe 30k",
  "spendValue": 30,          // optional
  "earnValue": null,         // optional
  "content": "Cafe với team", // optional
  "categoryId": "uuid"      // optional
}
```
Response: created transaction. If no spend/earn, status is `pending` and will be parsed by worker.

## Transaction detail
GET `/transactions/{transactionId}`

## Update transaction
PATCH `/transactions/{transactionId}`
```json
{ "spendValue": 40, "content": "Cafe và bánh" }
```

## Delete transaction
DELETE `/transactions/{transactionId}`
Response: `{ "success": true }`

Notes:
- Status values: `pending`, `processed`, `failed`.
- Parsed results saved into spend/earn/content/categoryId; `metadata` may contain extra info.
