import { fetchCollection } from "@/lib/strapi";
import Link from "next/link";
import { notFound } from "next/navigation";

type Comment = {
  content?: string;
  authorName?: string;
};

export default async function CommentModalPage({
  params,
}: {
  params: Promise<{ slug: string; commentId: string }>;
}) {
  const { slug, commentId } = await params;
  const parsedCommentId = Number(commentId);

  if (!Number.isInteger(parsedCommentId)) {
    notFound();
  }

  const comments = await fetchCollection<Comment>(
    `/comments?filters[id][$eq]=${encodeURIComponent(String(parsedCommentId))}&pagination[pageSize]=1`,
    {
      next: { revalidate: 30 },
    },
  );

  const comment = comments[0];
  if (!comment) {
    notFound();
  }

  const postTitle = `Comment #${parsedCommentId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-4 shadow-xl sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2 sm:gap-4">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
            {postTitle}
          </h2>
          <Link
            href={`/r/${slug}`}
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 sm:px-3 sm:text-sm"
          >
            Close
          </Link>
        </div>

        <p className="text-sm text-slate-600">
          {comment.content || "No comment body available."}
        </p>

        <p className="mt-3 text-xs text-slate-500">
          by {comment.authorName || "anonymous"}
        </p>
      </div>
    </div>
  );
}
