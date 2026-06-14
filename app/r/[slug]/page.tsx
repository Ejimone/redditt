import CreatePostForm from "@/components/CreatePostForm";
import CommunityMembershipButton from "@/components/CommunityMembershipButton";
import EmptyState from "@/components/EmptyState";
import FeedWithRightRail from "@/components/layout/FeedWithRightRail";
import PageHeader from "@/components/PageHeader";
import PostCard from "@/components/PostCard";
import { auth } from "@/app/auth";
import { appendActorQuery } from "@/lib/actor";
import { fetchStrapi, type StrapiRequestError } from "@/lib/api";
import { toFeedPost } from "@/lib/feed-post";
import {
  fetchCollection,
  isStrapiUnavailableError,
} from "@/lib/strapi";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Community = {
  id?: number;
  name?: string;
  slug?: string;
  description?: string;
  rules?: string[];
  memberCount?: number;
  postCount?: number;
  isMember?: boolean;
};

type Post = {
  id?: number;
  title?: string;
  slug?: string;
  content?: string;
  score?: number;
  image?: unknown;
  thumbnail?: string;
  videoUrl?: string | null;
  createdAt?: string;
};

async function getSubredditBySlug(
  slug: string,
  actorUser?: { name?: string | null; email?: string | null },
) {
  const basePath = `/communities/${encodeURIComponent(slug)}`;
  const path = actorUser ? appendActorQuery(basePath, actorUser) : basePath;

  const response = await fetchStrapi<{ data: Community }>(path, {
    cache: "no-store",
  });

  if (!response.data) {
    const error: StrapiRequestError = new Error(
      `Subreddit r/${slug} not found`,
    );
    error.status = 404;
    throw error;
  }

  return response.data;
}

async function getPosts(slug: string) {
  const posts = await fetchCollection<Post>(
    `/communities/${encodeURIComponent(slug)}/posts?pagination[pageSize]=10`,
    {
      cache: "no-store",
    },
  );

  return posts
    .map((post) => toFeedPost(post, { subredditSlug: slug }))
    .filter((post): post is NonNullable<typeof post> => post !== null);
}

async function getTrendingSubreddits(): Promise<
  Array<{ name: string; slug: string }>
> {
  const communities = await fetchCollection<Community>(
    "/subreddits?sort=createdAt:desc&pagination[pageSize]=5",
    {
      next: { revalidate: 60 },
    },
  );

  return communities.map((community, index) => {
    return {
      name: community.name ?? community.slug ?? `community-${index + 1}`,
      slug: community.slug ?? `community-${index + 1}`,
    };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const community = await getSubredditBySlug(slug);
    const communityInfo =
      community.description ?? `Information about r/${slug}`;

    return {
      title: `r/${slug} | Reddit Clone`,
      description: communityInfo,
      openGraph: {
        title: `r/${slug} | Reddit Clone`,
        description: communityInfo,
      },
    };
  } catch {
    return {
      title: `r/${slug} | Reddit Clone`,
      description: `Information about r/${slug}`,
      openGraph: {
        title: `r/${slug} | Reddit Clone`,
        description: `Information about r/${slug}`,
      },
    };
  }
}

async function SubredditPageInner({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  let community: Community;
  let posts: Awaited<ReturnType<typeof getPosts>>;
  let trendingSubreddits: Awaited<ReturnType<typeof getTrendingSubreddits>>;

  try {
    [community, posts, trendingSubreddits] = await Promise.all([
      getSubredditBySlug(slug, session?.user),
      getPosts(slug),
      getTrendingSubreddits(),
    ]);
  } catch (error) {
    const strapiError = error as StrapiRequestError;

    if (strapiError.status === 404) {
      notFound();
    }

    if (isStrapiUnavailableError(error)) {
      return (
        <FeedWithRightRail>
          <main>
            <PageHeader title={`r/${slug}`} />
            <EmptyState
              tone="error"
              message="Backend data is currently unavailable. Please check Strapi and try again."
            />
          </main>
        </FeedWithRightRail>
      );
    }

    throw error;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <main className="min-w-0 flex-1">
        <PageHeader
          title={`r/${community.slug ?? slug}`}
          description={
            community.description ??
            "Posts and discussion in this community."
          }
        />

        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          Also trending:{" "}
          {trendingSubreddits.map((item) => `r/${item.slug}`).join(" • ")}
        </p>

        {session?.user ? (
          <>
            <CommunityMembershipButton
              slug={slug}
              isMember={Boolean(community.isMember)}
              memberCount={Math.max(0, community.memberCount ?? 0)}
            />

            {community.isMember ? (
              <CreatePostForm slug={slug} />
            ) : (
              <p className="mb-6 text-sm text-muted-foreground">
                Join this community to create a post.
              </p>
            )}
          </>
        ) : (
          <p className="mb-6 text-sm text-muted-foreground">
            Log in to post in this community.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {posts.length === 0 ? (
            <EmptyState message="No posts yet. Be the first to create one." />
          ) : null}

          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              subredditSlug={slug}
              isAuthenticated={Boolean(session?.user)}
              priority={index === 0}
              showSubredditLink={false}
            />
          ))}
        </div>
      </main>

      <aside className="hidden w-full shrink-0 lg:block lg:w-72">
        <div className="sticky top-16 rounded-2xl border border-white/10 bg-card p-4 ring-1 ring-white/5">
          <h2 className="text-sm font-bold text-foreground">
            About r/{community.slug ?? slug}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {community.description || "No description yet."}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Rules:{" "}
            {Array.isArray(community.rules) ? community.rules.length : 0}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Members: {Math.max(0, community.memberCount ?? 0).toLocaleString()}
          </p>
          <Link
            href={`/r/${slug}/rules`}
            className="mt-3 inline-block text-xs font-bold text-[#0079d3] hover:underline"
          >
            View rules
          </Link>
        </div>
      </aside>
    </div>
  );
}

export default function SubredditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl py-8">
          <EmptyState message="Loading community…" />
        </div>
      }
    >
      <SubredditPageInner params={params} />
    </Suspense>
  );
}
