---
id: message-management-platform
status: complete
created: 2026-04-19
completed: 2026-04-21
---

## Description

Build a multi-tenant message management platform providing APIs for message creation, retrieval, and full-text search. Messages are stored in MongoDB (source of truth), published to Kafka, and asynchronously indexed into Elasticsearch for search.

## Driver Specs

- DS-MSG-SCHEMA
- DS-MULTI-TENANT
- DS-TECH-STACK

## ADRs

- DEC-001: Shared-infra multi-tenancy
- DEC-002: Best-effort Kafka publish
- DEC-003: JWT + user-tenant auth
- DEC-004: Single Kafka topic partitioned by conversationId

## Milestones

- [x] scaffold-and-infra: NestJS project, Docker Compose (Mongo, Kafka, Zookeeper, ES), ConfigModule, env setup (approved 2026-04-21)
- [x] auth-and-tenancy: JWT strategy, AuthGuard, TenantGuard, user_tenants collection, test fixtures, @CurrentTenant() decorator (approved 2026-04-21)
- [x] core-message-crud: POST /api/messages (validate, store, publish), GET /api/conversations/:id/messages (paginate, sort), Mongoose schema + compound indexes (approved 2026-04-21)
- [x] kafka-es-indexing: Kafka consumer subscribes to message-created, indexes into Elasticsearch, ES mapping configuration (approved 2026-04-21)
- [x] search-and-tests: GET search endpoint, unit tests, integration tests (approved 2026-04-21)

## OPSX Changes

- scaffold-and-infra
- auth-and-tenancy
- core-message-crud
- kafka-es-indexing
- search-and-tests
