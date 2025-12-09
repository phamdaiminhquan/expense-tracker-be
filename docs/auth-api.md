# Auth module API

Base URL: `http://localhost:3000` (adjust per env)

## Register
POST `/auth/register`
```json
{ "email": "user@example.com", "name": "User", "password": "strongpassword" }
```
Response: `{ accessToken, refreshToken, user: { id, email, name } }`

## Login
POST `/auth/login`
```json
{ "email": "user@example.com", "password": "strongpassword" }
```
Response: `{ accessToken, refreshToken, user: { id, email, name } }`

## Refresh token
POST `/auth/refresh`
```json
{ "refreshToken": "<refresh_token>" }
```
Response: same shape as login.

Notes: access token in `Authorization: Bearer <token>` for protected routes. Refresh token is long-lived; rotate on use.
