# Decision Map

```
DS-MSG-SCHEMA (driver)
  └── (referenced by DEC-001 indexes, DEC-004 partition key)

DS-MULTI-TENANT (driver)
  ├── DEC-001: Shared-infra multi-tenancy [depth=0]
  └── DEC-003: JWT + user-tenant auth [depth=0]

DS-TECH-STACK (driver)
  ├── DEC-002: Best-effort Kafka publish [depth=0]
  │     └── DEC-004: Single topic, partition by conversationId [depth=1]
  ├── DEC-005: Testcontainers-based integration testing [depth=0]
  └── DEC-006: Vitest + SWC for test runner [depth=0]
```

## Blast Radius

| If this changes... | These are invalidated |
|---|---|
| DS-MULTI-TENANT | DEC-001, DEC-003 |
| DS-TECH-STACK | DEC-002, DEC-004, DEC-005, DEC-006 |
| DEC-002 | DEC-004 |
