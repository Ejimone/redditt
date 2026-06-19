import FeedWithRightRail from "@/components/layout/FeedWithRightRail";
import PostCommentsContent from "@/components/PostCommentsContent";
import Link from "next/link";

export default async function PostCommentsPage({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const { slug, postId } = await params;

  return (
    <FeedWithRightRail>
      <main className="space-y-6">
        <PostCommentsContent slug={slug} postId={postId} />

        <Link
          href={`/r/${slug}`}
          className="inline-block text-sm font-bold text-[#0079d3] hover:underline"
        >
          Back to feed
        </Link>
      </main>
    </FeedWithRightRail>
  );
}
