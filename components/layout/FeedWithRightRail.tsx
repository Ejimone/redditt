import PopularCommunitiesAside from "@/components/layout/PopularCommunitiesAside";
import { Suspense } from "react";

export default function FeedWithRightRail({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 xl:flex-row xl:justify-center xl:gap-8">
      <div className="order-1 min-w-0 w-full max-w-[740px] flex-1 xl:order-none">
        {children}
      </div>
      <div className="order-2 w-full shrink-0 xl:order-none xl:sticky xl:top-16 xl:w-[min(312px,100%)] xl:max-w-[312px] xl:flex-none xl:self-start">
        <div className="mx-auto w-full max-w-[min(100%,20rem)] py-1 sm:max-w-[22rem] md:max-w-[24rem] xl:mx-0 xl:max-w-none xl:py-2">
          <Suspense
            fallback={
              <div className="h-48 w-full animate-pulse rounded-2xl bg-card ring-1 ring-white/10" />
            }
          >
            <PopularCommunitiesAside />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
