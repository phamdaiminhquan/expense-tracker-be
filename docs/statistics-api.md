# Statistics module API

Protected with Bearer access token.
Base path: `/funds/{fundId}/statistics`

## Summary
GET `/funds/{fundId}/statistics?from=2024-01-01&to=2024-02-01`
- `from` / `to` optional (ISO date strings). If omitted, returns overall.
- Response: summary object (totals by spend/earn). See Swagger `/docs` for exact schema.
