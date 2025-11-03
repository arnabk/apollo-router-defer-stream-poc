import { ApolloServer } from '@apollo/subgraph';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  includeStacktraceInErrorResponses: true,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4001 },
  context: async () => ({}),
});

console.log(`🚀 Subgraph ready at ${url}`);

