import { auth } from "@/app/auth";
import EmptyState from "@/components/EmptyState";
import FeedSortPills from "@/components/FeedSortPills";
import FeedWithRightRail from "@/components/layout/FeedWithRightRail";
import PostCard from "@/components/PostCard";
import { toFeedPost } from "@/lib/feed-post";
import {
  buildPostsListPath,
  fetchPostRecords,
  normalizeFeedSort,
  type FeedSortMode,
} from "@/lib/posts-feed";
import { isStrapiUnavailableError } from "@/lib/strapi";
import { Suspense } from "react";

export const metadata = {
  title: "News",
  description: "Posts from News & Politics communities.",
};

async function NewsFeed({ sort }: { sort: FeedSortMode }) {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user);
  let raw: Awaited<ReturnType<typeof fetchPostRecords>>;
  try {
    raw = await fetchPostRecords(
      buildPostsListPath(100, undefined, sort, { subredditExploreCategory: "news_politics" }),
    );
  } catch (error) {
    if (isStrapiUnavailableError(error)) {
      return (
        <EmptyState
          tone="error"
          message="Backend data is temporarily unavailable. Check Strapi and API token."
        />
      );
    }

    return (
      <EmptyState
        tone="error"
        message="Could not load News right now. Please reload and try again."
      />
    );
  }

  const posts = raw
    .map((post) =>
      toFeedPost(post, { subredditSlug: post.subreddit?.slug }),
    )
    .filter((post): post is NonNullable<typeof post> => post !== null)
    .filter((post) => Boolean(post.subredditSlug));

  return (
    <div className="mt-6 flex flex-col gap-4">
      {posts.length === 0 ? (
        <EmptyState message="No news posts yet. Create a community in News & Politics and post something." />
      ) : null}

      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          subredditSlug={post.subredditSlug!}
          isAuthenticated={isAuthenticated}
          priority={index === 0}
          showSubredditLink
        />
      ))}
    </div>
  );
}

async function NewsContent({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: sortRaw } = await searchParams;
  const sort = normalizeFeedSort(sortRaw);

  return (
    <main className="min-w-0">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        News
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Posts from communities tagged News &amp; Politics.
      </p>

      <FeedSortPills active={sort} basePath="/news" />

      <Suspense fallback={<EmptyState message="Loading news…" />}>
        <NewsFeed sort={sort} />
      </Suspense>
    </main>
  );
}

export default function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  return (
    <FeedWithRightRail>
      <Suspense fallback={<EmptyState message="Loading news…" />}>
        <NewsContent searchParams={searchParams} />
      </Suspense>
    </FeedWithRightRail>
  );
}
