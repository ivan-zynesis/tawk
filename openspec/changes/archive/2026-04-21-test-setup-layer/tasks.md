# Tasks: test-setup-layer

- [x] 1. Install testcontainers, @testcontainers/mongodb, @testcontainers/kafka, @testcontainers/elasticsearch
- [x] 2. Create TestSetup class — orchestrates Mongo/Kafka/ES containers, bootstraps NestJS app
- [x] 3. Create JWT helper — signTestToken() for integration tests
- [x] 4. Create jest-integration.json config with 120s timeout
- [x] 5. Add npm run test:integration script (--runInBand for container safety)
- [x] 6. Verify build compiles
