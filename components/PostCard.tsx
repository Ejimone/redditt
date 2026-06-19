import CommunityMembershipButton from "@/components/CommunityMembershipButton";
import PostVideo from "@/components/PostVideo";
import SharePostButton from "@/components/SharePostButton";
import VoteButtons from "@/components/VoteButtons";
import type { FeedPost } from "@/lib/feed-post";
import { cloudinaryVideoPosterUrl } from "@/lib/media-video";
import { ChatCircle } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";

type PostCardProps = {
  post: FeedPost;
  subredditSlug: string;
  isAuthenticated: boolean;
  isMember?: boolean;
  priority?: boolean;
  showSubredditLink?: boolean;
};

function SubredditAvatar({ slug }: { slug: string }) {
  const letter = slug.slice(0, 1).toUpperCase();
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-600 text-xs font-bold text-white sm:size-8">
      {letter}
    </span>
  );
}

export default function PostCard({
  post,
  subredditSlug,
  isAuthenticated,
  isMember,
  priority = false,
  showSubredditLink = true,
}: PostCardProps) {
  const href = `/r/${subredditSlug}/comments/${post.slug}`;
  const meta = post.createdAtDisplay ?? post.timeAgo;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card ring-1 ring-black/5">
      <header className="flex items-start justify-between gap-2 px-3 pt-3 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SubredditAvatar slug={subredditSlug} />
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
            {showSubredditLink ? (
              <Link
                href={`/r/${subredditSlug}`}
                className="font-bold text-foreground hover:underline"
              >
                r/{subredditSlug}
              </Link>
            ) : (
              <span className="font-bold text-foreground">r/{subredditSlug}</span>
            )}
            {meta ? (
              <>
                <span aria-hidden>·</span>
                <span>{meta}</span>
              </>
            ) : null}
          </div>
        </div>
        {isAuthenticated && typeof isMember === "boolean" ? (
          <div className="shrink-0">
            <CommunityMembershipButton slug={subredditSlug} isMember={isMember} compact />
          </div>
        ) : (
          <Link
            href={`/r/${subredditSlug}`}
            className="shrink-0 rounded-full border border-[#0079d3] px-3 py-2 text-xs font-bold leading-none text-[#0079d3] transition-colors hover:bg-[#0079d3]/10 min-[360px]:px-3 min-[360px]:py-1.5"
          >
            Join
          </Link>
        )}
      </header>

      <Link href={href} className="block px-3 pt-2 sm:px-4">
        <h2 className="text-base font-bold leading-snug text-foreground hover:text-[#ff4500] sm:text-lg md:text-xl">
          {post.title}
        </h2>
      </Link>

      {post.content ? (
        <p className="line-clamp-2 px-3 pt-2 text-sm text-muted-foreground sm:px-4">
          {post.content}
        </p>
      ) : null}

      {(post.thumbnail || post.videoUrl) ? (
        <Link
          href={href}
          className="relative mt-3 block aspect-[16/10] w-full max-h-[70vh] overflow-hidden rounded-xl bg-muted sm:max-h-none"
        >
          {post.videoUrl ? (
            <PostVideo
              src={post.videoUrl}
              poster={cloudinaryVideoPosterUrl(post.videoUrl)}
              className="h-full min-h-[11rem] w-full"
            />
          ) : (
            <Image
              src={post.thumbnail}
              alt=""
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 740px"
              className="object-cover"
            />
          )}
        </Link>
      ) : null}

      <footer className="flex flex-wrap items-center gap-1 border-t border-border px-2 py-2 sm:gap-2 sm:px-3">
        <VoteButtons
          entityId={post.id}
          entityType="post"
          initialScore={post.score}
          isAuthenticated={isAuthenticated}
        />
        <Link
          href={href}
          className="inline-flex min-h-11 touch-manipulation items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted/80 sm:min-h-10"
        >
          <ChatCircle className="size-5 shrink-0" weight="bold" aria-hidden />
          {post.commentCount ?? 0} Comments
        </Link>
        <SharePostButton path={href} title={post.title} />
      </footer>
    </article>
  );
}
