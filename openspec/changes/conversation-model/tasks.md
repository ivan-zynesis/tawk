# Tasks: conversation-model

- [x] 1. Create Conversation Mongoose schema with id, tenantId, name
- [x] 2. Create ConversationsService (findByTenant, findByIdAndTenant)
- [x] 3. Create ConversationsController with GET /api/conversations
- [x] 4. Create ConversationsModule, wire into AppModule
- [x] 5. Seed conversations per tenant in SeedService (alpha: #general, #engineering; beta: #general, #random)
- [x] 6. Validate conversation ownership on POST /api/messages (NotFoundException if not found)
- [x] 7. Update MessagesService unit test with ConversationsService mock
- [x] 8. Verify build and all 11 unit tests pass
