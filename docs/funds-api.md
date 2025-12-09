# Funds module API integration guide (FE)

Base URL: `http://localhost:3000` (adjust per env)
Auth: Bearer token (access token). All endpoints require Authorization header `Authorization: Bearer <token>`.

## List funds
- **GET** `/funds`
- Response: `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Family budget",
    "type": "personal" | "shared",
    "ownerId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## Create fund
- **POST** `/funds`
- Body:
```json
{
  "name": "Family budget",
  "type": "personal", // or "shared"
  "memberIds": ["uuid"] // optional, only meaningful when type = shared
}
```
- Response: `201 Created` with created fund object.

## Fund detail
- **GET** `/funds/{fundId}`
- Response: fund object.

## Update fund
- **PATCH** `/funds/{fundId}`
- Body (any subset):
```json
{
  "name": "New name",
  "type": "shared",
  "memberIds": ["uuid"] // optional, only for shared
}
```
- Response: updated fund.

## Delete fund
- **DELETE** `/funds/{fundId}`
- Response: `200 OK` `{ "success": true }`

## List members
- **GET** `/funds/{fundId}/members`
- Response:
```json
[
  {
    "id": "uuid",          // fund_member id
    "fundId": "uuid",
    "userId": "uuid",
    "role": "owner" | "member",
    "user": { "id": "uuid", "email": "x@y.com", "name": "User" }
  }
]
```
(Note: include fields returned by service; adjust mapping on FE as needed.)

## Add member
- **POST** `/funds/{fundId}/members`
- Body:
```json
{
  "userId": "uuid",
  "role": "member" // or "owner"
}
```
- Response: newly added membership record.

## Remove member
- **DELETE** `/funds/{fundId}/members/{userId}`
- Response: `{ "success": true }`

## Notes
- All routes are protected by JWT access token.
- `type` values: `personal`, `shared`.
- `role` values: `owner`, `member`.
- If the API returns 403/401, refresh token via `/auth/refresh` then retry.
- For Swagger schema details, visit `/docs` in non-production environments.
