import { auth } from "@/app/auth";
import EmptyState from "@/components/EmptyState";
import FeedWithRightRail from "@/components/layout/FeedWithRightRail";
import PageHeader from "@/components/PageHeader";
import PostCard from "@/components/PostCard";
import { toFeedPost } from "@/lib/feed-post";
import {
  buildPostsListPath,
  fetchPostRecords,
} from "@/lib/posts-feed";
import { isStrapiUnavailableError } from "@/lib/strapi";
import { Suspense } from "react";

export const metadata = {
  title: "All posts | Reddit Clone",
  description: "Recent posts across every community.",
};

async function PostsResults({ query }: { query?: string }) {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user);
  let raw: Awaited<ReturnType<typeof fetchPostRecords>>;
  try {
    raw = await fetchPostRecords(buildPostsListPath(100, query));
  } catch (error) {
    if (isStrapiUnavailableError(error)) {
      return (
        <>
          <PageHeader title="All posts" />
          <EmptyState
            tone="error"
            message="Backend data is currently unavailable. Please check Strapi and try again."
          />
        </>
      );
    }
    throw error;
  }

  const posts = raw
    .map((post) =>
      toFeedPost(post, { subredditSlug: post.subreddit?.slug }),
    )
    .filter((post): post is NonNullable<typeof post> => post !== null)
    .filter((post) => Boolean(post.subredditSlug));

  return (
    <>
      <PageHeader
        title={query ? `Results for “${query}”` : "All posts"}
        description="The latest submissions across communities, newest first."
      />

      <div className="flex flex-col gap-4">
        {posts.length === 0 ? (
          <EmptyState message="No posts match. Try another search or create the first post in a community." />
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
    </>
  );
}

async function PostsContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <PostsResults query={q} />;
}

export default function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <FeedWithRightRail>
      <main>
        <Suspense
          fallback={
            <>
              <div className="mb-6 h-8 w-40 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-2/3 max-w-md animate-pulse rounded-full bg-muted/60" />
            </>
          }
        >
          <PostsContent searchParams={searchParams} />
        </Suspense>
      </main>
    </FeedWithRightRail>
  );
}
