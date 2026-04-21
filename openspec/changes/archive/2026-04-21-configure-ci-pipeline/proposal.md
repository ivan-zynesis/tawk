# Proposal: configure-ci-pipeline

**Parent initiative**: integration-test-coverage

## Problem

No CI pipeline exists. Code can be merged to main without passing tests, lint, or build checks. The testcontainers-based integration tests (DEC-005) and Vitest unit tests (DEC-006) only run locally.

## Solution

Create a GitHub Actions CI workflow that runs on every PR to main and on push to main. Single sequential job: lint → build → unit tests → integration tests. All steps must pass for merge.

Docker images used by testcontainers (mongo:7, cp-kafka:7.5.0, elasticsearch:8.11.0) are cached as tarballs via `actions/cache` to avoid ~2GB pulls on every run. Testcontainers Ryuk reaper is disabled since GitHub Actions runners are ephemeral.

## Scope

- `.github/workflows/ci.yml` — the CI workflow
- Docker image caching via `docker save`/`docker load` + `actions/cache`
- Node version from `.nvmrc` (lts/iron)
- `TESTCONTAINERS_RYUK_DISABLED=true` for ephemeral runners

## Non-goals

- No CD / deployment
- No Docker image publishing
- No advanced caching (pnpm, Vitest cache) — future milestone
- No branch protection rule creation (documented, not automated)
