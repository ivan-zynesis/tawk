# Tasks: integration-tests

- [x] 1. Auth integration test — reject no JWT, reject invalid JWT, reject unknown user (403), accept seeded user
- [x] 2. Messages CRUD integration test — validate required fields, create with generated id/tenantId, retrieve, cursor pagination, tenant isolation
- [x] 3. Search pipeline integration test — POST → Kafka → ES → search (poll with retries for eventual consistency)
- [x] 4. Verify unit tests still pass (11/11), build compiles
