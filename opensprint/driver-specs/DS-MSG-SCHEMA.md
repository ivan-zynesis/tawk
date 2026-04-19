---
id: DS-MSG-SCHEMA
name: Message Schema Contract
type: product
status: active
created: 2026-04-19
---

## Constraint

The message schema is a fixed contract with the following required fields:

```typescript
type Message = {
  id: string;           // ULID preferred
  tenantId: string;     // multi-tenant boundary
  conversationId: string;
  senderId: string;
  body: string;
  timestamp: string;    // ISO8601
};
```

All fields are required and must be validated at the API layer before persistence.

## Source

Product requirements — problem statement section 3.
