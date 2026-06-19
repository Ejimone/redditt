import { auth } from "@/app/auth";
import { getJoinedCommunities } from "@/app/action";
import LeftSidebarNav from "@/components/layout/LeftSidebarNav";

export default async function LeftSidebar() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user);
  const joinedCommunities = isAuthenticated ? await getJoinedCommunities() : [];

  return (
    <LeftSidebarNav
      isAuthenticated={isAuthenticated}
      joinedCommunities={joinedCommunities}
    />
  );
}
