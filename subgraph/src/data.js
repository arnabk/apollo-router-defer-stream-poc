// Mock data generators
export const users = {
  '1': {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
  },
  '2': {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
  },
  '3': {
    id: '3',
    name: 'Carol White',
    email: 'carol@example.com',
  },
};

export const userProfiles = {
  '1': {
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'Full-stack developer passionate about GraphQL and modern web technologies.',
    location: 'San Francisco, CA',
    website: 'https://alice.dev',
  },
  '2': {
    avatar: 'https://i.pravatar.cc/150?img=2',
    bio: 'Product designer focused on creating delightful user experiences.',
    location: 'New York, NY',
    website: 'https://bobsmith.com',
  },
  '3': {
    avatar: 'https://i.pravatar.cc/150?img=3',
    bio: 'Data scientist exploring the intersection of AI and user behavior.',
    location: 'Austin, TX',
    website: null,
  },
};

export const posts = [
  {
    id: '1',
    userId: '1',
    title: 'Understanding Apollo @defer and @stream',
    content: 'These directives are game-changers for GraphQL performance...',
    createdAt: '2024-11-01T10:00:00Z',
    likes: 142,
  },
  {
    id: '2',
    userId: '1',
    title: 'Building Modern UIs with React',
    content: 'Best practices for creating responsive and accessible interfaces...',
    createdAt: '2024-10-28T14:30:00Z',
    likes: 87,
  },
  {
    id: '3',
    userId: '1',
    title: 'GraphQL Query Optimization',
    content: 'Tips and tricks for making your queries faster and more efficient...',
    createdAt: '2024-10-25T09:15:00Z',
    likes: 203,
  },
];

export const comments = {
  '1': [
    {
      id: '1',
      author: 'Bob Smith',
      text: 'Great article! Very informative.',
      createdAt: '2024-11-01T11:00:00Z',
    },
    {
      id: '2',
      author: 'Carol White',
      text: 'This helped me understand defer much better!',
      createdAt: '2024-11-01T12:30:00Z',
    },
  ],
  '2': [
    {
      id: '3',
      author: 'David Lee',
      text: 'Love the examples you provided.',
      createdAt: '2024-10-28T15:00:00Z',
    },
  ],
  '3': [
    {
      id: '4',
      author: 'Emma Davis',
      text: 'Excellent optimization tips!',
      createdAt: '2024-10-25T10:00:00Z',
    },
  ],
};

export const products = {
  '1': {
    id: '1',
    name: 'Ultra HD Monitor',
    description: 'Professional 32" 4K monitor with HDR support',
    price: 599.99,
  },
  '2': {
    id: '2',
    name: 'Mechanical Keyboard',
    description: 'Premium mechanical keyboard with RGB lighting',
    price: 149.99,
  },
  '3': {
    id: '3',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking',
    price: 79.99,
  },
  '4': {
    id: '4',
    name: 'Laptop Stand',
    description: 'Adjustable aluminum laptop stand',
    price: 49.99,
  },
};

export const inventory = {
  '1': {
    inStock: true,
    quantity: 15,
    warehouse: 'West Coast Distribution Center',
  },
  '2': {
    inStock: true,
    quantity: 42,
    warehouse: 'East Coast Distribution Center',
  },
  '3': {
    inStock: true,
    quantity: 28,
    warehouse: 'Midwest Distribution Center',
  },
  '4': {
    inStock: false,
    quantity: 0,
    warehouse: 'West Coast Distribution Center',
  },
};

export const reviews = {
  '1': [
    {
      id: '1',
      author: 'John Doe',
      rating: 5,
      text: 'Amazing monitor! Colors are vibrant and sharp.',
      createdAt: '2024-10-30T08:00:00Z',
    },
    {
      id: '2',
      author: 'Jane Smith',
      rating: 4,
      text: 'Great quality, but a bit pricey.',
      createdAt: '2024-10-29T14:20:00Z',
    },
  ],
  '2': [
    {
      id: '3',
      author: 'Mike Johnson',
      rating: 5,
      text: 'Best keyboard I\'ve ever used!',
      createdAt: '2024-10-31T09:30:00Z',
    },
  ],
  '3': [
    {
      id: '4',
      author: 'Sarah Williams',
      rating: 4,
      text: 'Very comfortable and precise.',
      createdAt: '2024-10-28T16:45:00Z',
    },
  ],
  '4': [],
};

export const activities = [
  {
    id: '1',
    type: 'post',
    description: 'You published a new article',
    timestamp: '2024-11-01T10:00:00Z',
  },
  {
    id: '2',
    type: 'comment',
    description: 'Bob commented on your post',
    timestamp: '2024-11-01T11:00:00Z',
  },
  {
    id: '3',
    type: 'like',
    description: 'Your post received 50 new likes',
    timestamp: '2024-11-01T13:00:00Z',
  },
];

export const notifications = [
  {
    id: '1',
    title: 'New follower',
    message: 'Carol White started following you',
    read: false,
    timestamp: '2024-11-02T09:00:00Z',
  },
  {
    id: '2',
    title: 'Comment reply',
    message: 'Someone replied to your comment',
    read: false,
    timestamp: '2024-11-02T08:30:00Z',
  },
  {
    id: '3',
    title: 'Weekly summary',
    message: 'Your weekly engagement report is ready',
    read: true,
    timestamp: '2024-11-01T07:00:00Z',
  },
];

