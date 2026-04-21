# Proposal: auth-and-tenancy

**Parent initiative**: message-management-platform
**Milestone**: 2 of 5

## Summary

Implement JWT authentication and multi-tenant resolution. Every request is authenticated via JWT, then the userId is mapped to a tenantId via a DB lookup. Guards and decorators make tenant identity available to all downstream controllers.

## Driver Specs Referenced

- **DS-MULTI-TENANT**: tenantId resolved from authenticated user, not passed by client

## ADRs Referenced

- **DEC-003**: JWT userId + DB lookup for tenant resolution

## Scope

- Passport JWT strategy with AuthGuard
- user_tenants Mongoose schema and collection
- TenantGuard that resolves and attaches tenantId
- @CurrentTenant() and @CurrentUser() param decorators
- Seed service with dev fixtures (users, tenants)
- JWT secret via ConfigModule

## Non-goals

- No user registration/invitation APIs
- No role-based authorization beyond tenant membership
