import { fetchCollection } from "@/lib/strapi";

export type PostRecord = {
  id?: number;
  title?: string;
  slug?: string;
  content?: string;
  score?: number;
  image?: unknown;
  thumbnail?: string;
  videoUrl?: string | null;
  createdAt?: string;
  subreddit?: { slug?: string; exploreCategory?: string };
  comments?: unknown;
};

/** Maps to Strapi `sort` query. */
export type FeedSortMode = "best" | "new" | "top";

export function normalizeFeedSort(raw?: string | null): FeedSortMode {
  if (raw === "best") {
    return "best";
  }
  if (raw === "top") {
    return "top";
  }
  return "new";
}

export function buildPostsListPath(
  pageSize: number,
  query?: string,
  sort: FeedSortMode = "new",
  options?: { subredditExploreCategory?: string },
): string {
  const sortParam = sort === "new" ? "createdAt:desc" : "score:desc";
  const params = new URLSearchParams();
  params.set("sort", sortParam);
  params.set("pagination[pageSize]", String(pageSize));
  const q = query?.trim();
  if (q) {
    params.set("filters[title][$containsi]", q);
  }
  if (options?.subredditExploreCategory) {
    params.set(
      "filters[subreddit][exploreCategory][$eq]",
      options.subredditExploreCategory,
    );
  }
  return `/posts?${params.toString()}`;
}

export async function fetchPostRecords(path: string) {
  return fetchCollection<PostRecord>(path, {
    cache: "no-store",
  });
}
