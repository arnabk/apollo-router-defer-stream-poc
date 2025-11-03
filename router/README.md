# Apollo Router Configuration

This directory contains the Apollo Router configuration and supergraph schema.

## Files

- `router.yaml` - Main router configuration (YAML)
- `supergraph-schema.graphql` - Federated supergraph schema
- `router` (binary) - Apollo Router executable (downloaded automatically)

## Configuration Highlights

### @defer Support

The router is configured with experimental defer support enabled:

```yaml
experimental_defer_support: true
```

This allows the router to handle `@defer` directives in GraphQL queries.

### CORS

Configured to allow requests from the frontend:

```yaml
cors:
  origins:
    - http://localhost:3000
```

### Subgraphs

The router connects to the subgraph service at:

```
http://localhost:4001
```

## Running the Router

The router is automatically started when you run:

```bash
npm run dev
```

Or manually:

```bash
./router --config router.yaml --supergraph supergraph-schema.graphql
```

## Downloading the Router

The Apollo Router binary is not included in git. Download it with:

```bash
npm run download:router
```

This will download the appropriate binary for your platform (macOS, Linux, or Windows).

## Learn More

- [Apollo Router Documentation](https://www.apollographql.com/docs/router/)
- [Router Configuration](https://www.apollographql.com/docs/router/configuration/overview)
- [Defer Support](https://www.apollographql.com/docs/router/executing-operations/defer-support)

