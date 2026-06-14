import type { Core } from "@strapi/strapi";

type SeedCommunity = {
  name: string;
  slug: string;
  description: string;
  rules: string[];
  exploreCategory:
    | "general"
    | "technology"
    | "games"
    | "internet_culture"
    | "humanities_law"
    | "news_politics";
  weeklyVisitors: number;
};

const seedCommunities: SeedCommunity[] = [
  {
    name: "Next.js",
    slug: "nextjs",
    description: "News, tips, and deep dives about shipping apps with Next.js.",
    rules: ["Keep it Next.js related", "No spam", "Use descriptive titles"],
    exploreCategory: "technology",
    weeklyVisitors: 2_100_000,
  },
  {
    name: "Strapi",
    slug: "strapi",
    description:
      "Headless CMS discussions, modeling tips, and integration guides.",
    rules: [
      "Share practical examples",
      "No self-promo without context",
      "Be respectful",
    ],
    exploreCategory: "technology",
    weeklyVisitors: 890_000,
  },
  {
    name: "TypeScript",
    slug: "typescript",
    description: "Type-safe patterns for frontend and backend engineering.",
    rules: [
      "Include TS snippets when helpful",
      "No language wars",
      "Explain tradeoffs clearly",
    ],
    exploreCategory: "technology",
    weeklyVisitors: 3_400_000,
  },
];

const PUBLIC_ROUTE_ACTIONS = [
  "api::subreddit.subreddit.find",
  "api::subreddit.subreddit.findOne",
  "api::subreddit.subreddit.listCommunities",
  "api::subreddit.subreddit.bySlug",
  "api::subreddit.subreddit.membership",
  "api::subreddit.subreddit.members",
  "api::subreddit.subreddit.listPosts",
  "api::subreddit.subreddit.getPost",
  "api::subreddit.subreddit.listComments",
  "api::post.post.find",
  "api::post.post.findOne",
  "api::post.post.bySubreddit",
  "api::comment.comment.find",
  "api::comment.comment.findOne",
];

const AUTHENTICATED_ONLY_ACTIONS = [
  "api::subreddit.subreddit.createCommunity",
  "api::subreddit.subreddit.updateBySlug",
  "api::subreddit.subreddit.deleteBySlug",
  "api::subreddit.subreddit.join",
  "api::subreddit.subreddit.leave",
  "api::subreddit.subreddit.myCommunities",
  "api::subreddit.subreddit.createPost",
  "api::subreddit.subreddit.updatePost",
  "api::subreddit.subreddit.deletePost",
  "api::subreddit.subreddit.createComment",
  "api::subreddit.subreddit.updateComment",
  "api::subreddit.subreddit.deleteComment",
  "api::post.post.vote",
  "api::comment.comment.vote",
  "api::post.post.create",
  "api::post.post.update",
  "api::post.post.delete",
  "api::comment.comment.create",
  "api::comment.comment.update",
  "api::comment.comment.delete",
  "api::subreddit.subreddit.create",
  "api::subreddit.subreddit.update",
  "api::subreddit.subreddit.delete",
  "api::community-membership.community-membership.find",
  "api::community-membership.community-membership.findOne",
  "api::community-membership.community-membership.create",
  "api::community-membership.community-membership.update",
  "api::community-membership.community-membership.delete",
];

type RoleType = "public" | "authenticated";

type RoleRecord = {
  id: number;
  name?: string;
  description?: string;
  type: RoleType;
  permissions?: Record<string, unknown>;
};

function setPermissionEnabled(
  permissions: Record<string, any>,
  actionId: string,
): "updated" | "already-enabled" | "missing" {
  const [typeName, controllerName, actionName, ...rest] = actionId.split(".");

  if (!typeName || !controllerName || !actionName || rest.length > 0) {
    return "missing";
  }

  const target =
    permissions?.[typeName]?.controllers?.[controllerName]?.[actionName];

  if (!target || typeof target !== "object") {
    return "missing";
  }

  if (target.enabled === true) {
    return "already-enabled";
  }

  target.enabled = true;
  return "updated";
}

async function enableActionsForRole(
  strapi: Core.Strapi,
  roleType: RoleType,
  actionIds: string[],
) {
  const roleService = strapi.plugin("users-permissions").service("role");
  const roles = (await roleService.find()) as RoleRecord[];
  const role = roles.find((entry) => entry.type === roleType);

  if (!role) {
    strapi.log.warn(`Role '${roleType}' was not found while syncing permissions.`);
    return;
  }

  const roleWithPermissions = (await roleService.findOne(role.id)) as RoleRecord;
  const permissions =
    (roleWithPermissions.permissions as Record<string, any>) ?? {};

  let changed = false;

  for (const actionId of actionIds) {
    const result = setPermissionEnabled(permissions, actionId);

    if (result === "updated") {
      changed = true;
      continue;
    }

    if (result === "missing") {
      strapi.log.warn(
        `Could not map users-permissions action '${actionId}' for role '${roleType}'.`,
      );
    }
  }

  if (!changed) {
    return;
  }

  await roleService.updateRole(role.id, {
    name: roleWithPermissions.name,
    description: roleWithPermissions.description,
    permissions,
  });

  strapi.log.info(`Updated users-permissions for role '${roleType}'.`);
}

async function syncCommunityRoutePermissions(strapi: Core.Strapi) {
  const usersPermissionsService = strapi
    .plugin("users-permissions")
    .service("users-permissions");

  await usersPermissionsService.syncPermissions();

  await enableActionsForRole(strapi, "public", PUBLIC_ROUTE_ACTIONS);
  await enableActionsForRole(strapi, "authenticated", [
    ...PUBLIC_ROUTE_ACTIONS,
    ...AUTHENTICATED_ONLY_ACTIONS,
  ]);
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await syncCommunityRoutePermissions(strapi);

    const subredditQuery = strapi.db.query("api::subreddit.subreddit");
    const postQuery = strapi.db.query("api::post.post");
    const commentQuery = strapi.db.query("api::comment.comment");

    const subredditCount = await subredditQuery.count();
    if (subredditCount > 0) {
      return;
    }

    const subredditBySlug = new Map<string, { id: number }>();

    for (const community of seedCommunities) {
      const created = await subredditQuery.create({
        data: {
          name: community.name,
          slug: community.slug,
          description: community.description,
          rules: community.rules,
          exploreCategory: community.exploreCategory,
          weeklyVisitors: community.weeklyVisitors,
        },
      });

      subredditBySlug.set(community.slug, { id: created.id });
    }

    const seededPosts = [
      {
        title: "How are you using Server Actions in production?",
        slug: "server-actions-in-production",
        content:
          "Share patterns that worked for validation, optimistic UI, and retries.",
        subredditSlug: "nextjs",
        score: 24,
      },
      {
        title: "Modeling one-to-many in Strapi 5",
        slug: "modeling-one-to-many-in-strapi-5",
        content:
          "What relation patterns are you using for posts, comments, and votes?",
        subredditSlug: "strapi",
        score: 17,
      },
      {
        title: "Type-safe API clients without codegen",
        slug: "type-safe-api-clients-without-codegen",
        content:
          "Show your favorite patterns for runtime validation and strict types.",
        subredditSlug: "typescript",
        score: 31,
      },
    ];

    for (const post of seededPosts) {
      const subreddit = subredditBySlug.get(post.subredditSlug);
      if (!subreddit) {
        continue;
      }

      const createdPost = await postQuery.create({
        data: {
          title: post.title,
          slug: post.slug,
          content: post.content,
          authorName: "seed-bot",
          score: post.score,
          subreddit: subreddit.id,
        },
      });

      await commentQuery.create({
        data: {
          content: "Great thread. Looking forward to more examples.",
          authorName: "community-mod",
          score: 4,
          post: createdPost.id,
        },
      });
    }

    strapi.log.info("Seeded initial subreddit, post, and comment data.");
  },
};
