"use client";

import { useState, useTransition } from "react";
import { getPopularCommunities } from "@/app/action";
import PopularCommunitiesPanel, { PopularCommunityItem } from "./PopularCommunitiesPanel";

type PopularCommunitiesLoadMoreProps = {
  initialCommunities: PopularCommunityItem[];
  initialHasMore: boolean;
  pageSize: number;
  showPanelTitle?: boolean;
  panelTitle?: string;
};

export default function PopularCommunitiesLoadMore({
  initialCommunities,
  initialHasMore,
  pageSize,
  showPanelTitle,
  panelTitle,
}: PopularCommunitiesLoadMoreProps) {
  const [communities, setCommunities] = useState<PopularCommunityItem[]>(initialCommunities);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    startTransition(async () => {
      const nextPage = page + 1;
      try {
        const result = await getPopularCommunities(nextPage, pageSize);
        if (result.items.length > 0) {
          setCommunities((prev) => [...prev, ...result.items]);
          setHasMore(result.hasMore);
          setPage(nextPage);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Failed to load more communities:", error);
      }
    });
  };

  const handleViewLess = () => {
    setCommunities(initialCommunities);
    setHasMore(true);
    setPage(1);
  };

  return (
    <PopularCommunitiesPanel
      communities={communities}
      showPanelTitle={showPanelTitle}
      panelTitle={panelTitle}
      onLoadMore={hasMore ? handleLoadMore : undefined}
      onViewLess={communities.length > initialCommunities.length ? handleViewLess : undefined}
      isLoadingMore={isPending}
    />
  );
}
