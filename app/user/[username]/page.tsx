import FeedWithRightRail from "@/components/layout/FeedWithRightRail";
import { fetchCollection } from "@/lib/strapi";
import Link from "next/link";
import { Suspense } from "react";

type Post = {
  id: number;
  title?: string;
  slug?: string;
  authorName?: string;
  subreddit?: {
    slug?: string;
  };
};

async function getUserPosts(username: string) {
  return fetchCollection<Post>(
    `/posts?filters[authorName][$containsi]=${encodeURIComponent(username)}&sort=createdAt:desc&pagination[pageSize]=10`,
    {
      cache: "no-store",
    },
  );
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  return (
    <FeedWithRightRail>
      <Suspense
        fallback={
          <main className="rounded-2xl border border-white/10 bg-card p-6 ring-1 ring-white/5">
            <p className="text-muted-foreground">Loading user profile…</p>
          </main>
        }
      >
        <UserProfileContent params={params} />
      </Suspense>
    </FeedWithRightRail>
  );
}

async function UserProfileContent({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const posts = await getUserPosts(username);

  const displayName = posts[0]?.authorName || username;

  return (
    <main className="rounded-2xl border border-white/10 bg-card p-4 ring-1 ring-white/5 sm:p-6 md:p-10">
      <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-bold text-foreground sm:h-16 sm:w-16 sm:text-xl">
          {displayName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="break-words text-xl font-bold text-foreground sm:text-2xl">
            u/{displayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Public profile · {posts.length} post{posts.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <p className="mb-4 leading-relaxed text-muted-foreground">
        Posts and activity loaded from the community backend.
      </p>

      <ul className="space-y-2 border-t pt-4">
        {posts.length === 0 ? (
          <li className="text-sm text-muted-foreground">No posts found yet.</li>
        ) : null}

        {posts.map((post) => (
          <li key={post.id} className="text-sm">
            <Link
              href={`/r/${post.subreddit?.slug ?? ""}/comments/${post.slug ?? ""}`}
              className="font-semibold text-[#ff4500] hover:underline"
            >
              {post.title ?? "Untitled"}
            </Link>
          </li>
        ))}
      </ul>

    </main>
  );
}
