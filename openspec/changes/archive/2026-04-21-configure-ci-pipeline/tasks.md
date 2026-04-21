# Tasks: configure-ci-pipeline

- [x] 1. Create .github/workflows/ci.yml with trigger config (PR to main, push to main)
- [x] 2. Add steps: checkout, setup Node from .nvmrc, npm ci with cache
- [x] 3. Add steps: lint, build, unit tests
- [x] 4. Add Docker image caching: restore cache, conditional pull + save on miss
- [x] 5. Add integration test step with TESTCONTAINERS_RYUK_DISABLED=true
- [x] 6. Add configure-ci-pipeline as milestone + OPSX change in integration-test-coverage initiative
- [x] 7. Verify: workflow YAML structure is valid
