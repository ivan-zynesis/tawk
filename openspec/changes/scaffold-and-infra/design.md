# Design: scaffold-and-infra

## Project Structure

```
src/
  main.ts                         # Bootstrap, global pipes, prefix
  app.module.ts                   # Root module
  config/
    configuration.ts              # Typed config factory
    validation.ts                 # Joi schema for env validation
  health/
    health.controller.ts          # GET /health
    health.module.ts
```

## Docker Compose Services

| Service        | Image                                          | Exposed Port |
|----------------|------------------------------------------------|-------------|
| mongodb        | mongo:7                                        | 27017       |
| zookeeper      | confluentinc/cp-zookeeper:7.5.0                | 2181        |
| kafka          | confluentinc/cp-kafka:7.5.0                    | 9092        |
| elasticsearch  | docker.elastic.co/elasticsearch/elasticsearch:8.11.0 | 9200  |

## Configuration

Environment variables with defaults suitable for local Docker Compose:

| Variable          | Default                  |
|-------------------|--------------------------|
| PORT              | 3000                     |
| MONGODB_URI       | mongodb://localhost:27017/tawk |
| KAFKA_BROKERS     | localhost:9092           |
| ELASTICSEARCH_URL | http://localhost:9200    |

Validated at startup via Joi schema. Exposed as typed config via `ConfigService`.
