---
id: demo-webapp-and-conversations
status: active
created: 2026-04-21
---

## Description

Introduce conversations as a first-class entity and build a React + Vite demo frontend that showcases the platform's functionality: tenant isolation, message CRUD, cursor-based pagination, and full-text search. Conversations are seeded per tenant as public channels — no CRUD APIs for conversations.

## Driver Specs

- DS-MULTI-TENANT
- DS-MSG-SCHEMA
- DS-TECH-STACK

## ADRs

- DEC-007: Conversations as first-class entity with denormalized tenantId
- DEC-008: React + Vite for demo frontend

## Milestones

- [ ] conversation-model: Conversation Mongoose schema, seed conversations per tenant, GET /api/conversations endpoint, validate conversation ownership on POST /api/messages
- [ ] demo-frontend: React + Vite SPA with user picker, conversation list, message thread (paginated), send message, search
- [ ] update-integration-tests: Update existing integration tests for conversation validation, add conversation listing test
