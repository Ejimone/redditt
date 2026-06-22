import PostCommentsContent from "@/components/PostCommentsContent";
import PostCommentsModal from "@/components/PostCommentsModal";

export default async function PostCommentsModalPage({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const { slug, postId } = await params;

  return (
    <PostCommentsModal>
      <PostCommentsContent slug={slug} postId={postId} />
    </PostCommentsModal>
  );
}
