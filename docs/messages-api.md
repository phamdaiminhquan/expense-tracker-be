# Messages API Integration Guide (FE)

Base URL: `http://localhost:3000` (adjust per env)
Auth: Bearer token (access token). All endpoints require Authorization header `Authorization: Bearer <token>`.

## List messages by fund
- **GET** `/funds/{fundId}/messages`
- Response: `200 OK`
```json
[
  {
    "id": "uuid",
    "message": "Mua đồ ăn trưa 45k",
    "status": "processed",
    "fundId": "uuid",
    "transactionId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "fund": {
      "id": "uuid",
      "name": "Family budget",
      "type": "personal",
      "ownerId": "uuid",
      ...
    },
    "transaction": {
      "id": "uuid",
      "fundId": "uuid",
      "spendValue": 45,
      "earnValue": null,
      "content": "Đồ ăn trưa",
      "categoryId": "uuid",
      "category": {
        "id": "uuid",
        "name": "Nhà hàng quán ăn",
        "description": "Chi phí ăn uống tại nhà hàng...",
        "parent": {
          "id": "uuid",
          "name": "Thực phẩm – Đồ uống",
          ...
        },
        ...
      },
      ...
    },
    ...
  }
]
```

## Create message
- **POST** `/funds/{fundId}/messages`
- Body:
```json
{
  "message": "Mua đồ ăn trưa 45k"
}
```
- Response: `201 Created` with created message object (includes fund, transaction, and category relations).

## Get message detail
- **GET** `/messages/{messageId}`
- Response: `200 OK` with message object (includes fund, transaction, and category relations).

## Update message
- **PATCH** `/messages/{messageId}`
- Body (all fields are optional):
```json
{
  "message": "Mua đồ ăn trưa 50k"
}
```
- Response: `200 OK` with updated message object (includes fund, transaction, and category relations).

### Update Message Request Body
The `UpdateMessageDto` extends `PartialType(CreateMessageDto)`, meaning all fields are optional:

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `message` | string | No | 500 | Original user message (prompt) |

### Example: Update message text
```typescript
// TypeScript/JavaScript example
const updateMessage = async (messageId: string, newMessage: string, token: string) => {
  const response = await fetch(`http://localhost:3000/messages/${messageId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: newMessage
    })
  })
  
  if (!response.ok) {
    throw new Error(`Failed to update message: ${response.statusText}`)
  }
  
  return await response.json()
}

// Usage
const updatedMessage = await updateMessage(
  '550e8400-e29b-41d4-a716-446655440000',
  'Mua đồ ăn trưa 50k',
  'your-access-token'
)
```

### Example: React/Next.js
```typescript
const updateMessage = async (messageId: string, newMessage: string) => {
  const token = localStorage.getItem('accessToken') // or from context/auth
  
  const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: newMessage
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update message')
  }
  
  return await response.json()
}

// In component
const handleUpdateMessage = async () => {
  try {
    const updatedMessage = await updateMessage(messageId, editedMessage)
    // Update UI with updatedMessage
    setMessage(updatedMessage)
  } catch (error) {
    console.error('Error updating message:', error)
    // Show error notification
  }
}
```

## Delete message
- **DELETE** `/messages/{messageId}`
- Response: `200 OK` `{ "success": true }`

## Notes
- All routes are protected by JWT access token.
- `status` values: `pending`, `processed`, `failed`.
- Response includes full relations: `fund`, `transaction`, `transaction.category`, `transaction.category.parent`
- If the API returns 401/403, refresh token via `/auth/refresh` then retry.

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Not a member of this fund"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "message not found"
}
```

### 400 Bad Request (validation error)
```json
{
  "statusCode": 400,
  "message": ["message must be shorter than or equal to 500 characters"],
  "error": "Bad Request"
}
```

