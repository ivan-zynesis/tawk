# Tawk — Multi-Tenant Message Management Platform

An implementation of the [Message Management APIs](problem-statement.md) assessment — a multi-tenant backend service with APIs for message creation, retrieval, and full-text search, plus a demo frontend to showcase the functionality.

Messages are stored in MongoDB (source of truth), published to Kafka, and asynchronously indexed into Elasticsearch for search. A React demo frontend demonstrates tenant isolation, conversation channels, messaging, and search visually.

## Prerequisites

- **Node.js** v20.19+ (the repo includes an `.nvmrc` — run `nvm use` if you use nvm)
- **Docker** (required for both local development and integration tests)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config
cp .env.example .env

# 3. Start infrastructure (MongoDB, Kafka, Zookeeper, Elasticsearch)
docker compose up -d

# 4. Start the API server (seeds test data automatically on boot)
npm run start:dev
```

The API will be available at `http://localhost:3000`. A health check endpoint is at `GET /api/health`.

### Demo Frontend

The frontend provides a visual interface to interact with the API. It runs separately from the backend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend proxies all `/api` requests to the NestJS backend automatically.

**How it works:**
1. **Pick a user** from the dropdown (Alice, Bob, or Charlie). The frontend signs a JWT client-side using the shared dev secret — no login form needed.
2. **Conversations** appear in the sidebar, scoped to the selected user's tenant. Switch between Alice (tenant-alpha: #general, #engineering) and Charlie (tenant-beta: #general, #random) to see tenant isolation.
3. **Select a conversation** to view messages, send new ones, or search within that channel.
4. **Search** uses Elasticsearch full-text search. Results may take a moment to appear after sending a new message (eventually consistent via Kafka).

## Authentication

The API uses JWT bearer tokens. On startup, the application seeds three test users across two tenants:

| User ID | Tenant ID |
|---|---|
| `user-alice` | `tenant-alpha` |
| `user-bob` | `tenant-alpha` |
| `user-charlie` | `tenant-beta` |

To generate a JWT token for testing, sign a payload with the secret from your `.env` (`dev-secret` by default):

```bash
# Using Node.js directly:
node -e "
  const jwt = require('@nestjs/jwt');
  const svc = new jwt.JwtService({ secret: 'dev-secret' });
  console.log(svc.sign({ sub: 'user-alice' }));
"
```

Then include it in requests:

```
Authorization: Bearer <token>
```

Tenant identity is resolved server-side from the authenticated user. The client never passes `tenantId` directly.

## API Endpoints

All endpoints require a valid JWT. Responses are scoped to the authenticated user's tenant.

### List Conversations

```
GET /api/conversations
```

Returns the seeded conversations for the authenticated user's tenant. Conversations are pre-seeded on startup — there are no create/update/delete APIs.

### Create a Message

```
POST /api/messages
```

Body:

```json
{
  "conversationId": "conv-alpha-general",
  "senderId": "user-alice",
  "body": "Hello world"
}
```

The `conversationId` must reference an existing conversation that belongs to the authenticated user's tenant (returns 404 otherwise). Returns the created message with a generated ULID `id`, resolved `tenantId`, and ISO8601 `timestamp`.

### List Messages in a Conversation

```
GET /api/conversations/:conversationId/messages?limit=20&cursor=<timestamp>
```

Returns messages sorted by timestamp (newest first) with cursor-based pagination. The response includes a `nextCursor` value to pass in subsequent requests. Only messages belonging to the authenticated user's tenant are returned.

### Search Messages

```
GET /api/conversations/:conversationId/messages/search?q=<term>&limit=20
```

Full-text search on message body via Elasticsearch. Results are filtered by tenant and conversation.

Note: search results are eventually consistent. There is a short delay between creating a message and it appearing in search results, as messages flow through Kafka before being indexed in Elasticsearch.

## Architecture

```
Client ──JWT──▶ NestJS API ──write──▶ MongoDB (source of truth)
                    │
                    └──publish──▶ Kafka [message-created]
                                      │
                              Consumer Group ──index──▶ Elasticsearch
                                                            │
Client ──search──▶ NestJS API ◀──query──────────────────────┘
```

- **MongoDB** is the source of truth for all messages. The `messages` collection has a compound index on `{tenantId, conversationId, timestamp}`.
- **Kafka** receives a `message-created` event on every new message, partitioned by `conversationId` to guarantee message ordering within a conversation.
- **Elasticsearch** provides full-text search. The `messages` index uses a standard analyzer on the `body` field, with `tenantId`, `conversationId`, and `senderId` as keyword filter fields.
- **Multi-tenancy** is enforced at the application layer. Every query includes a `tenantId` filter resolved from the JWT, not from client input.

For detailed architectural decisions (ADRs), see [`opensprint/architecture.md`](opensprint/architecture.md).

## Running Tests

### Unit Tests

No external dependencies required. Runs against mocked infrastructure.

```bash
npm test
```

### Integration Tests

Requires Docker. Uses testcontainers to automatically start MongoDB, Kafka, and Elasticsearch containers. No manual `docker compose up` needed.

```bash
npm run test:integration
```

### All Tests

```bash
npm test && npm run test:integration
```

## Project Structure

```
src/
  app.module.ts                       # Root module
  main.ts                             # Bootstrap with global prefix and validation
  config/                             # Typed environment config with Joi validation
  auth/                               # JWT strategy, AuthGuard, TenantGuard, decorators
  conversations/                      # Conversation schema, tenant-scoped listing
  messages/                           # Message CRUD controller, service, Kafka producer
  search/                             # Elasticsearch client, Kafka consumer (indexer)
  seed/                               # Auto-seeds users, tenants, and conversations on startup
  health/                             # Health check endpoint
frontend/
  src/
    api.ts                            # API client with client-side JWT signing
    components/UserPicker.tsx         # User selection dropdown
    components/ConversationList.tsx   # Tenant-scoped conversation sidebar
    components/MessageThread.tsx      # Message list, send form, search
    App.tsx                           # Root component wiring everything together
test/
  integration/
    helpers/test-setup.ts             # Testcontainers orchestration
    auth.integration.spec.ts          # JWT auth + conversation listing tests
    messages.integration.spec.ts      # CRUD, pagination, tenant isolation, conversation validation
    search-pipeline.integration.spec.ts  # Full pipeline: POST → Kafka → ES → search
```

## Scripts

**Backend** (run from project root):

| Command | Description |
|---|---|
| `npm run start:dev` | Start API server in watch mode |
| `npm run build` | Compile TypeScript |
| `npm test` | Run unit tests |
| `npm run test:integration` | Run integration tests (requires Docker) |
| `npm run lint` | Lint and auto-fix |

**Frontend** (run from `frontend/`):

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at http://localhost:5173 |
| `npm run build` | Production build |
