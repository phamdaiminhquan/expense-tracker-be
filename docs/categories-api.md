# Categories module API

All routes require `Authorization: Bearer <accessToken>`.
Base path scoped by fund: `/funds/:fundId/categories`.

## List categories
GET `/funds/{fundId}/categories`
Response: array of categories for the fund.

## Create category
POST `/funds/{fundId}/categories`
```json
{ "name": "Food & Drinks", "description": "Groceries" }
```
Response: created category.

## Update category
PATCH `/funds/{fundId}/categories/{categoryId}`
```json
{ "name": "Food", "description": "Eating out" }
```
Response: updated category.

## Delete category
DELETE `/funds/{fundId}/categories/{categoryId}`
Response: `{ "success": true }`
