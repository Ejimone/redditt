import CreateCommentForm from "@/components/CreateCommentForm";
import CommentCard from "@/components/CommentCard";
import CommunityMembershipButton from "@/components/CommunityMembershipButton";
import PostVideo from "@/components/PostVideo";
import SharePostButton from "@/components/SharePostButton";
import { auth } from "@/app/auth";
import VoteButtons from "@/components/VoteButtons";
import { appendActorQuery } from "@/lib/actor";
import { fallbackThumbnail } from "@/lib/feed-post";
import { fetchStrapi } from "@/lib/api";
import { cloudinaryVideoPosterUrl } from "@/lib/media-video";
import {
  extractMediaUrl,
  extractRelationArray,
  extractRelationOne,
  fetchCollection,
  unwrapStrapiEntity,
} from "@/lib/strapi";
import Image from "next/image";
import { notFound } from "next/navigation";

type Comment = {
  id: number;
  content: string;
  authorName: string;
  score: number;
  replies: Comment[];
};

type Post = {
  id: number;
  title: string;
  body: string;
  score: number;
  slug: string;
  comments: Comment[];
  videoUrl?: string;
  imageUrl: string;
};

type PostRecord = {
  title?: string;
  content?: string;
  score?: number;
  slug?: string;
  comments?: unknown;
  videoUrl?: string | null;
  image?: unknown;
};

type CommentRecord = {
  id?: number;
  content?: string;
  authorName?: string;
  score?: number;
  parent?: unknown;
};

function buildCommentTree(
  flatComments: Array<{
    id: number;
    content: string;
    authorName: string;
    score: number;
    parentId: number | null;
  }>,
): Comment[] {
  const byId = new Map<number, Comment>(
    flatComments.map((comment) => [
      comment.id,
      { ...comment, replies: [] },
    ]),
  );

  const roots: Comment[] = [];

  for (const comment of flatComments) {
    const node = byId.get(comment.id);
    if (!node) {
      continue;
    }

    const parent = comment.parentId ? byId.get(comment.parentId) : undefined;
    if (parent) {
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

type MembershipRecord = {
  isMember?: boolean;
  memberCount?: number;
};

async function getPost(slug: string, postSlug: string): Promise<Post | null> {
  const params = new URLSearchParams();
  params.set("filters[slug][$eq]", postSlug);
  params.set("filters[subreddit][slug][$eq]", slug);
  params.set("pagination[pageSize]", "1");
  params.set("populate[comments]", "*");
  params.set("populate[image]", "*");

  const posts = await fetchCollection<PostRecord>(`/posts?${params.toString()}`, {
    cache: "no-store",
  });

  const post = posts[0];
  if (!post?.id) {
    return null;
  }

  const slugForThumb = post.slug ?? postSlug;
  const videoRaw = post.videoUrl?.trim();
  const videoUrl = videoRaw || undefined;
  const imageUrl =
    extractMediaUrl(post.image) ??
    (videoUrl ? cloudinaryVideoPosterUrl(videoUrl) : null) ??
    fallbackThumbnail(slugForThumb);

  const flatComments = extractRelationArray<CommentRecord>(post.comments)
    .map((commentEntity) => unwrapStrapiEntity(commentEntity))
    .filter((comment) => comment.content !== undefined)
    .map((comment) => ({
      id: comment.id ?? 0,
      content: comment.content ?? "",
      authorName: comment.authorName ?? "anonymous",
      score: comment.score ?? 0,
      parentId: extractRelationOne<{ id?: number }>(comment.parent)?.id ?? null,
    }));

  const comments = buildCommentTree(flatComments);

  return {
    id: post.id,
    title: post.title ?? "Untitled post",
    body: post.content ?? "",
    score: post.score ?? 0,
    slug: post.slug ?? postSlug,
    comments,
    videoUrl,
    imageUrl,
  };
}

async function getMembership(
  slug: string,
  actorUser: { name?: string | null; email?: string | null },
): Promise<MembershipRecord> {
  const path = appendActorQuery(
    `/communities/${encodeURIComponent(slug)}/membership`,
    actorUser,
  );

  const response = await fetchStrapi<{ data: MembershipRecord }>(path, {
    cache: "no-store",
  });

  return response.data ?? {};
}

export default async function PostCommentsContent({
  slug,
  postId,
}: {
  slug: string;
  postId: string;
}) {
  const session = await auth();

  const [post, membership] = await Promise.all([
    getPost(slug, postId),
    session?.user ? getMembership(slug, session.user) : Promise.resolve(null),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <>
      <h1 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
        r/{slug}
      </h1>

      <article className="rounded-2xl border border-white/10 bg-card p-4 ring-1 ring-white/5 sm:p-6">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          {post.title}
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
          {post.body}
        </p>

        <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
          {post.videoUrl ? (
            <PostVideo
              src={post.videoUrl}
              poster={cloudinaryVideoPosterUrl(post.videoUrl)}
              className="h-full w-full"
            />
          ) : (
            <Image
              src={post.imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 740px"
            />
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <VoteButtons
            entityId={post.id}
            entityType="post"
            initialScore={post.score}
            isAuthenticated={Boolean(session?.user)}
          />
          <SharePostButton
            path={`/r/${slug}/comments/${post.slug}`}
            title={post.title}
          />
        </div>
      </article>

      {session?.user ? (
        membership?.isMember ? (
          <CreateCommentForm
            postId={post.id}
            postSlug={post.slug}
            subredditSlug={slug}
          />
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Join this community to leave a comment.
            </p>
            <CommunityMembershipButton
              slug={slug}
              isMember={false}
              memberCount={Math.max(0, membership?.memberCount ?? 0)}
            />
          </div>
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          Sign in to leave a comment.
        </p>
      )}

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Comments</h3>

        {post.comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : null}

        {post.comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            isAuthenticated={Boolean(session?.user)}
            isMember={Boolean(membership?.isMember)}
            postId={post.id}
            postSlug={post.slug}
            subredditSlug={slug}
          />
        ))}
      </section>
    </>
  );
}
