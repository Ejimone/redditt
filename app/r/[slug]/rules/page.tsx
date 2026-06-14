import { fetchCollection } from "@/lib/strapi";
import Link from "next/link";
import { notFound } from "next/navigation";

type Community = {
  slug?: string;
  rules?: string[];
};

async function getRulesBySlug(slug: string) {
  const communities = await fetchCollection<Community>(
    `/subreddits?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1`,
    {
      next: { revalidate: 60 },
    },
  );

  const community = communities[0];
  if (!community) {
    notFound();
  }

  return Array.isArray(community.rules) ? community.rules : [];
}

export default async function RulesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rules = await getRulesBySlug(slug);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold capitalize sm:text-2xl">
        r/{slug} rules
      </h1>
      <ul className="list-inside list-disc space-y-2 text-sm sm:text-base">
        {rules.length === 0 ? (
          <li className="text-gray-700">No rules yet for this community.</li>
        ) : null}

        {rules.map((rule, index) => (
          <li key={index} className="text-gray-700">
            {rule}
          </li>
        ))}
      </ul>
      <Link
        href={`/r/${slug}`}
        className="text-sm text-blue-500 hover:underline sm:text-base"
      >
        Back to r/{slug}
      </Link>
    </div>
  );
}
