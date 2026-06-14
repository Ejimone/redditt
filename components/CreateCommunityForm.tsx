import { auth } from "@/app/auth";
import CreateCommunityFormClient from "@/components/CreateCommunityFormClient";

export default async function CreateCommunityForm() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return <CreateCommunityFormClient />;
}
