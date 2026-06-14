import VoteButtons from "@/components/VoteButtons";
import { Card, CardContent } from "@/components/ui/card";

export type CommentCardModel = {
  id: number;
  content: string;
  authorName: string;
  score: number;
};

type CommentCardProps = {
  comment: CommentCardModel;
  isAuthenticated: boolean;
};

export default function CommentCard({
  comment,
  isAuthenticated,
}: CommentCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-foreground">{comment.content}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            by {comment.authorName}
          </span>
          <VoteButtons
            entityId={comment.id}
            entityType="comment"
            initialScore={comment.score}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </CardContent>
    </Card>
  );
}
