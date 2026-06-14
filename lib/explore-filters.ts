export const EXPLORE_FILTER_IDS = [
  "all",
  "most_visited",
  "internet_culture",
  "games",
  "technology",
  "humanities_law",
  "news_politics",
] as const;

export type ExploreFilterId = (typeof EXPLORE_FILTER_IDS)[number];

const VALID = new Set<string>(EXPLORE_FILTER_IDS);

export function normalizeExploreFilter(raw?: string | null): ExploreFilterId {
  if (raw && VALID.has(raw)) {
    return raw as ExploreFilterId;
  }
  return "all";
}

export const EXPLORE_PILL_LABELS: Record<ExploreFilterId, string> = {
  all: "All",
  most_visited: "Most visited",
  internet_culture: "Internet culture",
  games: "Games",
  technology: "Technology",
  humanities_law: "Humanities & Law",
  news_politics: "News & Politics",
};
