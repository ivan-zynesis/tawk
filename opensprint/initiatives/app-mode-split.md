---
id: app-mode-split
status: active
created: 2026-04-21
---

## Description

Enable independent scaling of the HTTP API and Kafka consumer by introducing an APP_MODE environment variable with three modes: `monolith` (default, current behavior), `api` (HTTP with Kafka producer, no consumer), and `worker` (Kafka consumer + ES indexer, no HTTP). Same codebase and Docker image, different env var per deployment. API scales with HTTP traffic, worker scales with Kafka partition count / consumer lag. Kafka broker infrastructure scaling is not in scope.

## Driver Specs

- DS-TECH-STACK (Kafka as event broker implies consumer scaling needs)

## ADRs

- DEC-009: APP_MODE-based deployment split (api + worker)

## Milestones

- [ ] app-mode-bootstrap: Add APP_MODE to config/validation, create ApiModule and WorkerModule, update main.ts with mode-based conditional bootstrapping, update .env.example and README
