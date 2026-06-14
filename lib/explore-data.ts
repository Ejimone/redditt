import type { ExploreFilterId } from "@/lib/explore-filters";
import { fetchCollection, type WithStrapiId } from "@/lib/strapi";

export type SubredditExploreRecord = {
  name?: string;
  slug?: string;
  description?: string;
  exploreCategory?: string;
  weeklyVisitors?: number;
};

const liveRequestOptions: RequestInit = { cache: "no-store" };

export async function fetchSubredditsForExploreFilter(
  filter: ExploreFilterId,
  limit: number,
): Promise<Array<SubredditExploreRecord & Partial<WithStrapiId>>> {
  if (filter === "all") {
    return fetchCollection<SubredditExploreRecord>(
      `/subreddits?sort=weeklyVisitors:desc&sort=createdAt:desc&pagination[pageSize]=${limit}`,
      liveRequestOptions,
    );
  }

  if (filter === "most_visited") {
    return fetchCollection<SubredditExploreRecord>(
      `/subreddits?sort=weeklyVisitors:desc&pagination[pageSize]=${limit}`,
      liveRequestOptions,
    );
  }

  return fetchCollection<SubredditExploreRecord>(
    `/subreddits?filters[exploreCategory][$eq]=${encodeURIComponent(
      filter,
    )}&sort=weeklyVisitors:desc&pagination[pageSize]=${limit}`,
    liveRequestOptions,
  );
}
