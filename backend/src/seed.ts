import type { Core } from "@strapi/strapi";

type SeedCommunity = {
  name: string;
  slug: string;
  description: string;
  rules: string[];
  exploreCategory:
    | "general"
    | "technology"
    | "games"
    | "internet_culture"
    | "humanities_law"
    | "news_politics";
  weeklyVisitors: number;
};

const seedCommunities: SeedCommunity[] = [
  {
    name: "Next.js",
    slug: "nextjs",
    description: "News, tips, and deep dives about shipping apps with Next.js.",
    rules: ["Keep it Next.js related", "No spam", "Use descriptive titles"],
    exploreCategory: "technology",
    weeklyVisitors: 2_100_000,
  },
  {
    name: "Strapi",
    slug: "strapi",
    description:
      "Headless CMS discussions, modeling tips, and integration guides.",
    rules: [
      "Share practical examples",
      "No self-promo without context",
      "Be respectful",
    ],
    exploreCategory: "technology",
    weeklyVisitors: 890_000,
  },
  {
    name: "TypeScript",
    slug: "typescript",
    description: "Type-safe patterns for frontend and backend engineering.",
    rules: [
      "Include TS snippets when helpful",
      "No language wars",
      "Explain tradeoffs clearly",
    ],
    exploreCategory: "technology",
    weeklyVisitors: 3_400_000,
  },
];

export async function seedDatabase(strapi: Core.Strapi) {
  const subredditQuery = strapi.db.query("api::subreddit.subreddit");
  const postQuery = strapi.db.query("api::post.post");
  const commentQuery = strapi.db.query("api::comment.comment");

  const subredditCount = await subredditQuery.count();
  if (subredditCount > 1000) { // force seed
    return;
  }

  const subredditBySlug = new Map<string, { id: number }>();

  for (const community of seedCommunities) {
    const exists = await subredditQuery.findOne({ where: { slug: community.slug } });
    if (!exists) {
      const created = await subredditQuery.create({
        data: {
          name: community.name,
          slug: community.slug,
          description: community.description,
          rules: community.rules,
          exploreCategory: community.exploreCategory,
          weeklyVisitors: community.weeklyVisitors,
        },
      });
      subredditBySlug.set(community.slug, { id: created.id });
    } else {
      subredditBySlug.set(community.slug, { id: exists.id });
    }
  }

  const categories = ["general", "technology", "games", "internet_culture", "humanities_law", "news_politics"] as const;
  const baseNames = [
    "webdev", "javascript", "movies", "books", "gaming", "pcgaming", "politics", "worldnews", "funny", "aww",
    "todayilearned", "science", "space", "gadgets", "sports", "askscience", "explainlikeimfive", "dataisbeautiful",
    "futurology", "history", "philosophy", "economics", "personalfinance", "investing", "cryptocurrency", "bitcoin",
    "ethereum", "stocks", "wallstreetbets", "cscareerquestions", "learnprogramming", "programmerhumor", "apple",
    "android", "google", "microsoft", "linux", "ubuntu", "networking", "sysadmin", "homelab", "docker",
    "kubernetes", "aws", "azure", "gcp", "reactjs", "vuejs", "angular", "svelte", "sveltekit", "nuxtjs",
    "tailwindcss", "css", "html", "php", "python", "django", "flask", "fastapi", "ruby", "rails", "laravel", "go",
    "rust", "golang", "java", "spring", "csharp", "dotnet", "cpp", "swift", "kotlin", "scala", "dart"
  ];

  for (let i = 0; i < baseNames.length; i++) {
    const name = baseNames[i];
    const exists = await subredditQuery.findOne({ where: { slug: name } });
    if (!exists) {
      const created = await subredditQuery.create({
        data: {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          slug: name,
          description: `The official community for ${name} discussions.`,
          rules: ["Be respectful", "Stay on topic", "No spam"],
          exploreCategory: categories[i % categories.length],
          weeklyVisitors: Math.floor(Math.random() * 5000000) + 1000,
        },
      });
      subredditBySlug.set(name, { id: created.id });
    } else {
      subredditBySlug.set(name, { id: exists.id });
    }
  }

  const postAdjectives = ["Awesome", "Terrible", "Interesting", "Weird", "Breaking", "New", "Help needed:", "Showoff:"];
  const postNouns = ["Release", "Update", "Feature", "Bug", "Question", "Discussion", "Tutorial", "Guide", "Thoughts"];
  const authors = ["cool_dev", "reddit_user", "anon123", "tech_guru", "newbie", "mod_team"];

  const seededPosts = [
  {
    "title": "Looking for open source projects to contribute to.",
    "slug": "post-0",
    "content": "It used to be so straightforward, but now everything is hidden behind three layers of abstraction and confusing terminology.",
    "subredditSlug": "typescript",
    "score": 134
  },
  {
    "title": "This simple change improved our performance by 400%.",
    "slug": "post-1",
    "content": "After struggling with this for weeks, everything finally clicked. I wrote this guide to help beginners navigate the complex parts.",
    "subredditSlug": "aws",
    "score": 474
  },
  {
    "title": "What's your favorite underrated library right now?",
    "slug": "post-2",
    "content": "I realized I wasn't going to monetize these properly, so they are now fully MIT licensed. Feel free to use the code.",
    "subredditSlug": "strapi",
    "score": 175
  },
  {
    "title": "Just achieved a huge milestone today!",
    "slug": "post-3",
    "content": "Failure hurts, but I wanted to write down the post-mortem so others don't make the exact same mistakes I did.",
    "subredditSlug": "css",
    "score": 483
  },
  {
    "title": "What are the best practices for handling authentication here?",
    "slug": "post-4",
    "content": "Should we use cookies, local storage, or JWTs? Which library is the industry standard for this right now?",
    "subredditSlug": "nextjs",
    "score": 286
  },
  {
    "title": "Looking for advice on architecture for a large scale app.",
    "slug": "post-5",
    "content": "I've read through every StackOverflow thread and GitHub issue. Has anyone encountered this specific edge case before?",
    "subredditSlug": "docker",
    "score": 26
  },
  {
    "title": "Is it worth upgrading to the latest version yet?",
    "slug": "post-6",
    "content": "I would love to get your thoughts and feedback on this. I've been working on it for a while and feel like it's finally ready for the world.",
    "subredditSlug": "python",
    "score": 118
  },
  {
    "title": "Just launched my latest side project, what do you think?",
    "slug": "post-7",
    "content": "It used to be so straightforward, but now everything is hidden behind three layers of abstraction and confusing terminology.",
    "subredditSlug": "docker",
    "score": 327
  },
  {
    "title": "Unpopular opinion: the old way was better.",
    "slug": "post-8",
    "content": "I would love to get your thoughts and feedback on this. I've been working on it for a while and feel like it's finally ready for the world.",
    "subredditSlug": "reactjs",
    "score": 270
  },
  {
    "title": "Looking for advice on architecture for a large scale app.",
    "slug": "post-9",
    "content": "I want to tap into the new features, but I've heard the migration path is full of breaking changes.",
    "subredditSlug": "css",
    "score": 485
  },
  {
    "title": "This simple change improved our performance by 400%.",
    "slug": "post-10",
    "content": "I stumbled across it on GitHub with only 200 stars. It solved a massive headache for us. Highly recommend looking into it.",
    "subredditSlug": "css",
    "score": 404
  },
  {
    "title": "Just launched my latest side project, what do you think?",
    "slug": "post-11",
    "content": "By simply lazy-loading the components below the fold, our Time to Interactive plummeted. Highly recommended optimization.",
    "subredditSlug": "aws",
    "score": 53
  },
  {
    "title": "What are the best practices for handling authentication here?",
    "slug": "post-12",
    "content": "We are anticipating a huge spike in traffic next month and our current monolithic setup probably won't hold up. Suggestions?",
    "subredditSlug": "python",
    "score": 349
  },
  {
    "title": "Does anyone else hate the new documentation?",
    "slug": "post-13",
    "content": "The official docs are kind of sparse, so I created a minimal reproducible example to demonstrate exactly how the caching layer works.",
    "subredditSlug": "javascript",
    "score": 178
  },
  {
    "title": "Just launched my latest side project, what do you think?",
    "slug": "post-14",
    "content": "We are anticipating a huge spike in traffic next month and our current monolithic setup probably won't hold up. Suggestions?",
    "subredditSlug": "nextjs",
    "score": 469
  },
  {
    "title": "I spent 6 months building this tool and it failed. Here's what I learned.",
    "slug": "post-15",
    "content": "I compiled all the docs, videos, and articles that actually made sense. Bookmark this if you are currently learning in this space.",
    "subredditSlug": "javascript",
    "score": 224
  },
  {
    "title": "Looking for open source projects to contribute to.",
    "slug": "post-16",
    "content": "Should we use cookies, local storage, or JWTs? Which library is the industry standard for this right now?",
    "subredditSlug": "aws",
    "score": 116
  },
  {
    "title": "Looking for advice on architecture for a large scale app.",
    "slug": "post-17",
    "content": "I have been grinding LeetCode but I always freeze up when doing system design. Any proven frameworks for structuring my answers?",
    "subredditSlug": "strapi",
    "score": 213
  },
  {
    "title": "Can we stop pretending this feature is actually useful?",
    "slug": "post-18",
    "content": "By simply lazy-loading the components below the fold, our Time to Interactive plummeted. Highly recommended optimization.",
    "subredditSlug": "nextjs",
    "score": 344
  },
  {
    "title": "I finally understood how to optimize my queries properly.",
    "slug": "post-19",
    "content": "It used to be so straightforward, but now everything is hidden behind three layers of abstraction and confusing terminology.",
    "subredditSlug": "html",
    "score": 401
  },
  {
    "title": "Just achieved a huge milestone today!",
    "slug": "post-20",
    "content": "I've been coding 12 hours a day and the passion is completely gone. How do you guys unplug and reset your mental state?",
    "subredditSlug": "docker",
    "score": 397
  },
  {
    "title": "Here is a curated list of resources I found helpful.",
    "slug": "post-21",
    "content": "I want to tap into the new features, but I've heard the migration path is full of breaking changes.",
    "subredditSlug": "typescript",
    "score": 62
  },
  {
    "title": "This simple change improved our performance by 400%.",
    "slug": "post-22",
    "content": "We migrated our entire codebase to the new paradigm and honestly, I wish we hadn't. Everything is more complicated now.",
    "subredditSlug": "typescript",
    "score": 497
  },
  {
    "title": "What are the best practices for handling authentication here?",
    "slug": "post-23",
    "content": "I stumbled across it on GitHub with only 200 stars. It solved a massive headache for us. Highly recommend looking into it.",
    "subredditSlug": "aws",
    "score": 167
  },
  {
    "title": "Can we stop pretending this feature is actually useful?",
    "slug": "post-24",
    "content": "I am a mid-level developer looking to give back, what are some active repositories looking for help with issue triage and minor bugs?",
    "subredditSlug": "typescript",
    "score": 484
  },
  {
    "title": "Here is a curated list of resources I found helpful.",
    "slug": "post-25",
    "content": "We are anticipating a huge spike in traffic next month and our current monolithic setup probably won't hold up. Suggestions?",
    "subredditSlug": "javascript",
    "score": 258
  },
  {
    "title": "Can we stop pretending this feature is actually useful?",
    "slug": "post-26",
    "content": "It feels like overnight there's this massive hype train. Is it justified, or just another fad?",
    "subredditSlug": "aws",
    "score": 473
  },
  {
    "title": "What's your favorite underrated library right now?",
    "slug": "post-27",
    "content": "After struggling with this for weeks, everything finally clicked. I wrote this guide to help beginners navigate the complex parts.",
    "subredditSlug": "nextjs",
    "score": 474
  },
  {
    "title": "Does anyone else hate the new documentation?",
    "slug": "post-28",
    "content": "The official docs are kind of sparse, so I created a minimal reproducible example to demonstrate exactly how the caching layer works.",
    "subredditSlug": "nextjs",
    "score": 396
  },
  {
    "title": "A comprehensive guide to understanding advanced concepts.",
    "slug": "post-29",
    "content": "Failure hurts, but I wanted to write down the post-mortem so others don't make the exact same mistakes I did.",
    "subredditSlug": "reactjs",
    "score": 331
  },
  {
    "title": "Looking for open source projects to contribute to.",
    "slug": "post-30",
    "content": "I realized I wasn't going to monetize these properly, so they are now fully MIT licensed. Feel free to use the code.",
    "subredditSlug": "python",
    "score": 259
  },
  {
    "title": "Why is everybody suddenly talking about this new framework?",
    "slug": "post-31",
    "content": "Failure hurts, but I wanted to write down the post-mortem so others don't make the exact same mistakes I did.",
    "subredditSlug": "reactjs",
    "score": 270
  },
  {
    "title": "I finally understood how to optimize my queries properly.",
    "slug": "post-32",
    "content": "Just passed 10k MRR and I wanted to walk through my journey of getting my first 100 customers without spending a dime on marketing.",
    "subredditSlug": "javascript",
    "score": 208
  },
  {
    "title": "A comprehensive guide to understanding advanced concepts.",
    "slug": "post-33",
    "content": "I have been grinding LeetCode but I always freeze up when doing system design. Any proven frameworks for structuring my answers?",
    "subredditSlug": "nextjs",
    "score": 64
  },
  {
    "title": "Here is a curated list of resources I found helpful.",
    "slug": "post-34",
    "content": "I am a mid-level developer looking to give back, what are some active repositories looking for help with issue triage and minor bugs?",
    "subredditSlug": "strapi",
    "score": 121
  },
  {
    "title": "Can we stop pretending this feature is actually useful?",
    "slug": "post-35",
    "content": "We migrated our entire codebase to the new paradigm and honestly, I wish we hadn't. Everything is more complicated now.",
    "subredditSlug": "javascript",
    "score": 442
  },
  {
    "title": "What are the best practices for handling authentication here?",
    "slug": "post-36",
    "content": "I am a mid-level developer looking to give back, what are some active repositories looking for help with issue triage and minor bugs?",
    "subredditSlug": "html",
    "score": 261
  },
  {
    "title": "Just launched my latest side project, what do you think?",
    "slug": "post-37",
    "content": "Seriously, the DX is terrible and it introduces more problems than it solves. Just use the standard native tooling instead.",
    "subredditSlug": "typescript",
    "score": 51
  },
  {
    "title": "Looking for open source projects to contribute to.",
    "slug": "post-38",
    "content": "It feels like overnight there's this massive hype train. Is it justified, or just another fad?",
    "subredditSlug": "css",
    "score": 259
  },
  {
    "title": "Does anyone else hate the new documentation?",
    "slug": "post-39",
    "content": "I realized I wasn't going to monetize these properly, so they are now fully MIT licensed. Feel free to use the code.",
    "subredditSlug": "docker",
    "score": 104
  },
  {
    "title": "Looking for advice on architecture for a large scale app.",
    "slug": "post-40",
    "content": "The official docs are kind of sparse, so I created a minimal reproducible example to demonstrate exactly how the caching layer works.",
    "subredditSlug": "python",
    "score": 453
  },
  {
    "title": "How do you deal with burnout as a developer?",
    "slug": "post-41",
    "content": "It feels like overnight there's this massive hype train. Is it justified, or just another fad?",
    "subredditSlug": "html",
    "score": 45
  },
  {
    "title": "Can we stop pretending this feature is actually useful?",
    "slug": "post-42",
    "content": "Just passed 10k MRR and I wanted to walk through my journey of getting my first 100 customers without spending a dime on marketing.",
    "subredditSlug": "strapi",
    "score": 467
  },
  {
    "title": "I spent 6 months building this tool and it failed. Here's what I learned.",
    "slug": "post-43",
    "content": "After struggling with this for weeks, everything finally clicked. I wrote this guide to help beginners navigate the complex parts.",
    "subredditSlug": "html",
    "score": 270
  },
  {
    "title": "Unpopular opinion: the old way was better.",
    "slug": "post-44",
    "content": "We migrated our entire codebase to the new paradigm and honestly, I wish we hadn't. Everything is more complicated now.",
    "subredditSlug": "javascript",
    "score": 218
  },
  {
    "title": "What are the best practices for handling authentication here?",
    "slug": "post-45",
    "content": "It used to be so straightforward, but now everything is hidden behind three layers of abstraction and confusing terminology.",
    "subredditSlug": "python",
    "score": 136
  },
  {
    "title": "This simple change improved our performance by 400%.",
    "slug": "post-46",
    "content": "I've been coding 12 hours a day and the passion is completely gone. How do you guys unplug and reset your mental state?",
    "subredditSlug": "strapi",
    "score": 161
  },
  {
    "title": "Any tips for passing the technical interview?",
    "slug": "post-47",
    "content": "I want to tap into the new features, but I've heard the migration path is full of breaking changes.",
    "subredditSlug": "html",
    "score": 251
  },
  {
    "title": "I finally understood how to optimize my queries properly.",
    "slug": "post-48",
    "content": "We migrated our entire codebase to the new paradigm and honestly, I wish we hadn't. Everything is more complicated now.",
    "subredditSlug": "html",
    "score": 48
  },
  {
    "title": "A comprehensive guide to understanding advanced concepts.",
    "slug": "post-49",
    "content": "It feels like overnight there's this massive hype train. Is it justified, or just another fad?",
    "subredditSlug": "html",
    "score": 303
  },
  {
    "title": "Looking for open source projects to contribute to.",
    "slug": "post-50",
    "content": "I am a mid-level developer looking to give back, what are some active repositories looking for help with issue triage and minor bugs?",
    "subredditSlug": "docker",
    "score": 436
  },
  {
    "title": "Looking for open source projects to contribute to.",
    "slug": "post-51",
    "content": "I am a mid-level developer looking to give back, what are some active repositories looking for help with issue triage and minor bugs?",
    "subredditSlug": "typescript",
    "score": 178
  },
  {
    "title": "A comprehensive guide to understanding advanced concepts.",
    "slug": "post-52",
    "content": "I want to tap into the new features, but I've heard the migration path is full of breaking changes.",
    "subredditSlug": "reactjs",
    "score": 327
  },
  {
    "title": "Here is a curated list of resources I found helpful.",
    "slug": "post-53",
    "content": "The official docs are kind of sparse, so I created a minimal reproducible example to demonstrate exactly how the caching layer works.",
    "subredditSlug": "strapi",
    "score": 466
  },
  {
    "title": "Looking for advice on architecture for a large scale app.",
    "slug": "post-54",
    "content": "After struggling with this for weeks, everything finally clicked. I wrote this guide to help beginners navigate the complex parts.",
    "subredditSlug": "nextjs",
    "score": 235
  },
  {
    "title": "Is it worth upgrading to the latest version yet?",
    "slug": "post-55",
    "content": "Just passed 10k MRR and I wanted to walk through my journey of getting my first 100 customers without spending a dime on marketing.",
    "subredditSlug": "reactjs",
    "score": 413
  },
  {
    "title": "I finally understood how to optimize my queries properly.",
    "slug": "post-56",
    "content": "By simply lazy-loading the components below the fold, our Time to Interactive plummeted. Highly recommended optimization.",
    "subredditSlug": "typescript",
    "score": 158
  },
  {
    "title": "Can we stop pretending this feature is actually useful?",
    "slug": "post-57",
    "content": "I am a mid-level developer looking to give back, what are some active repositories looking for help with issue triage and minor bugs?",
    "subredditSlug": "css",
    "score": 18
  },
  {
    "title": "How do you deal with burnout as a developer?",
    "slug": "post-58",
    "content": "By simply lazy-loading the components below the fold, our Time to Interactive plummeted. Highly recommended optimization.",
    "subredditSlug": "docker",
    "score": 219
  },
  {
    "title": "Unpopular opinion: the old way was better.",
    "slug": "post-59",
    "content": "Seriously, the DX is terrible and it introduces more problems than it solves. Just use the standard native tooling instead.",
    "subredditSlug": "docker",
    "score": 477
  },
  {
    "title": "I spent 6 months building this tool and it failed. Here's what I learned.",
    "slug": "post-60",
    "content": "I have been grinding LeetCode but I always freeze up when doing system design. Any proven frameworks for structuring my answers?",
    "subredditSlug": "nextjs",
    "score": 143
  },
  {
    "title": "Is it worth upgrading to the latest version yet?",
    "slug": "post-61",
    "content": "It feels like overnight there's this massive hype train. Is it justified, or just another fad?",
    "subredditSlug": "python",
    "score": 113
  },
  {
    "title": "This simple change improved our performance by 400%.",
    "slug": "post-62",
    "content": "It feels like overnight there's this massive hype train. Is it justified, or just another fad?",
    "subredditSlug": "docker",
    "score": 116
  },
  {
    "title": "Just launched my latest side project, what do you think?",
    "slug": "post-63",
    "content": "Seriously, the DX is terrible and it introduces more problems than it solves. Just use the standard native tooling instead.",
    "subredditSlug": "docker",
    "score": 298
  },
  {
    "title": "Just launched my latest side project, what do you think?",
    "slug": "post-64",
    "content": "We migrated our entire codebase to the new paradigm and honestly, I wish we hadn't. Everything is more complicated now.",
    "subredditSlug": "strapi",
    "score": 165
  }
];

  for (const post of seededPosts) {
    const subreddit = subredditBySlug.get(post.subredditSlug);
    if (!subreddit) {
      continue;
    }

    const createdPost = await postQuery.create({
      data: {
        title: post.title,
        slug: post.slug,
        content: post.content,
        authorName: "seed-bot",
        score: post.score,
        subreddit: subreddit.id,
      },
    });

    await commentQuery.create({
      data: {
        content: "Great thread. Looking forward to more examples.",
        authorName: "community-mod",
        score: 4,
        post: createdPost.id,
      },
    });
  }

  strapi.log.info("Seeded mass amount of subreddit, post, and comment data.");
}