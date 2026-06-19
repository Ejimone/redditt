import { toFeedPost, type FeedPost } from "@/lib/feed-post";
import { buildPostsListPath, fetchPostRecords } from "@/lib/posts-feed";
import { isStrapiUnavailableError } from "@/lib/strapi";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  try {
    const raw = await fetchPostRecords(buildPostsListPath(100, q));
    const posts = raw
      .map((post) => toFeedPost(post, { subredditSlug: post.subreddit?.slug }))
      .filter((post): post is FeedPost => post !== null)
      .filter((post) => Boolean(post.subredditSlug));

    return NextResponse.json({ posts });
  } catch (error) {
    if (isStrapiUnavailableError(error)) {
      return NextResponse.json({ posts: [] satisfies FeedPost[] });
    }
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
