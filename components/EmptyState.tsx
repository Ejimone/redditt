import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  message: string;
  tone?: "muted" | "error";
};

export default function EmptyState({
  message,
  tone = "muted",
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent
        className={
          tone === "error"
            ? "p-4 text-sm text-red-400"
            : "p-4 text-sm text-muted-foreground"
        }
      >
        {message}
      </CardContent>
    </Card>
  );
}
