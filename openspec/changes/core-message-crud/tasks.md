# Tasks: core-message-crud

- [x] 1. Install ulid dependency
- [x] 2. Create Message Mongoose schema with compound index {tenantId, conversationId, timestamp}
- [x] 3. Create CreateMessageDto and GetMessagesQueryDto with class-validator
- [x] 4. Create MessagesService (create with ULID + Kafka publish, findByConversation with cursor pagination)
- [x] 5. Create MessagesController with AuthGuard + TenantGuard on both endpoints
- [x] 6. Wire Kafka producer into MessagesModule
- [x] 7. Verify build compiles
