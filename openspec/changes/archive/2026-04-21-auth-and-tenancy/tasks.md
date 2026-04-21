# Tasks: auth-and-tenancy

- [x] 1. Install dependencies (passport, @nestjs/passport, @nestjs/jwt, passport-jwt)
- [x] 2. Create UserTenant Mongoose schema and module
- [x] 3. Create JWT strategy and AuthGuard
- [x] 4. Create TenantGuard (resolves tenantId from userId via user_tenants lookup)
- [x] 5. Create @CurrentTenant() and @CurrentUser() decorators
- [x] 6. Create seed service with test fixtures (users + tenant mappings)
- [x] 7. Wire AuthModule into AppModule, add JWT_SECRET to config
- [x] 8. Verify build compiles
