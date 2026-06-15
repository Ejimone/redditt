import type { FeedPost } from "./feed-post";
import type { PostRecord } from "./posts-feed";
import type { SubredditExploreRecord } from "./explore-data";

export const mockFeedPosts: FeedPost[] = [
  {
    id: 1,
    title: "Understanding Server Actions in Next.js",
    slug: "understanding-server-actions-in-next-js",
    content: "Server actions provide a powerful way to handle mutations without writing separate API routes. They run on the server and can be called directly from components.",
    score: 1240,
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
    subredditSlug: "nextjs",
    createdAt: "2023-11-01T10:00:00.000Z",
    createdAtDisplay: "Nov 01, 2023",
    timeAgo: "2 hours ago",
    commentCount: 45,
  },
  {
    id: 2,
    title: "Showoff: My new Mechanical Keyboard build",
    slug: "showoff-my-new-mechanical-keyboard-build",
    content: "Just finished building my first custom mechanical keyboard. Gateron Milky Yellows, pre-lubed, taped mod and foam added. Sounds thocky!",
    score: 890,
    thumbnail: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&q=80",
    subredditSlug: "mechanicalkeyboards",
    createdAt: "2023-11-01T08:30:00.000Z",
    createdAtDisplay: "Nov 01, 2023",
    timeAgo: "4 hours ago",
    commentCount: 128,
  },
  {
    id: 3,
    title: "Best practices for React state management in 2024?",
    slug: "best-practices-for-react-state-management-in-2024",
    content: "What is everyone using these days? Redux Toolkit, Zustand, Jotai, or just Context API? Looking for recommendations for a mid-sized e-commerce app.",
    score: 560,
    thumbnail: "",
    subredditSlug: "reactjs",
    createdAt: "2023-10-31T15:45:00.000Z",
    createdAtDisplay: "Oct 31, 2023",
    timeAgo: "1 day ago",
    commentCount: 204,
  },
];

export const mockPostRecords: PostRecord[] = [
  {
    id: 1,
    title: "Understanding Server Actions in Next.js",
    slug: "understanding-server-actions-in-next-js",
    content: "Server actions provide a powerful way to handle mutations without writing separate API routes.",
    score: 1240,
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
    createdAt: "2023-11-01T10:00:00.000Z",
    subreddit: { slug: "nextjs", exploreCategory: "programming" },
  },
  {
    id: 2,
    title: "Showoff: My new Mechanical Keyboard build",
    slug: "showoff-my-new-mechanical-keyboard-build",
    content: "Just finished building my first custom mechanical keyboard.",
    score: 890,
    thumbnail: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&q=80",
    createdAt: "2023-11-01T08:30:00.000Z",
    subreddit: { slug: "mechanicalkeyboards", exploreCategory: "technology" },
  },
];

export const mockSubreddits: SubredditExploreRecord[] = [
  {
    name: "Next.js",
    slug: "nextjs",
    description: "The official community for Next.js developers.",
    exploreCategory: "programming",
    weeklyVisitors: 125000,
  },
  {
    name: "React.js",
    slug: "reactjs",
    description: "A community for learning and developing with React.",
    exploreCategory: "programming",
    weeklyVisitors: 540000,
  },
  {
    name: "Mechanical Keyboards",
    slug: "mechanicalkeyboards",
    description: "For people who love the thock and click of custom keyboards.",
    exploreCategory: "technology",
    weeklyVisitors: 85000,
  },
  {
    name: "Cooking",
    slug: "cooking",
    description: "Share recipes, tips, and photos of your culinary creations.",
    exploreCategory: "lifestyle",
    weeklyVisitors: 300000,
  },
];
