---
id: message-management-platform
status: active
created: 2026-04-19
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

- [ ] scaffold-and-infra: NestJS project, Docker Compose (Mongo, Kafka, Zookeeper, ES), ConfigModule, env setup
- [ ] auth-and-tenancy: JWT strategy, AuthGuard, TenantGuard, user_tenants collection, test fixtures, @CurrentTenant() decorator
- [ ] core-message-crud: POST /api/messages (validate, store, publish), GET /api/conversations/:id/messages (paginate, sort), Mongoose schema + compound indexes
- [ ] kafka-es-indexing: Kafka consumer subscribes to message-created, indexes into Elasticsearch, ES mapping configuration
- [ ] search-and-tests: GET search endpoint, unit tests, integration tests
