import {
  users,
  userProfiles,
  posts,
  comments,
  products,
  inventory,
  reviews,
  activities,
  notifications,
} from './data.js';

// Helper function to simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const resolvers = {
  Query: {
    user: async (_, { id }) => {
      // Fast: Basic user data (100ms)
      await delay(100);
      return users[id];
    },
    product: async (_, { id }) => {
      // Fast: Basic product data (100ms)
      await delay(100);
      return products[id];
    },
    dashboard: async () => {
      // Fast: Basic dashboard data (100ms)
      await delay(100);
      return {
        userId: '1',
      };
    },
  },

  User: {
    __resolveReference: async (user) => {
      return users[user.id];
    },
    profile: async (user) => {
      // Medium delay: Profile data (800ms)
      await delay(800);
      return userProfiles[user.id];
    },
    posts: async (user) => {
      // Slow: Posts data (1200ms)
      await delay(1200);
      return posts.filter((post) => post.userId === user.id);
    },
    friends: async (user) => {
      // Medium delay: Friends data (1000ms)
      await delay(1000);
      // Return other users as friends
      return Object.values(users).filter((u) => u.id !== user.id);
    },
    analytics: async (user) => {
      // Very slow: Analytics computation (1500ms)
      await delay(1500);
      const userPosts = posts.filter((post) => post.userId === user.id);
      const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
      const totalComments = userPosts.reduce(
        (sum, post) => sum + (comments[post.id]?.length || 0),
        0
      );
      return {
        totalPosts: userPosts.length,
        totalLikes,
        totalComments,
        engagementRate: userPosts.length > 0 ? (totalLikes + totalComments) / userPosts.length : 0,
      };
    },
  },

  Post: {
    comments: async (post) => {
      // Medium delay: Comments (600ms)
      await delay(600);
      return comments[post.id] || [];
    },
  },

  Product: {
    __resolveReference: async (product) => {
      return products[product.id];
    },
    inventory: async (product) => {
      // Medium delay: Inventory check (900ms)
      await delay(900);
      return inventory[product.id];
    },
    reviews: async (product) => {
      // Slow: Reviews (1100ms)
      await delay(1100);
      return reviews[product.id] || [];
    },
    recommendations: async (product) => {
      // Very slow: ML-based recommendations (1400ms)
      await delay(1400);
      // Return other products as recommendations
      return Object.values(products).filter((p) => p.id !== product.id).slice(0, 3);
    },
  },

  Dashboard: {
    user: async (dashboard) => {
      // Return user reference for Apollo Federation
      return { __typename: 'User', id: dashboard.userId };
    },
    recentActivity: async () => {
      // Slow: Activity feed (1000ms)
      await delay(1000);
      return activities;
    },
    recommendations: async () => {
      // Very slow: Personalized recommendations (1300ms)
      await delay(1300);
      return Object.values(products).slice(0, 4);
    },
    notifications: async () => {
      // Medium delay: Notifications (700ms)
      await delay(700);
      return notifications;
    },
  },
};

