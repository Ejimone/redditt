import { cloudinaryVideoPosterUrl } from "@/lib/media-video";
import { extractMediaUrl, extractRelationArray } from "@/lib/strapi";

export type FeedPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  score: number;
  thumbnail: string;
  /** HTTPS URL from Cloudinary (or other) when the post is a video. */
  videoUrl?: string;
  subredditSlug?: string;
  /** ISO timestamp from the API, if present */
  createdAt?: string;
  /** Stable display string (UTC, en-US) for SSR without hydration mismatch */
  createdAtDisplay?: string;
  /** Relative label for card meta (computed on server per request) */
  timeAgo?: string;
  commentCount?: number;
};

type PostLike = {
  id?: number;
  title?: string;
  slug?: string;
  content?: string;
  score?: number;
  image?: unknown;
  thumbnail?: string;
  videoUrl?: string | null;
  createdAt?: string;
  subreddit?: { slug?: string };
  comments?: unknown;
};

export function fallbackThumbnail(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/200/300`;
}

function formatCreatedAtDisplay(iso?: string): string | undefined {
  if (!iso) {
    return undefined;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return undefined;
  }
  return d.toLocaleString("en-US", {
    timeZone: "UTC",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatTimeAgo(iso?: string): string | undefined {
  if (!iso) {
    return undefined;
  }
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) {
    return undefined;
  }
  const sec = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (sec < 45) {
    return "just now";
  }
  const min = Math.floor(sec / 60);
  if (min < 60) {
    return `${min} min. ago`;
  }
  const hr = Math.floor(min / 60);
  if (hr < 24) {
    return `${hr} hr. ago`;
  }
  const day = Math.floor(hr / 24);
  if (day < 7) {
    return `${day} day${day === 1 ? "" : "s"} ago`;
  }
  return formatCreatedAtDisplay(iso);
}

export function toFeedPost(
  post: PostLike,
  options: { subredditSlug?: string } = {},
): FeedPost | null {
  if (!Number.isInteger(post.id)) {
    return null;
  }

  const id = post.id as number;
  const postSlug = post.slug || `post-${id}`;
  const videoRaw = post.videoUrl?.trim();
  const videoUrl = videoRaw || undefined;
  const mediaUrl = extractMediaUrl(post.image ?? post.thumbnail);
  const posterFromVideo = videoUrl ? cloudinaryVideoPosterUrl(videoUrl) : undefined;
  const thumbnail =
    mediaUrl ?? posterFromVideo ?? fallbackThumbnail(postSlug);
  const subredditSlug =
    options.subredditSlug ?? post.subreddit?.slug ?? undefined;

  const commentCount = extractRelationArray(
    post.comments ?? [],
  ).length;

  return {
    id,
    title: post.title ?? "Untitled post",
    slug: postSlug,
    content: post.content ?? "",
    score: post.score ?? 0,
    thumbnail,
    videoUrl,
    subredditSlug,
    createdAt: post.createdAt,
    createdAtDisplay: formatCreatedAtDisplay(post.createdAt),
    timeAgo: formatTimeAgo(post.createdAt),
    commentCount,
  };
}
