# Design: configure-ci-pipeline

## Workflow Structure

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
```

Single job, sequential steps:

```
┌──────────────────────────────────────────────────┐
│  Job: ci (runs-on: ubuntu-latest)                │
├──────────────────────────────────────────────────┤
│  1. Checkout                                      │
│  2. Setup Node (from .nvmrc)                      │
│  3. Cache node_modules (key: package-lock hash)   │
│  4. npm ci                                        │
│  5. Lint                                          │
│  6. Build                                         │
│  7. Unit tests                                    │
│  8. Restore Docker image cache                    │
│  9. Pull + cache Docker images (on miss)          │
│ 10. Integration tests                             │
│     env: TESTCONTAINERS_RYUK_DISABLED=true        │
└──────────────────────────────────────────────────┘
```

## Docker Image Caching Strategy

Testcontainers pulls mongo:7, cp-kafka:7.5.0, and elasticsearch:8.11.0 (~2GB total). On GitHub-hosted runners this happens every run since runners are ephemeral.

**Approach**: `docker save` images to a tarball, cache via `actions/cache`, `docker load` on cache hit.

```
Cache key: docker-images-{hash of image names + tags}
Cache path: /tmp/docker-images.tar

On cache hit:  docker load < /tmp/docker-images.tar  (~30s)
On cache miss: docker pull all 3 → docker save > /tmp/docker-images.tar
```

GitHub Actions cache limit is 10GB per repo. Our images are ~2GB compressed — fits easily.

## Node Version

Use `actions/setup-node@v4` with `node-version-file: '.nvmrc'` to read `lts/iron` (v20.x).

## npm ci Caching

Use `actions/setup-node@v4` built-in caching with `cache: 'npm'` — caches `~/.npm` based on `package-lock.json` hash.

## Testcontainers Config

- `TESTCONTAINERS_RYUK_DISABLED=true` — skip the reaper container since GitHub Actions runners are ephemeral and auto-cleaned
- No other testcontainers config needed — Docker is pre-installed on `ubuntu-latest`

## Branch Protection Guidance

Document (not automate) the recommended branch protection settings:
- Require status check: `ci` job must pass
- Require branch to be up to date before merging
- No force pushes to main
