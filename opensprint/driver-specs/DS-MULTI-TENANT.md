---
id: DS-MULTI-TENANT
name: Multi-Tenancy Model
type: product
status: active
created: 2026-04-19
---

## Constraint

The system must support multiple tenants on shared infrastructure. Data isolation is enforced via `tenantId` filtering — not via separate databases or collections per tenant. No per-tenant provisioning is required.

Tenant identity is resolved from the authenticated user (userId → tenantId mapping), not passed directly by the client.

## Source

Product requirements — problem statement sections 3, 4.6, and non-functional requirements.
