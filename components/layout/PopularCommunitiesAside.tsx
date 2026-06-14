import PopularCommunitiesPanel from "@/components/PopularCommunitiesPanel";
import { fetchCollectionPagedSafe } from "@/lib/strapi";

type Community = {
  name?: string;
  slug?: string;
  description?: string;
  __backendOffline?: boolean;
};

const ASIDE_PAGE_SIZE = 5;

export default async function PopularCommunitiesAside() {
  const { items: result, hasMore } = await fetchCollectionPagedSafe<Community>(
    `/subreddits?sort=createdAt:desc&pagination[pageSize]=${ASIDE_PAGE_SIZE}&pagination[page]=1`,
    { next: { revalidate: 60 } },
    {
      fallback: {
        items: [{ __backendOffline: true }],
        hasMore: false,
      },
    },
  );

  const offline = result.some((c) => c.__backendOffline);
  const communities = result.filter((c) => !c.__backendOffline);

  return (
    <aside className="w-full shrink-0">
      {offline ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-card px-4 py-3 ring-1 ring-white/5">
          <p className="text-xs text-destructive">
            Backend unavailable — check Strapi.
          </p>
        </div>
      ) : null}

      {!offline && communities.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-card px-4 py-3 ring-1 ring-white/5">
          <p className="text-xs text-muted-foreground">No communities yet.</p>
        </div>
      ) : null}

      {!offline && communities.length > 0 ? (
        <PopularCommunitiesPanel
          communities={communities}
          showPanelTitle
          panelTitle="Popular communities"
          seeMoreHref={hasMore ? "/trending" : undefined}
          seeMoreLabel="See more"
        />
      ) : null}
    </aside>
  );
}
