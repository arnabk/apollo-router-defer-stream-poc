# Technical Details

Deep dive into the implementation of Apollo @defer with Apollo Router.

## Architecture Overview

This demo uses Apollo Federation with Apollo Router:

```
┌─────────────┐
│   Client    │  (React + Apollo Client)
│  :3000      │
└──────┬──────┘
       │ GraphQL Queries with @defer
       ▼
┌─────────────┐
│   Apollo    │  (Rust-based Router, YAML config)
│   Router    │
│   :4000     │
└──────┬──────┘
       │ Federation
       ▼
┌─────────────┐
│  Subgraph   │  (Apollo Subgraph with resolvers)
│  Service    │
│  :4001      │
└─────────────┘
```

## Apollo Router

### What is Apollo Router?

Apollo Router is a high-performance GraphQL gateway written in Rust that:
- Handles query planning and execution for federated graphs
- Routes queries to appropriate subgraph services
- Provides native `@defer` and `@stream` support
- Configured via YAML (not JavaScript)
- Significantly faster than Apollo Gateway (Node.js)

### Router Configuration (router.yaml)

The router is configured declaratively:

```yaml
# Enable @defer support
experimental_defer_support: true

# Server configuration
server:
  listen: 0.0.0.0:4000

# Supergraph schema location
supergraph:
  path: ./supergraph-schema.graphql

# CORS for frontend
cors:
  origins:
    - http://localhost:3000
```

Key features:
- **Declarative**: All config in YAML
- **Type-safe**: Validated at startup
- **Hot-reload**: Can reload config without restart
- **Production-ready**: Built for high throughput

### How @defer Works in Apollo Router

When a query with `@defer` arrives:

1. **Query Planning**: Router creates an execution plan
2. **Initial Response**: Sends non-deferred data immediately
3. **Incremental Responses**: Streams deferred data as it arrives
4. **Multipart Protocol**: Uses `multipart/mixed` content type

**Example Flow:**

```
Client → Router: Query with @defer
Router → Subgraph: Requests data
Router → Client: Initial chunk (100ms) ⚡
Subgraph → Router: Deferred field 1 ready
Router → Client: Incremental chunk 1 (800ms)
Subgraph → Router: Deferred field 2 ready
Router → Client: Incremental chunk 2 (1200ms)
...
Router → Client: Final chunk (hasNext: false)
```

## Federation Architecture

### Supergraph Schema

The `supergraph-schema.graphql` is a compiled schema that includes:

```graphql
directive @join__field(
  graph: join__Graph,
  requires: join__FieldSet,
  provides: join__FieldSet
) on FIELD_DEFINITION

enum join__Graph {
  PRODUCTS @join__graph(
    name: "products",
    url: "http://localhost:4001"
  )
}
```

This tells the router:
- Which subgraphs exist
- Where they're located
- How to join data across them

### Subgraph Service

The subgraph implements Apollo Federation v2:

```javascript
import { buildSubgraphSchema } from '@apollo/subgraph';

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});
```

**Federation Directives:**

```graphql
extend schema
  @link(url: "https://specs.apollo.dev/federation/v2.3")

type User @key(fields: "id") {
  id: ID!
  name: String!
}
```

The `@key` directive tells the router how to uniquely identify entities.

## How @defer Works

### The Protocol

Apollo Router responds with a multipart HTTP response when @defer is used:

```http
HTTP/1.1 200 OK
Content-Type: multipart/mixed; boundary="-"
```

**Chunk 1** (immediate ~100ms):
```
---
Content-Type: application/json

{
  "data": {
    "user": {
      "id": "1",
      "name": "Alice Johnson",
      "email": "alice@example.com"
    }
  },
  "hasNext": true
}
```

**Chunk 2** (~800ms later):
```
---
Content-Type: application/json

{
  "incremental": [{
    "data": {
      "profile": {
        "avatar": "...",
        "bio": "..."
      }
    },
    "path": ["user"]
  }],
  "hasNext": true
}
```

**Final Chunk**:
```
---
Content-Type: application/json

{
  "hasNext": false
}
---
```

### Client-Side Handling

Apollo Client (3.7+) automatically:
1. Detects multipart responses
2. Parses each chunk
3. Merges incremental data into cache
4. Triggers re-renders
5. Manages loading states

No special client code needed!

## Resolver Design

### Intentional Delays

Each resolver simulates real-world latency:

```javascript
User: {
  // Fast: Basic lookup (100ms)
  name: async (user) => {
    await delay(100);
    return user.name;
  },

  // Medium: Database join (800ms)
  profile: async (user) => {
    await delay(800);
    return fetchProfile(user.id);
  },

  // Slow: Complex aggregation (1200ms)
  posts: async (user) => {
    await delay(1200);
    return fetchPosts(user.id);
  },

  // Very slow: ML/Analytics (1500ms)
  analytics: async (user) => {
    await delay(1500);
    return computeAnalytics(user.id);
  }
}
```

### Why These Delays?

| Delay | Represents |
|-------|------------|
| 100ms | Cache hit, simple DB query |
| 800ms | Database join, moderate complexity |
| 1000ms | External API call, microservice request |
| 1200ms | Complex aggregation, multiple joins |
| 1500ms | ML inference, heavy computation |

## Query Patterns

### Regular Query (No @defer)

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    profile { avatar bio }
    posts { title likes }
    analytics { totalPosts }
  }
}
```

**Execution:**
1. Router sends query to subgraph
2. Subgraph resolves ALL fields
3. Waits for slowest resolver (1500ms)
4. Returns complete response
5. Client receives data after ~3600ms

**User Experience:** Long blank screen 😞

### Query with @defer

```graphql
query GetUserDefer($id: ID!) {
  user(id: $id) {
    id
    name
    email
    ... @defer {
      profile { avatar bio }
    }
    ... @defer {
      posts { title likes }
    }
    ... @defer {
      analytics { totalPosts }
    }
  }
}
```

**Execution:**
1. Router sends query to subgraph
2. Subgraph resolves immediate fields first
3. Router sends initial response (~100ms)
4. Deferred fields resolve in parallel
5. Router streams them as they complete

**User Experience:** Instant initial render! 🚀

## Performance Characteristics

### Metrics Comparison

| Metric | Regular | @defer | Improvement |
|--------|---------|--------|-------------|
| Time to First Byte | 3600ms | 100ms | **97% faster** |
| Time to Interactive | 3600ms | 100ms | **97% faster** |
| Total Load Time | 3600ms | 3600ms | Same |
| User Satisfaction | 😞 | 😊 | Much better! |

### Network Traffic

**Regular Query:**
```
[════════════════════════════════] 3600ms
                                   ↓
                            All data arrives
```

**With @defer:**
```
[═] 100ms ⚡ Critical data
  [════] 800ms - Profile
    [══════] 1200ms - Posts
      [════] 1000ms - Friends
        [═══════] 1500ms - Analytics
```

Progressive loading keeps users engaged!

## Router vs Gateway

### Apollo Router (This Project)

✅ Written in Rust  
✅ YAML configuration  
✅ Native @defer support  
✅ 10-100x faster than Gateway  
✅ Lower memory footprint  
✅ Built for production scale  

### Apollo Gateway (Legacy)

⚠️ Written in Node.js  
⚠️ JavaScript configuration  
⚠️ Limited @defer support  
⚠️ Higher latency  
⚠️ More resource intensive  

**Migration**: This demo uses Router, not Gateway.

## Advanced Patterns

### Conditional Defer

Defer based on client capability:

```graphql
query GetUser($id: ID!, $enableDefer: Boolean!) {
  user(id: $id) {
    id
    name
    ... @defer(if: $enableDefer) {
      analytics { ... }
    }
  }
}
```

Router will only defer if `$enableDefer` is true.

### Nested Defer

Defer within deferred fragments:

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    ... @defer {
      posts {
        id
        title
        ... @defer {
          comments { author text }
        }
      }
    }
  }
}
```

Creates a waterfall of progressive loading.

### Label for Tracking

Add labels to identify deferred fragments:

```graphql
... @defer(label: "profile") {
  profile { ... }
}
... @defer(label: "posts") {
  posts { ... }
}
```

Useful for debugging and monitoring.

## Error Handling

### Errors in Deferred Fields

If a deferred field fails:

```json
{
  "incremental": [{
    "errors": [{
      "message": "Failed to load analytics",
      "path": ["user", "analytics"],
      "extensions": { "code": "INTERNAL_SERVER_ERROR" }
    }],
    "path": ["user"]
  }],
  "hasNext": true
}
```

**Benefits:**
- Initial data still renders
- Partial success is better than total failure
- Error is scoped to the failed field

### Router Error Handling

The router provides:
- Timeout configuration per subgraph
- Retry logic
- Circuit breaking
- Detailed error messages

Configure in `router.yaml`:

```yaml
traffic_shaping:
  subgraphs:
    products:
      timeout: 30s
      retry:
        min_per_sec: 10
        ttl: 60s
```

## Monitoring & Observability

### Router Telemetry

Apollo Router provides:

```yaml
telemetry:
  instrumentation:
    spans:
      mode: spec_compliant
    instruments:
      default_requirement_level: required
```

Exports:
- OpenTelemetry traces
- Prometheus metrics
- Logging

### Metrics to Track

- **Time to First Byte (TTFB)**
- **Time to Interactive (TTI)**
- **Chunk delivery times**
- **Error rates per field**
- **Subgraph latency**
- **Cache hit rates**

### Query Plan Inspection

Enable query plan exposure:

```yaml
plugins:
  experimental.expose_query_plan: true
```

Then query with header:
```
Apollo-Query-Plan-Experimental: true
```

See how the router plans to execute your query.

## Production Considerations

### When to Use @defer

✅ **Good Use Cases:**
- Below-the-fold content
- Analytics dashboards
- Product recommendations
- User activity feeds
- Complex calculations
- External API calls

❌ **Avoid For:**
- Critical path data
- Authentication/authorization
- Small/fast queries
- Tightly coupled data

### Performance Tuning

**1. Batch Related Defers:**
```graphql
# Instead of:
... @defer { field1 }
... @defer { field2 }

# Group related fields:
... @defer {
  field1
  field2
}
```

**2. Set Appropriate Timeouts:**
```yaml
traffic_shaping:
  all:
    timeout: 30s
```

**3. Enable Caching:**
```yaml
cache:
  in_memory:
    limit: 512MB
```

**4. Monitor Field Latency:**
Track which fields are slow and optimize them.

### Scaling Considerations

- **Router**: Stateless, scales horizontally
- **Subgraph**: Can be replicated
- **Load Balancing**: Router handles retries
- **Connection Pooling**: Router manages connections efficiently

## Debugging

### Router Logs

Start with verbose logging:

```bash
./router --config router.yaml --log info
```

Log levels: `error`, `warn`, `info`, `debug`, `trace`

### Network Inspection

In Chrome DevTools:
1. Open Network tab
2. Execute query with @defer
3. Click the GraphQL request
4. View Response tab
5. See multipart chunks arriving

### Apollo Studio Integration

Connect to Apollo Studio for:
- Query tracing
- Performance monitoring
- Schema change validation
- Operation metrics

## Further Exploration

### Modify Delays

Experiment in `subgraph/src/resolvers.js`:

```javascript
// Ultra slow to see dramatic difference
await delay(10000);

// Fast to see when @defer isn't worth it
await delay(50);
```

### Add New Fields

1. Update schema: `subgraph/src/schema.js`
2. Add resolver: `subgraph/src/resolvers.js`
3. Regenerate supergraph schema (in production use Rover CLI)
4. Use @defer in queries

### Router Configuration

Try different router configs:

```yaml
# Strict mode
experimental_defer_support: true

# Timeout adjustments
traffic_shaping:
  all:
    timeout: 5s  # Short timeout

# Header forwarding
headers:
  all:
    request:
      - propagate:
          named: "x-custom-header"
```

## Resources

- [Apollo Router Docs](https://www.apollographql.com/docs/router/)
- [Router @defer Support](https://www.apollographql.com/docs/router/executing-operations/defer-support)
- [Federation Specification](https://www.apollographql.com/docs/federation/)
- [Router Configuration Reference](https://www.apollographql.com/docs/router/configuration/overview)
- [GraphQL @defer Spec](https://github.com/graphql/graphql-spec/blob/main/rfcs/DeferStream.md)
- [Rover CLI](https://www.apollographql.com/docs/rover/) - Schema composition tool
