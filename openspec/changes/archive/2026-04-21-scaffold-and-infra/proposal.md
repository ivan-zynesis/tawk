# Proposal: scaffold-and-infra

**Parent initiative**: message-management-platform
**Milestone**: 1 of 5

## Summary

Bootstrap the NestJS project with TypeScript, configure Docker Compose for all infrastructure dependencies (MongoDB, Kafka, Zookeeper, Elasticsearch), and set up typed environment configuration via NestJS ConfigModule.

## Driver Specs Referenced

- **DS-TECH-STACK**: NestJS, MongoDB, Kafka, Elasticsearch mandated
- **DS-MULTI-TENANT**: Shared-infra model (single instances of each service)

## ADRs Referenced

- **DEC-001**: Single MongoDB collection, single ES index

## Scope

- NestJS project with TypeScript strict mode
- Docker Compose with MongoDB, Kafka + Zookeeper, Elasticsearch
- ConfigModule with typed configuration and `.env` support
- DDD-aligned folder structure
- Basic health check endpoint

## Non-goals

- No business logic, no message endpoints
- No authentication (milestone 2)
- No Kafka producer/consumer wiring (milestone 3/4)
