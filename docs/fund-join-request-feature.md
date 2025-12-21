# Fund Join Request Feature - Implementation Summary

## Overview
Implementation of fund code (numberId) sharing and join request flow, allowing users to find funds by code and request to join, with owner/admin approval workflow.

## Completed Features

### 1. Fund Code (numberId)
- ✅ Each fund has a unique 6-digit `numberId` (000000-999999)
- ✅ Auto-generated when fund is created
- ✅ Unique constraint with database index
- ✅ Migration script to add numberId to existing funds

### 2. Roles & Permissions
- ✅ **OWNER**: Full control (fund creator)
- ✅ **ADMIN**: Can manage members and approve/reject join requests
- ✅ **MEMBER**: Can create expenses/messages, view reports
- ✅ **FOLLOWER**: Read-only access (for future use)

### 3. Join Request Flow
- ✅ Users can search fund by `numberId` (GET `/funds/search/:numberId` or GET `/funds/lookup?numberId=xxx`)
- ✅ Users can create join request (POST `/funds/:fundId/join-requests`)
- ✅ Join requests have status: PENDING, APPROVED, REJECTED
- ✅ Idempotent: returns existing request if already exists
- ✅ Audit fields: `reviewedById`, `reviewedAt`

### 4. Owner/Admin Management
- ✅ View join requests (GET `/funds/:fundId/join-requests?status=PENDING`)
- ✅ Approve join request (POST `/funds/:fundId/join-requests/:requestId/approve`)
  - Creates member with MEMBER role
  - Updates request status to APPROVED
- ✅ Reject join request (POST `/funds/:fundId/join-requests/:requestId/reject`)
  - Updates request status to REJECTED
- ✅ Update member role (PATCH `/funds/:fundId/members/:memberId/role`)
- ✅ Remove member (DELETE `/funds/:fundId/members/:userId`)

### 5. Membership Status
- ✅ Check membership status (GET `/funds/:fundId/membership`)
  - Returns: isMember, role, joinRequest info

## API Endpoints

### Public/Member-facing
- `GET /funds/search/:numberId` - Search fund by numberId (path param)
- `GET /funds/lookup?numberId=xxx` - Search fund by numberId (query param)
- `POST /funds/:fundId/join-requests` - Create join request
- `GET /funds/:fundId/membership` - Get membership status

### Owner/Admin Management
- `GET /funds/:fundId/join-requests?status=PENDING` - List join requests
- `POST /funds/:fundId/join-requests/:requestId/approve` - Approve request
- `POST /funds/:fundId/join-requests/:requestId/reject` - Reject request
- `PATCH /funds/:fundId/members/:memberId/role` - Update member role
- `DELETE /funds/:fundId/members/:userId` - Remove member

## Permission Matrix

| Action | OWNER | ADMIN | MEMBER | FOLLOWER | Non-member |
|--------|-------|-------|--------|----------|------------|
| View fund (public info) | ✅ | ✅ | ✅ | ✅ | ✅ (by numberId) |
| View fund (full details) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create join request | ✅ | ✅ | ✅ | ✅ | ✅ |
| View join requests | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approve/Reject requests | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update member role | ✅ | ✅* | ❌ | ❌ | ❌ |
| Remove member | ✅ | ✅* | ❌ | ❌ | ❌ |
| Create expense/message | ✅ | ✅ | ✅ | ❌** | ❌ |

*Admins cannot change owner role or remove owners/admins  
**FOLLOWER role restriction needs to be enforced in messages/transactions services

## Data Models

### FundJoinRequest Entity
```typescript
{
  id: string (UUID)
  fundId: string (UUID)
  userId: string (UUID)
  status: 'pending' | 'approved' | 'rejected'
  reviewedById?: string (UUID, nullable)
  reviewedAt?: Date (nullable)
  createdAt: Date
  updatedAt: Date
}
```

### FundMember Entity
```typescript
{
  id: string (UUID)
  fundId: string (UUID)
  userId: string (UUID)
  role: 'owner' | 'admin' | 'member' | 'follower'
  createdAt: Date
  updatedAt: Date
}
```

## Validation & Error Handling

### Join Request Creation
- ✅ Cannot request to join own fund
- ✅ Cannot create duplicate pending requests (returns existing)
- ✅ Already a member check
- ✅ Fund existence check

### Approval/Rejection
- ✅ Only owners and admins can approve/reject
- ✅ Cannot approve/reject non-pending requests
- ✅ Request existence check

### Role Management
- ✅ Cannot change owner role
- ✅ Only owners can assign owner role
- ✅ Only owners can remove admins
- ✅ Cannot remove owner

## Security Considerations

### Implemented
- ✅ Unique numberId (1,000,000 combinations)
- ✅ Private funds (only found by exact code)
- ✅ Minimal public info exposure
- ✅ Role-based access control
- ✅ Audit trail (reviewedBy, reviewedAt)

### Recommended (Future)
- ⚠️ Rate limiting for lookup/search endpoints
- ⚠️ Rate limiting for join request creation
- ⚠️ Logging for approve/reject/role changes
- ⚠️ FOLLOWER role enforcement in messages/transactions services

## Migration

Script available: `scripts/migrate-funds-numberid.ts`
- Adds numberId to existing funds
- Generates unique 6-digit codes
- Sets description to null if not set

Run: `npm run migrate:funds-numberid`

## Testing Checklist

- [ ] User creates fund → has numberId
- [ ] User searches fund by valid numberId → returns public info
- [ ] User searches fund by invalid numberId → 404
- [ ] User creates join request → PENDING status
- [ ] User creates duplicate join request → returns existing (idempotent)
- [ ] Owner views pending requests → sees list
- [ ] Owner approves request → user becomes MEMBER
- [ ] Owner rejects request → status REJECTED
- [ ] Non-owner tries to approve → 403
- [ ] Owner updates member role → success
- [ ] Admin updates member role → success (except owner)
- [ ] Owner removes member → success
- [ ] Admin removes member → success (except owner/admin)
- [ ] Owner tries to remove themselves → 403
- [ ] User checks membership status → correct info

## Notes

1. **FOLLOWER Role**: Currently defined but not enforced in messages/transactions services. This should be added in those modules.

2. **Idempotency**: Join request creation is idempotent - if a pending request exists, it returns the existing one instead of creating duplicate.

3. **Approved but Removed**: If a user was approved but later removed, and they create a new join request, the system will detect the approved request and re-add them as a member.

4. **Route Order**: Static routes (`lookup`, `search/:numberId`) are placed before dynamic routes (`:fundId`) to avoid route conflicts.

5. **Audit Trail**: All approve/reject actions are tracked with `reviewedById` and `reviewedAt` fields.

