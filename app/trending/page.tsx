import EmptyState from "@/components/EmptyState";
import PopularCommunitiesLoadMore from "@/components/PopularCommunitiesLoadMore";
import {
  PopularCommunitiesPanelSkeleton,
} from "@/components/PopularCommunitiesPanel";
import FeedWithRightRail from "@/components/layout/FeedWithRightRail";
import PageHeader from "@/components/PageHeader";
import { fetchCollectionPagedSafe } from "@/lib/strapi";
import { Suspense } from "react";

type Community = {
  name?: string;
  slug?: string;
  description?: string;
  __backendOffline?: boolean;
};

const TRENDING_PAGE_SIZE = 10;

async function TrendingContent() {
  const { items: trendingSubredditsResult, hasMore } =
    await fetchCollectionPagedSafe<Community>(
      `/subreddits?sort=createdAt:desc&pagination[pageSize]=${TRENDING_PAGE_SIZE}&pagination[page]=1`,
      {
        next: { revalidate: 60 },
      },
      {
        fallback: {
          items: [{ __backendOffline: true }],
          hasMore: false,
        },
      },
    );

  const isBackendOffline = trendingSubredditsResult.some(
    (community) => community.__backendOffline,
  );
  const trendingSubreddits = trendingSubredditsResult.filter(
    (community) => !community.__backendOffline,
  );

  if (isBackendOffline) {
    return (
      <EmptyState
        tone="error"
        message="Backend data is unavailable or unauthorized. Showing no live data."
      />
    );
  }

  if (trendingSubreddits.length === 0) {
    return <EmptyState message="No communities yet." />;
  }

  return (
    <PopularCommunitiesLoadMore
      initialCommunities={trendingSubreddits}
      initialHasMore={hasMore && trendingSubreddits.length === TRENDING_PAGE_SIZE}
      pageSize={TRENDING_PAGE_SIZE}
      showPanelTitle={false}
    />
  );
}

export default function TrendingPage() {
  return (
    <FeedWithRightRail showAside={false}>
      <main className="max-w-xl">
        <PageHeader
          title="Popular communities"
          description="Recently active communities, newest first — same data as your Strapi subreddits."
        />
        <Suspense fallback={<PopularCommunitiesPanelSkeleton rows={8} />}>
          <TrendingContent />
        </Suspense>
      </main>
    </FeedWithRightRail>
  );
}
