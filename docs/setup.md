# Setup Guide

This guide will help you get the Apollo Router @defer & @stream demo running on your local machine.

## Prerequisites

- **Node.js** 18+ (with npm)
- **Git** (for cloning the repository)
- **curl** or **wget** (for downloading Apollo Router)

## Installation

### 1. Download Apollo Router

First, download the Apollo Router binary for your platform:

```bash
npm run download:router
```

This script will automatically:
- Detect your platform (macOS, Linux, Windows)
- Download the appropriate Apollo Router binary
- Extract and make it executable
- Place it in the `router/` directory

**Manual Download (Alternative)**:
If the script fails, download manually from:
https://github.com/apollographql/router/releases

Place the binary in the `router/` directory and make it executable:
```bash
chmod +x router/router
```

### 2. Install Dependencies

From the root directory, install all dependencies:

```bash
npm install
npm run install:all
```

This will install dependencies for:
- Root workspace
- Subgraph service (`/subgraph`)
- React Client (`/client`)

### 3. Start the Development Environment

Run all services concurrently:

```bash
npm run dev
```

This will start:
- **Apollo Router** on `http://localhost:4000` (YAML-configured)
- **Subgraph Service** on `http://localhost:4001` (Apollo Subgraph)
- **React Client** on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to:
- **Demo UI**: http://localhost:3000
- **GraphQL via Router**: http://localhost:4000

## Manual Setup (Alternative)

If you prefer to run each service separately:

### Terminal 1 - Subgraph Service

```bash
cd subgraph
npm install
npm run dev
```

Subgraph will be available at `http://localhost:4001`

### Terminal 2 - Apollo Router

```bash
cd router
./router --config router.yaml --supergraph supergraph-schema.graphql
```

Router will be available at `http://localhost:4000`

### Terminal 3 - React Client

```bash
cd client
npm install
npm run dev
```

Client will be available at `http://localhost:3000`

## Project Structure

```
apollo-router-defer-stream-poc/
├── router/                    # Apollo Router (YAML-based)
│   ├── router.yaml           # Router configuration
│   ├── supergraph-schema.graphql  # Federated schema
│   ├── router                # Router binary (downloaded)
│   └── README.md
│
├── subgraph/                 # GraphQL Subgraph Service
│   ├── src/
│   │   ├── index.js         # Subgraph entry point
│   │   ├── schema.js        # Federation schema
│   │   ├── resolvers.js     # Resolvers with delays
│   │   └── data.js          # Mock data
│   └── package.json
│
├── client/                   # React Client
│   ├── src/
│   │   ├── main.jsx         # React entry point
│   │   ├── App.jsx          # Main app component
│   │   ├── components/      # Reusable components
│   │   │   ├── demos/       # Demo scenarios
│   │   │   └── ...
│   │   └── styles/          # CSS modules
│   └── package.json
│
├── scripts/
│   └── download-router.js   # Script to download Router binary
│
├── docs/                     # Documentation
│   ├── OVERVIEW.md
│   ├── SETUP.md
│   ├── USAGE.md
│   └── TECHNICAL.md
│
└── package.json             # Root workspace config
```

## Architecture

### Apollo Router (Port 4000)

The **Apollo Router** is a high-performance GraphQL gateway written in Rust. It:
- Routes queries to the subgraph service
- Handles `@defer` and `@stream` directives natively
- Configured via YAML (`router.yaml`)
- Requires a supergraph schema

### Subgraph Service (Port 4001)

A GraphQL service built with `@apollo/subgraph` that:
- Implements the actual data resolvers
- Adds artificial delays to simulate real-world conditions
- Uses Apollo Federation v2 specification
- Provides data to the router

### Client (Port 3000)

React application with Apollo Client that:
- Queries the router (not the subgraph directly)
- Demonstrates `@defer` performance benefits
- Shows side-by-side comparisons

## Technology Stack

### Router
- **Apollo Router** 1.35+ - Rust-based GraphQL gateway
- **YAML Configuration** - Declarative router setup
- **Federation v2** - Supergraph composition

### Subgraph
- **@apollo/subgraph** 2.7+ - Federation subgraph library
- **GraphQL** 16.8.1 - GraphQL implementation
- **Node.js** ESM modules

### Client
- **React** 18.2.0 - UI framework
- **@apollo/client** 3.9.0 - Apollo Client with @defer support
- **Vite** 5.1.0 - Fast build tool and dev server

## Troubleshooting

### Router Binary Not Found

If you see "router: command not found":

1. Run the download script:
```bash
npm run download:router
```

2. Verify the binary exists:
```bash
ls -la router/router
```

3. Ensure it's executable:
```bash
chmod +x router/router
```

### Port Already in Use

**For Router (port 4000):**
Edit `router/router.yaml`:
```yaml
server:
  listen: 0.0.0.0:4002  # Change to any available port
```

**For Subgraph (port 4001):**
Edit `subgraph/src/index.js`:
```javascript
listen: { port: 4003 }  // Change to any available port
```

Then update the supergraph schema URL in `router/supergraph-schema.graphql`:
```graphql
enum join__Graph {
  PRODUCTS @join__graph(name: "products", url: "http://localhost:4003")
}
```

**For Client (port 3000):**
Edit `client/vite.config.js`:
```javascript
server: {
  port: 3001  // Change to any available port
}
```

### Connection Issues

If the client can't connect to the router:

1. Ensure all services are running:
   - Router at http://localhost:4000
   - Subgraph at http://localhost:4001
   - Client at http://localhost:3000

2. Check the router logs for errors

3. Verify CORS configuration in `router/router.yaml`

4. Test the router directly:
```bash
curl http://localhost:4000/health
```

### Module Resolution Errors

If you encounter module resolution errors:

1. Delete all `node_modules`:
```bash
rm -rf node_modules subgraph/node_modules client/node_modules
```

2. Clear npm cache:
```bash
npm cache clean --force
```

3. Reinstall:
```bash
npm run install:all
```

### Apollo Router Download Fails

If automatic download fails:

1. **Manual Download**: Visit https://github.com/apollographql/router/releases
2. Download the binary for your platform:
   - macOS ARM: `router-*-aarch64-apple-darwin.tar.gz`
   - macOS Intel: `router-*-x86_64-apple-darwin.tar.gz`
   - Linux: `router-*-x86_64-unknown-linux-gnu.tar.gz`
   - Windows: `router-*-x86_64-pc-windows-msvc.tar.gz`
3. Extract the archive
4. Move the `router` binary to the `router/` directory
5. Make it executable: `chmod +x router/router`

## Configuration

### Router YAML

The `router/router.yaml` file configures:
- Server port and host
- **@defer support** (experimental_defer_support: true)
- CORS settings
- Subgraph endpoints
- Timeout settings
- Telemetry options

### Supergraph Schema

The `router/supergraph-schema.graphql` is a federated schema that:
- Combines all subgraph schemas
- Defines routing directives
- Specifies subgraph URLs

**Note**: In production, use Rover CLI to compose this automatically.

## Next Steps

Once everything is running:

1. Read the [Usage Guide](./USAGE.md) to learn how to use the demo
2. Check the [Technical Details](./TECHNICAL.md) to understand the implementation
3. Experiment with the three demo scenarios in the UI

## Development

### Hot Reload

- **Router**: Restart required for config changes
- **Subgraph**: Uses `node --watch` (Node 18+)
- **Client**: Uses Vite's HMR (Hot Module Replacement)

### Making Changes

- **Router config**: Edit `router/router.yaml` (restart router)
- **Schema changes**: Edit `subgraph/src/schema.js` and `router/supergraph-schema.graphql`
- **Resolver delays**: Adjust timing in `subgraph/src/resolvers.js`
- **UI components**: Modify files in `client/src/components/`
- **Styles**: Update CSS in `client/src/styles/`

## Learn More

- [Apollo Router Docs](https://www.apollographql.com/docs/router/)
- [Federation Documentation](https://www.apollographql.com/docs/federation/)
- [Router Configuration Reference](https://www.apollographql.com/docs/router/configuration/overview)
