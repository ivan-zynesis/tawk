# Architecture

*Compiled from initiative `message-management-platform`, archived 2026-04-21.*

## System Overview

Tawk is a multi-tenant message management platform. It exposes RESTful APIs for creating, retrieving, and searching messages within tenant-scoped conversations. Messages are persisted in MongoDB as the source of truth, published asynchronously to Kafka, and indexed into Elasticsearch for full-text search.

The system serves multiple tenants on shared infrastructure. Tenant identity is resolved from JWT-authenticated users rather than being passed by the client, ensuring that tenant boundaries are enforced server-side.

## Driver Specs

### Product Constraints

**Message Schema Contract (DS-MSG-SCHEMA)** — The message schema is a fixed contract. Every message has six required fields: `id` (ULID), `tenantId`, `conversationId`, `senderId`, `body`, and `timestamp` (ISO8601). All fields are validated at the API layer before persistence.

**Multi-Tenancy Model (DS-MULTI-TENANT)** — The system supports multiple tenants on shared infrastructure. Data isolation is enforced via `tenantId` filtering at the application layer — not through separate databases or collections. Tenant identity is resolved from the authenticated user via a `userId → tenantId` mapping, never from client input.

### Technical Constraints

**Tech Stack Mandate (DS-TECH-STACK)** — Four technologies are non-negotiable: NestJS for the HTTP API, MongoDB as the primary data store, Kafka for event publishing, and Elasticsearch for full-text search. Code follows SOLID principles and DDD practices.

## Architectural Decisions

The decision tree flows from two root driver specs: the multi-tenancy model and the tech stack mandate.

**From DS-MULTI-TENANT**, two decisions follow:

We chose shared-infra multi-tenancy (DEC-001) — a single MongoDB `messages` collection and a single Elasticsearch `messages` index, both filtered by `tenantId`. The MongoDB collection has a compound index on `{tenantId, conversationId, timestamp}` for efficient query performance. This is operationally simplest at current scale. The alternative — database-per-tenant or collection-per-tenant — would be warranted only if tenant count reaches thousands or regulatory requirements demand physical isolation.

For authentication and tenant resolution (DEC-003), we use JWT bearer tokens carrying a `userId` in the `sub` claim. A `user_tenants` MongoDB collection maps each user to their tenant. An `AuthGuard` validates the JWT, and a `TenantGuard` resolves the tenant via DB lookup. A `@CurrentTenant()` decorator injects the resolved tenant into controllers. This approach is accurate, cacheable, and supports future multi-tenant users. User signup and tenant management APIs are out of scope.

**From DS-TECH-STACK**, the Kafka integration decisions follow:

We adopted best-effort Kafka publishing (DEC-002). The write path is: store in MongoDB first (source of truth), then publish a `message-created` event to Kafka. If the Kafka publish fails, the error is logged but the API returns success. This means Elasticsearch may temporarily lag or miss events. We consciously chose this over a transactional outbox for simplicity. If search accuracy becomes a hard requirement, this decision should be revisited.

Building on DEC-002, we use a single Kafka topic `message-created` partitioned by `conversationId` (DEC-004). This guarantees message ordering within a conversation — the most valuable ordering guarantee for a messaging system. A single consumer group (`search-indexer`) processes events into Elasticsearch. The risk of hot partitions from very active conversations is acceptable at current scale.

```
DS-MULTI-TENANT ──┬── DEC-001: Shared-infra multi-tenancy
                  └── DEC-003: JWT + user-tenant auth

DS-TECH-STACK ────── DEC-002: Best-effort Kafka publish
                        └── DEC-004: Single topic, partition by conversationId

DS-MSG-SCHEMA ─────── (referenced by DEC-001 indexes, DEC-004 partition key)
```

## System Structure

```
                        ┌──────────────────────────────────────────┐
                        │              NestJS API                  │
                        │                                          │
  Client ──JWT───────▶  │  AuthGuard ──▶ TenantGuard ──▶ Routes    │
                        │       │              │                   │
                        │       ▼              ▼                   │
                        │  JWT Strategy   user_tenants (Mongo)     │
                        │                                          │
                        │  POST /api/messages                      │
                        │    ├──write──▶ MongoDB [messages]        │
                        │    └──publish──▶ Kafka [message-created] │
                        │                        │                 │
                        │  GET  /api/conversations/:id/messages    │
                        │    └──query──▶ MongoDB [messages]        │
                        │                                          │
                        │  GET  /api/.../messages/search?q=term    │
                        │    └──query──▶ Elasticsearch [messages]  │
                        └──────────────────────────────────────────┘
                                             │
                              Kafka Consumer (search-indexer group)
                                             │
                                             ▼
                                    Elasticsearch [messages]
```

### Modules

| Module | Responsibility |
|---|---|
| **AppModule** | Root module, wires ConfigModule, MongooseModule, and all feature modules |
| **AuthModule** | JWT strategy, AuthGuard, TenantGuard, user_tenants schema, AuthService |
| **MessagesModule** | Message CRUD controller/service, Kafka producer, Message schema |
| **SearchModule** | Elasticsearch client, index management, SearchConsumer (Kafka → ES) |
| **SeedModule** | Dev fixtures: seeds user-tenant mappings on startup |
| **HealthModule** | GET /api/health endpoint |

### Data Stores

| Store | Index/Collection | Purpose |
|---|---|---|
| MongoDB | `messages` collection, index `{tenantId, conversationId, timestamp}` | Source of truth for all messages |
| MongoDB | `user_tenants` collection, unique index `{userId}` | User-to-tenant mapping for auth |
| Elasticsearch | `messages` index, `body` as text (standard analyzer), filter fields as keyword | Full-text search |
| Kafka | `message-created` topic, partitioned by `conversationId` | Async event pipeline to ES |

### API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/messages` | Create a message (validate, store, publish) |
| GET | `/api/conversations/:conversationId/messages` | List messages with cursor-based pagination |
| GET | `/api/conversations/:conversationId/messages/search?q=term` | Full-text search via Elasticsearch |
| GET | `/api/health` | Health check |

All message endpoints require JWT authentication and are tenant-scoped.

## Constraints & Non-Negotiables

- **All message fields are required** — `id`, `tenantId`, `conversationId`, `senderId`, `body`, `timestamp` must be present and validated before persistence (DS-MSG-SCHEMA)
- **Tenant isolation at application layer** — Every query must include `tenantId`. No cross-tenant data access. Enforced by TenantGuard (DS-MULTI-TENANT, DEC-001)
- **Tenant identity from auth, not client** — `tenantId` is resolved server-side from the authenticated user, never accepted from request input (DS-MULTI-TENANT, DEC-003)
- **MongoDB is source of truth** — Elasticsearch is a secondary index that may lag. Clients should not depend on search results being immediately consistent (DEC-002)
- **Tech stack is fixed** — NestJS, MongoDB, Kafka, Elasticsearch. No substitutions (DS-TECH-STACK)
- **SOLID + DDD** — Code follows SOLID principles and domain-driven design practices (DS-TECH-STACK)
