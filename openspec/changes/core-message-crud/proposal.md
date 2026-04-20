# Proposal: core-message-crud

**Parent initiative**: message-management-platform
**Milestone**: 3 of 5

## Summary

Implement the core message CRUD: POST to create messages (validate, store in MongoDB, publish to Kafka) and GET to retrieve conversation messages with cursor-based pagination.

## Driver Specs Referenced

- **DS-MSG-SCHEMA**: Fixed message schema with ULID id, all fields required
- **DS-MULTI-TENANT**: tenantId filtering on all queries

## ADRs Referenced

- **DEC-001**: Compound index {tenantId, conversationId, timestamp}
- **DEC-002**: Best-effort Kafka publish (MongoDB is source of truth)
- **DEC-004**: Kafka topic `message-created`, partition key = conversationId

## Scope

- Message Mongoose schema with compound indexes
- CreateMessageDto with class-validator validation
- POST /api/messages — validate, generate ULID, store, publish
- GET /api/conversations/:conversationId/messages — cursor-based pagination
- Kafka producer integration (best-effort)
- Both endpoints protected by AuthGuard + TenantGuard

## Non-goals

- Elasticsearch indexing (milestone 4)
- Search endpoint (milestone 5)
