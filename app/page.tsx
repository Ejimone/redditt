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

async function HomeFeed({ sort }: { sort: FeedSortMode }) {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user);
  let raw: Awaited<ReturnType<typeof fetchPostRecords>>;
  try {
    raw = await fetchPostRecords(buildPostsListPath(20, undefined, sort));
  } catch (error) {
    if (isStrapiUnavailableError(error)) {
      return (
        <EmptyState
          tone="error"
          message="Backend data is temporarily unavailable. Check Strapi and API token."
        />
      );
    }
    throw error;
  }

  const posts = raw
    .map((post) => toFeedPost(post, { subredditSlug: post.subreddit?.slug }))
    .filter((post): post is NonNullable<typeof post> => post !== null)
    .filter((post) => Boolean(post.subredditSlug));

  return (
    <div className="mt-6 flex flex-col gap-4">
      {posts.length === 0 ? (
        <EmptyState message="No posts yet. Be the first to start the conversation." />
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

async function HomeContent({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: sortRaw } = await searchParams;
  const sort = normalizeFeedSort(sortRaw);

  return (
    <main className="min-w-0">
      <FeedSortPills active={sort} />

      <Suspense fallback={<EmptyState message="Loading your feed…" />}>
        <HomeFeed sort={sort} />
      </Suspense>
    </main>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  return (
    <FeedWithRightRail>
      <Suspense fallback={<EmptyState message="Loading home…" />}>
        <HomeContent searchParams={searchParams} />
      </Suspense>
    </FeedWithRightRail>
  );
}
