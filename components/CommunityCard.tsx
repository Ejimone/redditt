import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export type CommunityCardProps = {
  slug: string;
  name?: string;
  description?: string | null;
  index?: number;
};

export default function CommunityCard({
  slug,
  name,
  description,
  index = 0,
}: CommunityCardProps) {
  const label = slug || name || `community-${index + 1}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-bold">
          <Link
            href={`/r/${slug || "community"}`}
            className="text-foreground hover:text-[#ff4500]"
          >
            r/{label}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {description?.trim() ? description : "No description yet."}
        </p>
      </CardContent>
    </Card>
  );
}
