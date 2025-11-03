# @stream Directive - Not Currently Supported

## Status

The `@stream` directive is **not currently supported** in Apollo Router v2.8.0.

## Official Discussion

According to the [Apollo Community discussion](https://community.apollographql.com/t/support-for-stream-in-the-router/9518):

> "we're busy getting our OSS (Apollo Server, and the clients) to support the new incremental delivery format, which brings along support for @stream too. Router support is a different story though."
> 
> — Apollo Team, October 2024

## What is @stream?

The `@stream` directive is designed to stream individual list items as they become available, rather than waiting for the entire list to be ready.

### Example Use Case

```graphql
query GetPosts {
  posts @stream(initialCount: 0) {
    id
    title
    content
  }
}
```

This would allow posts to arrive one at a time rather than all at once.

## Current Workarounds

While `@stream` is not supported in Apollo Router, you can achieve similar functionality using:

1. **@defer** - Defer entire fields (supported in Apollo Router v2.8.0)
   ```graphql
   query GetUser {
     user {
       id
       name
       ... @defer {
         posts {
           id
           title
         }
       }
     }
   }
   ```

2. **Subscriptions** - For real-time streaming use cases
   ```graphql
   subscription OnPostAdded {
     postAdded {
       id
       title
     }
   }
   ```

3. **Pagination** - Traditional offset or cursor-based pagination
   ```graphql
   query GetPosts($offset: Int, $limit: Int) {
     posts(offset: $offset, limit: $limit) {
       id
       title
     }
   }
   ```

## Why This Demo Focuses on @defer

This demonstration project focuses exclusively on the `@defer` directive because:

- ✅ Fully supported in Apollo Router v2.8.0
- ✅ Production-ready
- ✅ Provides significant performance benefits
- ✅ Solves the most common incremental delivery use cases

## Future Support

Apollo is working on bringing `@stream` support to the Router in future versions. Check the following resources for updates:

- [Apollo Community Forum](https://community.apollographql.com/c/router/20)
- [Apollo Router GitHub](https://github.com/apollographql/router)
- [Apollo Router Release Notes](https://github.com/apollographql/router/releases)

## Related Resources

- [Apollo Router @defer Documentation](https://www.apollographql.com/docs/router/executing-operations/defer-support)
- [GraphQL @stream Specification](https://github.com/graphql/graphql-spec/blob/main/rfcs/DeferStream.md)
- [Apollo Community: Support for @stream](https://community.apollographql.com/t/support-for-stream-in-the-router/9518)

