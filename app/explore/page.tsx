import EmptyState from "@/components/EmptyState";
import ExploreCategoryPills from "@/components/ExploreCategoryPills";
import ExploreCommunityCard from "@/components/ExploreCommunityCard";
import FeedWithRightRail from "@/components/layout/FeedWithRightRail";
import {
  fetchSubredditsForExploreFilter,
  type SubredditExploreRecord,
} from "@/lib/explore-data";
import {
  EXPLORE_PILL_LABELS,
  normalizeExploreFilter,
  type ExploreFilterId,
} from "@/lib/explore-filters";
import { isStrapiUnavailableError, type WithStrapiId } from "@/lib/strapi";
import { Suspense } from "react";

export const metadata = {
  title: "Explore communities",
  description: "Discover communities by topic on Reddit clone.",
};

function ExploreGrid({
  items,
}: {
  items: Array<SubredditExploreRecord & Partial<WithStrapiId>>;
}) {
  if (items.length === 0) {
    return (
      <EmptyState message="No communities match this filter yet. Create one from the home page." />
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s) => {
        const slug = s.slug?.trim();
        if (!slug) {
          return null;
        }
        return (
          <ExploreCommunityCard
            key={s.id ?? slug}
            slug={slug}
            name={s.name}
            description={s.description}
            weeklyVisitors={s.weeklyVisitors}
          />
        );
      })}
    </div>
  );
}

async function ExploreFiltered({ filter }: { filter: ExploreFilterId }) {
  try {
    const items = await fetchSubredditsForExploreFilter(filter, 24);
    return <ExploreGrid items={items} />;
  } catch (error) {
    if (isStrapiUnavailableError(error)) {
      return (
        <EmptyState
          tone="error"
          message="Explore data is temporarily unavailable. Check Strapi and API token."
        />
      );
    }

    throw error;
  }
}

async function ExploreMain({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: raw } = await searchParams;
  const filter = normalizeExploreFilter(raw);
  const heading =
    filter === "all"
      ? "Explore Communities"
      : `${EXPLORE_PILL_LABELS[filter]} communities`;

  return (
    <main className="min-w-0">
      <ExploreCategoryPills active={filter} />
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
        {heading}
      </h1>

      <div className="mt-6">
        <ExploreFiltered filter={filter} />
      </div>
    </main>
  );
}

export default function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return (
    <FeedWithRightRail>
      <Suspense fallback={<EmptyState message="Loading explore…" />}>
        <ExploreMain searchParams={searchParams} />
      </Suspense>
    </FeedWithRightRail>
  );
}
