import ReplyButton from "@/components/ReplyButton";
import VoteButtons from "@/components/VoteButtons";
import { Card, CardContent } from "@/components/ui/card";

export type CommentCardModel = {
  id: number;
  content: string;
  authorName: string;
  score: number;
  replies: CommentCardModel[];
};

type CommentCardProps = {
  comment: CommentCardModel;
  isAuthenticated: boolean;
  isMember: boolean;
  postId: number;
  postSlug: string;
  subredditSlug: string;
  depth?: number;
};

export default function CommentCard({
  comment,
  isAuthenticated,
  isMember,
  postId,
  postSlug,
  subredditSlug,
  depth = 0,
}: CommentCardProps) {
  return (
    <div className={depth > 0 ? "ml-4 border-l border-border pl-4 sm:ml-6" : undefined}>
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

          {isAuthenticated && isMember ? (
            <div className="mt-2">
              <ReplyButton
                postId={postId}
                postSlug={postSlug}
                subredditSlug={subredditSlug}
                parentId={comment.id}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {comment.replies.length > 0 ? (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              isAuthenticated={isAuthenticated}
              isMember={isMember}
              postId={postId}
              postSlug={postSlug}
              subredditSlug={subredditSlug}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
