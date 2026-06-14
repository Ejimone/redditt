import { fetchCollection } from "@/lib/strapi";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const communities = await fetchCollection<{ rules?: string[] }>(
      `/subreddits?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1`,
      {
        cache: "no-store",
      },
    );

    const community = communities[0];
    if (!community) {
      return NextResponse.json(
        { error: `Subreddit r/${slug} not found` },
        { status: 404 },
      );
    }

    return NextResponse.json({ rules: community.rules ?? [] });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch rules",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
