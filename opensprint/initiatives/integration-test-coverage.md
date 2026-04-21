---
id: integration-test-coverage
status: complete
created: 2026-04-21
completed: 2026-04-21
---

## Description

Add integration test coverage using testcontainers and migrate test runner from Jest to Vitest + SWC. A centralized TestSetup orchestration layer starts MongoDB, Kafka, and Elasticsearch containers and bootstraps a fully wired NestJS test app. Vitest runs natively in ESM, resolving the nodenext/CJS module resolution mismatch that broke Jest + ts-jest.

## Driver Specs

- DS-TECH-STACK (requires both unit and integration tests)

## ADRs

- DEC-005: Testcontainers-based integration testing
- DEC-006: Vitest + SWC for test runner

## Milestones

- [x] test-setup-layer: Install testcontainers, create centralized TestSetup class (Mongo/Kafka/ES containers, NestJS app bootstrap, JWT helper) (approved 2026-04-21)
- [x] integration-tests: Auth flow (real JWT → tenant resolution), message CRUD (real MongoDB, pagination), full pipeline (POST → Kafka → ES → search) (approved 2026-04-21)
- [x] migrate-jest-to-vitest: Replace Jest + ts-jest with Vitest + SWC, migrate mocks, update VS Code config (approved 2026-04-21)
- [x] configure-ci-pipeline: GitHub Actions CI workflow with Docker image caching for testcontainers (approved 2026-04-21)

## OPSX Changes

- test-setup-layer
- integration-tests
- migrate-jest-to-vitest
- configure-ci-pipeline
