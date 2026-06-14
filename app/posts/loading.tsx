import { Card, CardContent } from "@/components/ui/card";
import FeedWithRightRail from "@/components/layout/FeedWithRightRail";

export default function PostsLoading() {
  return (
    <FeedWithRightRail>
      <main>
        <div className="mb-6 h-9 w-48 animate-pulse rounded-full bg-muted" />
        <div className="mb-6 h-4 w-full max-w-xl animate-pulse rounded-full bg-muted/50" />
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Loading posts…
          </CardContent>
        </Card>
      </main>
    </FeedWithRightRail>
  );
}
