# Usage Guide

Learn how to use the Apollo @defer & @stream demo to understand the performance benefits.

## Demo Interface

The application provides a split-screen comparison interface that allows you to see the difference between regular GraphQL queries and queries using the `@defer` directive.

### Navigation

At the top of the page, you'll find three demo scenarios:

1. **👤 User Profile** - Complex user data with profile, posts, friends, and analytics
2. **🛍️ Product Page** - E-commerce page with inventory, reviews, and recommendations
3. **📊 Dashboard** - Multi-widget dashboard with activity, notifications, and recommendations

Click any button to switch between scenarios.

## How to Run a Comparison

### Step 1: Select a Demo

Choose one of the three demo scenarios from the navigation bar.

### Step 2: Execute Queries

Each demo shows two panels side-by-side:

- **Left Panel**: Regular Query (Standard GraphQL)
- **Right Panel**: Query with @defer

Click the **"Run Query"** button in each panel to execute the query.

### Step 3: Observe the Differences

Pay attention to:

#### Timing Metrics

Both panels display:
- **First Data**: Time until the first piece of data is rendered
- **Total Time**: Time until all data has loaded

The `@defer` panel also shows:
- **Performance Benefit**: Percentage improvement in initial render time

#### Visual Loading

- **Regular Query**: All sections load at once after a long wait
- **@defer Query**: Critical sections load immediately, others stream in progressively

#### Loading States

Watch for:
- Gray shimmer placeholders (loading)
- Smooth transitions as data arrives
- Progressive content population

## Understanding the Results

### User Profile Demo

**Regular Query (No @defer)**
- Waits ~3600ms for ALL data
- User sees nothing for several seconds
- Everything appears at once

**With @defer**
- Shows name/email in ~100ms ⚡
- Profile loads next (~800ms)
- Posts, friends, and analytics stream in progressively
- User can start reading immediately!

### Product Page Demo

**Regular Query (No @defer)**
- Waits ~3400ms for complete page
- Long blank screen
- Frustrating for users wanting to check price/availability

**With @defer**
- Product name, description, price visible in ~100ms ⚡
- Inventory status loads next (~900ms)
- Reviews and recommendations stream in
- User can make purchase decision immediately

### Dashboard Demo

**Regular Query (No @defer)**
- Waits ~3100ms for full dashboard
- Empty screen while loading
- Poor perceived performance

**With @defer**
- User welcome message appears in ~100ms ⚡
- Activity, notifications, and recommendations load progressively
- Feels much faster and more responsive

## Key Observations

### Time to Interactive (TTI)

The most important metric for user experience:

- **Regular Query**: TTI = Total Load Time (3000-4000ms)
- **@defer Query**: TTI = First Data Time (~100ms)

This means users can interact **30-40x faster** with @defer!

### Perceived Performance

Even though the total load time is similar, `@defer` *feels* much faster because:

1. **No blank screen** - Users see content immediately
2. **Progressive disclosure** - Content appears in priority order
3. **Visual feedback** - Loading states show progress
4. **Early interactivity** - Users can start reading/navigating

### Network Efficiency

Both approaches transfer the same amount of data, but @defer:
- Prioritizes critical data first
- Streams non-critical data in parallel
- Allows client-side rendering to start immediately

## Best Practices

### When to Use @defer

✅ **Use @defer for:**
- Below-the-fold content
- Analytics and statistics
- User recommendations
- Complex computed fields
- External API calls
- Historical data

### When NOT to Use @defer

❌ **Don't use @defer for:**
- Critical above-the-fold content
- Small/fast queries
- Data needed for initial render decisions
- Tightly coupled data that must arrive together

## Experimenting with the Demo

### Try Different Patterns

1. **Run Regular Query First**
   - Notice the loading spinner duration
   - Count how long until content appears
   - Observe the "all at once" loading

2. **Run @defer Query Next**
   - See how fast the initial data appears
   - Watch the progressive loading
   - Compare the perceived speed

3. **Run Both Simultaneously**
   - Click both "Run Query" buttons quickly
   - Directly compare loading patterns
   - Observe the timing differences

### Simulate Real Conditions

The demo uses artificial delays to simulate:
- **Fast queries** (~100ms): Basic data fetches
- **Medium queries** (~800-1000ms): Database joins, external APIs
- **Slow queries** (~1200-1500ms): Complex calculations, ML inference

In production, these delays might come from:
- Database query complexity
- Third-party API latency
- Microservice communication
- Geographic data center distance
- Network congestion

## Tips for Best Results

1. **Use a modern browser** - Chrome, Firefox, Safari, or Edge
2. **Open DevTools Network tab** - See the multipart response streaming
3. **Throttle your connection** - Makes the differences even more visible
4. **Watch the timing metrics** - Numbers don't lie!
5. **Focus on "First Data" time** - This is what users actually feel

## Common Questions

**Q: Why is Total Time the same?**  
A: @defer doesn't make queries faster - it prioritizes what loads first. Total data transfer time is similar, but user experience is vastly improved.

**Q: Does this work with all GraphQL servers?**  
A: You need a server that supports the `@defer` directive. Apollo Server 4+ has built-in support.

**Q: Will this work with my existing queries?**  
A: Yes! Just add `@defer` to fields you want to load later. No server changes needed (if using Apollo Server 4+).

**Q: Is there any overhead?**  
A: Minimal. The multipart response protocol has small overhead, but the UX benefits far outweigh it.

## Next Steps

- Read the [Technical Details](./TECHNICAL.md) to understand how it works under the hood
- Explore the source code to see implementation patterns
- Try implementing `@defer` in your own projects!

