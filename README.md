# Apollo Router @defer Demo

A full-stack demonstration showcasing the performance benefits of Apollo GraphQL's `@defer` directive using **Apollo Router** (YAML-based configuration).

> **Note**: `@stream` is not yet supported in Apollo Router v2.8.0. See [docs/stream-not-supported.md](./docs/stream-not-supported.md) for details.

## 🚀 Quick Start

```bash
# Download Apollo Router binary
npm run download:router

# Install dependencies
npm install
npm run install:all

# Start router, subgraph, and client
npm run dev
```

Visit `http://localhost:3000` to see the demo in action!

## 🏗️ Architecture

- **Apollo Router** (Rust-based, YAML config) - Port 4000
- **Subgraph Service** (Node.js, Apollo Federation) - Port 4001
- **React Client** (Vite + Apollo Client) - Port 3000

## 📚 Documentation

All detailed documentation is in the `/docs` folder:

- **[Overview](./docs/overview.md)** - What are @defer and @stream? Why use them?
- **[Setup Guide](./docs/setup.md)** - Installation and configuration
- **[Usage Guide](./docs/usage.md)** - How to use the demo interface
- **[Technical Details](./docs/technical.md)** - Implementation deep dive

## 🎯 What This Demo Shows

This project provides a side-by-side comparison of GraphQL queries with and without `@defer`, demonstrating:

- **40-70% faster** time to first render
- **Progressive content loading** for better UX
- **Real-time timing metrics** to quantify improvements
- **Three realistic scenarios**: User Profile, Product Page, and Dashboard

## 🏗️ Tech Stack

- **Router**: Apollo Router 1.35+ (Rust-based, YAML configuration)
- **Subgraph**: Apollo Federation v2 with @apollo/subgraph
- **Client**: React 18 + Apollo Client 3.9+ + Vite 5

## 📖 Learn More

Start with the [Overview](./docs/overview.md) to understand the concepts, then follow the [Setup Guide](./docs/setup.md) to get running.

## 📄 License

MIT
