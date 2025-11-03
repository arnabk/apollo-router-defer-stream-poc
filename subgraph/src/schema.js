import gql from 'graphql-tag';

export const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key", "@shareable"])

  type Query {
    user(id: ID!): User
    product(id: ID!): Product
    dashboard: Dashboard
  }

  type User @key(fields: "id") {
    id: ID!
    name: String!
    email: String!
    profile: UserProfile!
    posts: [Post!]!
    friends: [User!]!
    analytics: UserAnalytics!
  }

  type UserProfile {
    avatar: String!
    bio: String!
    location: String!
    website: String
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    createdAt: String!
    likes: Int!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    author: String!
    text: String!
    createdAt: String!
  }

  type UserAnalytics {
    totalPosts: Int!
    totalLikes: Int!
    totalComments: Int!
    engagementRate: Float!
  }

  type Product @key(fields: "id") {
    id: ID!
    name: String!
    description: String!
    price: Float!
    inventory: Inventory!
    reviews: [Review!]!
    recommendations: [Product!]!
  }

  type Inventory {
    inStock: Boolean!
    quantity: Int!
    warehouse: String!
  }

  type Review {
    id: ID!
    author: String!
    rating: Int!
    text: String!
    createdAt: String!
  }

  type Dashboard {
    user: User!
    recentActivity: [Activity!]!
    recommendations: [Product!]!
    notifications: [Notification!]!
  }

  type Activity {
    id: ID!
    type: String!
    description: String!
    timestamp: String!
  }

  type Notification {
    id: ID!
    title: String!
    message: String!
    read: Boolean!
    timestamp: String!
  }
`;

