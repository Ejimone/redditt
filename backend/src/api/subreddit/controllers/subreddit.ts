import { factories } from "@strapi/strapi";

const SUBREDDIT_UID = "api::subreddit.subreddit";
const POST_UID = "api::post.post";
const COMMENT_UID = "api::comment.comment";
const MEMBERSHIP_UID = "api::community-membership.community-membership";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
const MAX_SLUG_ATTEMPTS = 20;

const ALLOWED_EXPLORE_CATEGORIES = new Set([
  "general",
  "technology",
  "games",
  "internet_culture",
  "humanities_law",
  "news_politics",
]);

type AuthenticatedUser = {
  id: number;
  username?: string | null;
  email?: string | null;
};

type ActorIdentity = {
  key: string;
  name: string;
  userId?: number;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function asRelationId(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  if (value && typeof value === "object" && "id" in value) {
    return asRelationId((value as { id?: unknown }).id);
  }

  return null;
}

function parsePositiveId(value: unknown): number | null {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function parsePositiveInteger(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function parseNonNegativeInteger(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

function hasOwn(data: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(data, key);
}

function getRequestData(ctx: {
  request?: { body?: unknown };
}): Record<string, unknown> {
  const body = ctx.request?.body;

  if (!body || typeof body !== "object") {
    return {};
  }

  if (
    "data" in body &&
    (body as { data?: unknown }).data &&
    typeof (body as { data?: unknown }).data === "object"
  ) {
    return (body as { data: Record<string, unknown> }).data;
  }

  return body as Record<string, unknown>;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function getPagination(ctx: { query?: Record<string, unknown> }) {
  const query = ctx.query ?? {};
  const pagination =
    query.pagination && typeof query.pagination === "object"
      ? (query.pagination as Record<string, unknown>)
      : {};

  const page = parsePositiveInteger(pagination.page ?? query.page, 1);
  const pageSize = Math.min(
    parsePositiveInteger(
      pagination.pageSize ?? query.pageSize,
      DEFAULT_PAGE_SIZE,
    ),
    MAX_PAGE_SIZE,
  );

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}

function getPaginationMeta(total: number, page: number, pageSize: number) {
  return {
    page,
    pageSize,
    pageCount: total > 0 ? Math.ceil(total / pageSize) : 0,
    total,
  };
}

function getAuthenticatedUser(ctx: {
  state?: { user?: unknown };
}): AuthenticatedUser | null {
  const user = ctx.state?.user as AuthenticatedUser | undefined;

  if (!user || !Number.isInteger(user.id)) {
    return null;
  }

  return user;
}

function asHeaderValue(
  headers: Record<string, unknown> | undefined,
  key: string,
): string {
  if (!headers) {
    return "";
  }

  const value = headers[key];
  if (Array.isArray(value)) {
    return asString(value[0]);
  }

  return asString(value);
}

function normalizeActorKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._:@-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function getActorFromUser(user: AuthenticatedUser): ActorIdentity {
  return {
    key: `user:${user.id}`,
    name: asString(user.username) || asString(user.email) || "anonymous",
    userId: user.id,
  };
}

function getActorFromContext(
  ctx: {
    state?: { user?: unknown };
    query?: Record<string, unknown>;
    request?: { headers?: Record<string, unknown> };
  },
  payload: Record<string, unknown> = {},
): ActorIdentity | null {
  const user = getAuthenticatedUser(ctx);
  if (user) {
    return getActorFromUser(user);
  }

  const headers =
    ctx.request?.headers && typeof ctx.request.headers === "object"
      ? (ctx.request.headers as Record<string, unknown>)
      : undefined;

  const actorKeyInput =
    asString(payload.actorKey) ||
    asHeaderValue(headers, "x-reddit-actor-key") ||
    asString(ctx.query?.actorKey);

  const normalizedActorKey = normalizeActorKey(actorKeyInput);
  if (!normalizedActorKey) {
    return null;
  }

  const actorName =
    asString(payload.actorName) ||
    asHeaderValue(headers, "x-reddit-actor-name") ||
    asString(ctx.query?.actorName) ||
    "anonymous";

  return {
    key: `actor:${normalizedActorKey}`,
    name: actorName,
  };
}

function requireActor(ctx: {
  unauthorized?: (message?: string) => unknown;
  state?: { user?: unknown };
  query?: Record<string, unknown>;
  request?: { headers?: Record<string, unknown>; body?: unknown };
}): ActorIdentity | null {
  const payload = getRequestData(ctx);
  const actor = getActorFromContext(ctx, payload);

  if (!actor) {
    ctx.unauthorized?.("Authentication is required for this action.");
    return null;
  }

  return actor;
}

function buildMembershipKey(subredditId: number, actorKey: string): string {
  return `${subredditId}:${actorKey}`;
}

function canManageCommunity(
  actor: ActorIdentity,
  community: {
    creator?: { id?: number } | null;
    creatorKey?: string | null;
  },
): boolean {
  const creatorId = community.creator?.id;
  if (Number.isInteger(creatorId) && actor.userId) {
    return creatorId === actor.userId;
  }

  const creatorKey = asString(community.creatorKey);
  if (creatorKey) {
    return creatorKey === actor.key;
  }

  return false;
}

function canManageAuthoredEntity(
  actor: ActorIdentity,
  entity: {
    author?: { id?: number } | null;
    authorName?: string | null;
    authorKey?: string | null;
  },
): boolean {
  const authorId = entity.author?.id;
  if (Number.isInteger(authorId) && actor.userId) {
    return authorId === actor.userId;
  }

  const authorKey = asString(entity.authorKey);
  if (authorKey && authorKey === actor.key) {
    return true;
  }

  const normalizedActorName = actor.name.toLowerCase();
  const normalizedAuthorName = asString(entity.authorName).toLowerCase();

  return Boolean(normalizedAuthorName) && normalizedAuthorName === normalizedActorName;
}

async function ensureUniqueCommunitySlug(
  strapi: any,
  input: string,
  currentCommunityId?: number,
): Promise<string> {
  const baseSlug = toSlug(input) || `community-${Date.now().toString(36)}`;

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt}`;

    const existing = await strapi.db.query(SUBREDDIT_UID).findOne({
      where: { slug: candidate },
      select: ["id"],
    });

    if (!existing || existing.id === currentCommunityId) {
      return candidate;
    }
  }

  return `${baseSlug}-${Date.now().toString(36)}`;
}

async function ensureUniquePostSlug(
  strapi: any,
  input: string,
  currentPostId?: number,
): Promise<string> {
  const baseSlug = toSlug(input) || `post-${Date.now().toString(36)}`;

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt}`;

    const existing = await strapi.db.query(POST_UID).findOne({
      where: { slug: candidate },
      select: ["id"],
    });

    if (!existing || existing.id === currentPostId) {
      return candidate;
    }
  }

  return `${baseSlug}-${Date.now().toString(36)}`;
}

async function findCommunityBySlug(
  strapi: any,
  slug: string,
  withCreator = false,
) {
  return strapi.db.query(SUBREDDIT_UID).findOne({
    where: { slug },
    ...(withCreator
      ? {
          populate: {
            creator: {
              select: ["id", "username"],
            },
          },
        }
      : {}),
  });
}

async function findMembership(
  strapi: any,
  subredditId: number,
  actor: ActorIdentity,
) {
  const keys = [buildMembershipKey(subredditId, actor.key)];
  if (actor.userId) {
    keys.push(`${subredditId}:${actor.userId}`);
  }

  const whereConditions: Record<string, unknown>[] = [
    { actorKey: actor.key },
    { membershipKey: { $in: keys } },
  ];

  if (actor.userId) {
    whereConditions.push({ user: actor.userId });
  }

  return strapi.db.query(MEMBERSHIP_UID as any).findOne({
    where: {
      subreddit: subredditId,
      $or: whereConditions,
    },
    select: ["id", "joinedAt", "role", "actorKey", "actorName"],
  });
}

async function countCommunityMembers(
  strapi: any,
  subredditId: number,
): Promise<number> {
  return strapi.db.query(MEMBERSHIP_UID as any).count({
    where: { subreddit: subredditId },
  });
}

export default factories.createCoreController(SUBREDDIT_UID, ({ strapi }) => ({
  async listCommunities(ctx) {
    const { page, pageSize, offset } = getPagination(ctx);
    const search = asString(
      (ctx.query as Record<string, unknown> | undefined)?.q,
    );

    const where = search
      ? {
          $or: [
            { name: { $containsi: search } },
            { slug: { $containsi: search } },
            { description: { $containsi: search } },
          ],
        }
      : {};

    const communities = await strapi.db.query(SUBREDDIT_UID).findMany({
      where,
      orderBy: { createdAt: "desc" },
      offset,
      limit: pageSize,
    });

    const total = await strapi.db.query(SUBREDDIT_UID).count({ where });

    ctx.body = {
      data: communities,
      meta: {
        pagination: getPaginationMeta(total, page, pageSize),
      },
    };
  },

  async createCommunity(ctx) {
    const actor = requireActor(ctx);
    if (!actor) {
      return;
    }

    const payload = getRequestData(ctx);
    const name = asString(payload.name);
    const description = asString(payload.description);

    if (!name || !description) {
      return ctx.badRequest("Community name and description are required.");
    }

    const requestedSlug = asString(payload.slug) || name;
    const slug = await ensureUniqueCommunitySlug(strapi, requestedSlug);
    const rules = hasOwn(payload, "rules") ? asStringArray(payload.rules) : [];

    const exploreCategoryInput = asString(payload.exploreCategory);
    const exploreCategory = ALLOWED_EXPLORE_CATEGORIES.has(exploreCategoryInput)
      ? exploreCategoryInput
      : "general";

    const weeklyVisitors = hasOwn(payload, "weeklyVisitors")
      ? parseNonNegativeInteger(payload.weeklyVisitors, 0)
      : 0;

    const createdCommunity = await strapi.db.query(SUBREDDIT_UID).create({
      data: {
        name,
        slug,
        description,
        rules,
        exploreCategory,
        weeklyVisitors,
        creatorKey: actor.key,
        ...(actor.userId ? { creator: actor.userId } : {}),
      },
    });

    await strapi.db.query(MEMBERSHIP_UID as any).create({
      data: {
        membershipKey: buildMembershipKey(createdCommunity.id, actor.key),
        actorKey: actor.key,
        actorName: actor.name,
        role: "moderator",
        joinedAt: new Date().toISOString(),
        subreddit: createdCommunity.id,
        ...(actor.userId ? { user: actor.userId } : {}),
      },
    });

    ctx.status = 201;
    ctx.body = { data: createdCommunity };
  },

  async bySlug(ctx) {
    const slug = asString(ctx.params.slug);
    if (!slug) {
      return ctx.badRequest("Community slug is required.");
    }

    const community = await findCommunityBySlug(strapi, slug, true);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    const [memberCount, postCount] = await Promise.all([
      countCommunityMembers(strapi, community.id),
      strapi.db.query(POST_UID).count({ where: { subreddit: community.id } }),
    ]);

    const actor = getActorFromContext(ctx);
    let isMember = false;

    if (actor) {
      const membership = await findMembership(strapi, community.id, actor);
      isMember = Boolean(membership);
    }

    ctx.body = {
      data: {
        ...community,
        memberCount,
        postCount,
        isMember,
      },
    };
  },

  async updateBySlug(ctx) {
    const actor = requireActor(ctx);
    if (!actor) {
      return;
    }

    const slug = asString(ctx.params.slug);
    if (!slug) {
      return ctx.badRequest("Community slug is required.");
    }

    const community = await findCommunityBySlug(strapi, slug, true);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    if (!canManageCommunity(actor, community)) {
      return ctx.forbidden(
        "Only the community owner can update this community.",
      );
    }

    const payload = getRequestData(ctx);
    const data: Record<string, unknown> = {};

    if (hasOwn(payload, "name")) {
      const name = asString(payload.name);
      if (!name) {
        return ctx.badRequest("Community name cannot be empty.");
      }
      data.name = name;
    }

    if (hasOwn(payload, "description")) {
      const description = asString(payload.description);
      if (!description) {
        return ctx.badRequest("Community description cannot be empty.");
      }
      data.description = description;
    }

    if (hasOwn(payload, "slug")) {
      const requestedSlug = asString(payload.slug);
      if (!requestedSlug) {
        return ctx.badRequest("Community slug cannot be empty.");
      }

      data.slug = await ensureUniqueCommunitySlug(
        strapi,
        requestedSlug,
        community.id,
      );
    }

    if (hasOwn(payload, "rules")) {
      data.rules = asStringArray(payload.rules);
    }

    if (hasOwn(payload, "exploreCategory")) {
      const exploreCategory = asString(payload.exploreCategory);
      if (!ALLOWED_EXPLORE_CATEGORIES.has(exploreCategory)) {
        return ctx.badRequest("Invalid explore category.");
      }
      data.exploreCategory = exploreCategory;
    }

    if (hasOwn(payload, "weeklyVisitors")) {
      const parsedWeeklyVisitors = Number.parseInt(
        String(payload.weeklyVisitors),
        10,
      );

      if (!Number.isInteger(parsedWeeklyVisitors) || parsedWeeklyVisitors < 0) {
        return ctx.badRequest("weeklyVisitors must be a non-negative integer.");
      }

      data.weeklyVisitors = parsedWeeklyVisitors;
    }

    if (Object.keys(data).length === 0) {
      return ctx.badRequest("No updatable fields were provided.");
    }

    const updatedCommunity = await strapi.db.query(SUBREDDIT_UID).update({
      where: { id: community.id },
      data,
    });

    ctx.body = { data: updatedCommunity };
  },

  async deleteBySlug(ctx) {
    const actor = requireActor(ctx);
    if (!actor) {
      return;
    }

    const slug = asString(ctx.params.slug);
    if (!slug) {
      return ctx.badRequest("Community slug is required.");
    }

    const community = await findCommunityBySlug(strapi, slug, true);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    if (!canManageCommunity(actor, community)) {
      return ctx.forbidden(
        "Only the community owner can delete this community.",
      );
    }

    const posts = await strapi.db.query(POST_UID).findMany({
      where: { subreddit: community.id },
      select: ["id"],
    });

    for (const post of posts) {
      await strapi.db.query(COMMENT_UID).deleteMany({
        where: { post: post.id },
      });
    }

    await Promise.all([
      strapi.db.query(POST_UID).deleteMany({
        where: { subreddit: community.id },
      }),
      strapi.db.query(MEMBERSHIP_UID as any).deleteMany({
        where: { subreddit: community.id },
      }),
    ]);

    await strapi.db.query(SUBREDDIT_UID).delete({
      where: { id: community.id },
    });

    ctx.body = {
      data: {
        id: community.id,
        deleted: true,
      },
    };
  },

  async join(ctx) {
    const actor = requireActor(ctx);
    if (!actor) {
      return;
    }

    const slug = asString(ctx.params.slug);
    if (!slug) {
      return ctx.badRequest("Community slug is required.");
    }

    const community = await findCommunityBySlug(strapi, slug);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    const existingMembership = await findMembership(strapi, community.id, actor);
    if (existingMembership) {
      const memberCount = await countCommunityMembers(strapi, community.id);

      ctx.body = {
        data: {
          ...existingMembership,
          joined: true,
          alreadyJoined: true,
          memberCount,
        },
      };
      return;
    }

    const createdMembership = await strapi.db
      .query(MEMBERSHIP_UID as any)
      .create({
        data: {
          membershipKey: buildMembershipKey(community.id, actor.key),
          actorKey: actor.key,
          actorName: actor.name,
          role: "member",
          joinedAt: new Date().toISOString(),
          subreddit: community.id,
          ...(actor.userId ? { user: actor.userId } : {}),
        },
      });

    const memberCount = await countCommunityMembers(strapi, community.id);

    ctx.body = {
      data: {
        ...createdMembership,
        joined: true,
        memberCount,
      },
    };
  },

  async leave(ctx) {
    const actor = requireActor(ctx);
    if (!actor) {
      return;
    }

    const slug = asString(ctx.params.slug);
    if (!slug) {
      return ctx.badRequest("Community slug is required.");
    }

    const community = await findCommunityBySlug(strapi, slug);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    const existingMembership = await findMembership(strapi, community.id, actor);
    if (!existingMembership) {
      const memberCount = await countCommunityMembers(strapi, community.id);

      ctx.body = {
        data: {
          left: true,
          alreadyLeft: true,
          memberCount,
        },
      };
      return;
    }

    await strapi.db.query(MEMBERSHIP_UID as any).delete({
      where: { id: existingMembership.id },
    });

    const memberCount = await countCommunityMembers(strapi, community.id);
    ctx.body = {
      data: {
        left: true,
        memberCount,
      },
    };
  },

  async membership(ctx) {
    const slug = asString(ctx.params.slug);
    if (!slug) {
      return ctx.badRequest("Community slug is required.");
    }

    const community = await findCommunityBySlug(strapi, slug);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    const actor = getActorFromContext(ctx);
    const memberCount = await countCommunityMembers(strapi, community.id);

    if (!actor) {
      ctx.body = {
        data: {
          isMember: false,
          memberCount,
          requiresAuth: true,
        },
      };
      return;
    }

    const membership = await findMembership(strapi, community.id, actor);

    ctx.body = {
      data: {
        isMember: Boolean(membership),
        memberCount,
        membership,
      },
    };
  },

  async members(ctx) {
    const slug = asString(ctx.params.slug);
    if (!slug) {
      return ctx.badRequest("Community slug is required.");
    }

    const community = await findCommunityBySlug(strapi, slug);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    const { page, pageSize, offset } = getPagination(ctx);

    const memberships = await strapi.db.query(MEMBERSHIP_UID as any).findMany({
      where: { subreddit: community.id },
      orderBy: { joinedAt: "desc" },
      offset,
      limit: pageSize,
      populate: {
        user: {
          select: ["id", "username"],
        },
      },
      select: ["id", "role", "joinedAt", "actorName"],
    });

    const total = await countCommunityMembers(strapi, community.id);

    ctx.body = {
      data: memberships.map((membership: any) => ({
        id: membership.id,
        role: membership.role,
        joinedAt: membership.joinedAt,
        actorName: membership.actorName ?? "anonymous",
        user: membership.user
          ? {
              id: membership.user.id,
              username: membership.user.username,
            }
          : null,
      })),
      meta: {
        pagination: getPaginationMeta(total, page, pageSize),
      },
    };
  },

  async myCommunities(ctx) {
    const actor = requireActor(ctx);
    if (!actor) {
      return;
    }

    const { page, pageSize, offset } = getPagination(ctx);

    const membershipWhere = actor.userId
      ? {
          $or: [{ user: actor.userId }, { actorKey: actor.key }],
        }
      : { actorKey: actor.key };

    const memberships = await strapi.db.query(MEMBERSHIP_UID as any).findMany({
      where: membershipWhere,
      orderBy: { joinedAt: "desc" },
      offset,
      limit: pageSize,
      populate: {
        subreddit: {
          select: [
            "id",
            "name",
            "slug",
            "description",
            "exploreCategory",
            "weeklyVisitors",
            "createdAt",
            "updatedAt",
          ],
        },
      },
      select: ["id", "role", "joinedAt", "actorName"],
    });

    const total = await strapi.db.query(MEMBERSHIP_UID as any).count({
      where: membershipWhere,
    });

    ctx.body = {
      data: memberships
        .filter((membership: any) => Boolean(membership.subreddit))
        .map((membership: any) => ({
          membershipId: membership.id,
          role: membership.role,
          joinedAt: membership.joinedAt,
          ...membership.subreddit,
        })),
      meta: {
        pagination: getPaginationMeta(total, page, pageSize),
      },
    };
  },

  async listPosts(ctx) {
    const slug = asString(ctx.params.slug);
    if (!slug) {
      return ctx.badRequest("Community slug is required.");
    }

    const community = await findCommunityBySlug(strapi, slug);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    const { page, pageSize, offset } = getPagination(ctx);

    const posts = await strapi.db.query(POST_UID).findMany({
      where: {
        subreddit: community.id,
      },
      orderBy: { createdAt: "desc" },
      populate: ["image", "comments", "subreddit"],
      offset,
      limit: pageSize,
    });

    const total = await strapi.db.query(POST_UID).count({
      where: {
        subreddit: community.id,
      },
    });

    ctx.body = {
      data: posts,
      meta: {
        pagination: getPaginationMeta(total, page, pageSize),
      },
    };
  },

  async createPost(ctx) {
    const actor = requireActor(ctx);
    if (!actor) {
      return;
    }

    const slug = asString(ctx.params.slug);
    if (!slug) {
      return ctx.badRequest("Community slug is required.");
    }

    const community = await findCommunityBySlug(strapi, slug);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    const membership = await findMembership(strapi, community.id, actor);
    if (!membership) {
      return ctx.forbidden("Join this community before creating a post.");
    }

    const payload = getRequestData(ctx);
    const title = asString(payload.title);
    const content = asString(payload.content);

    if (!title || !content) {
      return ctx.badRequest("Post title and content are required.");
    }

    const requestedSlug = asString(payload.slug) || title;
    const postSlug = await ensureUniquePostSlug(strapi, requestedSlug);

    const imageId = asRelationId(payload.image);
    const videoUrl = asString(payload.videoUrl);

    const data: Record<string, unknown> = {
      title,
      slug: postSlug,
      content,
      authorName: actor.name,
      authorKey: actor.key,
      ...(actor.userId ? { author: actor.userId } : {}),
      subreddit: community.id,
    };

    if (imageId) {
      data.image = imageId;
    }

    if (videoUrl) {
      data.videoUrl = videoUrl;
    }

    const createdPost = await strapi.db.query(POST_UID).create({
      data,
    });

    ctx.status = 201;
    ctx.body = {
      data: createdPost,
    };
  },

  async getPost(ctx) {
    const slug = asString(ctx.params.slug);
    const postId = parsePositiveId(ctx.params.postId);

    if (!slug || !postId) {
      return ctx.badRequest("Community slug and post id are required.");
    }

    const community = await findCommunityBySlug(strapi, slug);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    const post = await strapi.db.query(POST_UID).findOne({
      where: {
        id: postId,
        subreddit: community.id,
      },
      populate: ["image", "comments", "subreddit"],
    });

    if (!post) {
      return ctx.notFound("Post not found in this community.");
    }

    ctx.body = { data: post };
  },

  async updatePost(ctx) {
    const actor = requireActor(ctx);
    if (!actor) {
      return;
    }

    const slug = asString(ctx.params.slug);
    const postId = parsePositiveId(ctx.params.postId);

    if (!slug || !postId) {
      return ctx.badRequest("Community slug and post id are required.");
    }

    const community = await findCommunityBySlug(strapi, slug);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    const currentPost = await strapi.db.query(POST_UID).findOne({
      where: {
        id: postId,
        subreddit: community.id,
      },
      select: ["id", "slug", "authorName", "authorKey"],
      populate: {
        author: {
          select: ["id"],
        },
      },
    });

    if (!currentPost) {
      return ctx.notFound("Post not found in this community.");
    }

    if (!canManageAuthoredEntity(actor, currentPost)) {
      return ctx.forbidden("Only the post author can update this post.");
    }

    const payload = getRequestData(ctx);
    const data: Record<string, unknown> = {};

    if (hasOwn(payload, "title")) {
      const title = asString(payload.title);
      if (!title) {
        return ctx.badRequest("Post title cannot be empty.");
      }

      data.title = title;

      if (!hasOwn(payload, "slug")) {
        data.slug = await ensureUniquePostSlug(strapi, title, currentPost.id);
      }
    }

    if (hasOwn(payload, "slug")) {
      const requestedSlug = asString(payload.slug);
      if (!requestedSlug) {
        return ctx.badRequest("Post slug cannot be empty.");
      }

      data.slug = await ensureUniquePostSlug(
        strapi,
        requestedSlug,
        currentPost.id,
      );
    }

    if (hasOwn(payload, "content")) {
      const content = asString(payload.content);
      if (!content) {
        return ctx.badRequest("Post content cannot be empty.");
      }
      data.content = content;
    }

    if (hasOwn(payload, "videoUrl")) {
      const videoUrl = asString(payload.videoUrl);
      data.videoUrl = videoUrl || null;
    }

    if (hasOwn(payload, "image")) {
      const imageId = asRelationId(payload.image);
      data.image = imageId ?? null;
    }

    if (Object.keys(data).length === 0) {
      return ctx.badRequest("No updatable fields were provided.");
    }

    const updatedPost = await strapi.db.query(POST_UID).update({
      where: { id: currentPost.id },
      data,
    });

    ctx.body = { data: updatedPost };
  },

  async deletePost(ctx) {
    const actor = requireActor(ctx);
    if (!actor) {
      return;
    }

    const slug = asString(ctx.params.slug);
    const postId = parsePositiveId(ctx.params.postId);

    if (!slug || !postId) {
      return ctx.badRequest("Community slug and post id are required.");
    }

    const community = await findCommunityBySlug(strapi, slug);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    const currentPost = await strapi.db.query(POST_UID).findOne({
      where: {
        id: postId,
        subreddit: community.id,
      },
      select: ["id", "authorName", "authorKey"],
      populate: {
        author: {
          select: ["id"],
        },
      },
    });

    if (!currentPost) {
      return ctx.notFound("Post not found in this community.");
    }

    if (!canManageAuthoredEntity(actor, currentPost)) {
      return ctx.forbidden("Only the post author can delete this post.");
    }

    await strapi.db.query(COMMENT_UID).deleteMany({
      where: { post: currentPost.id },
    });

    await strapi.db.query(POST_UID).delete({
      where: { id: currentPost.id },
    });

    ctx.body = {
      data: {
        id: currentPost.id,
        deleted: true,
      },
    };
  },

  async listComments(ctx) {
    const slug = asString(ctx.params.slug);
    const postId = parsePositiveId(ctx.params.postId);

    if (!slug || !postId) {
      return ctx.badRequest("Community slug and post id are required.");
    }

    const community = await findCommunityBySlug(strapi, slug);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    const post = await strapi.db.query(POST_UID).findOne({
      where: {
        id: postId,
        subreddit: community.id,
      },
      select: ["id"],
    });

    if (!post) {
      return ctx.notFound("Post not found in this community.");
    }

    const { page, pageSize, offset } = getPagination(ctx);

    const comments = await strapi.db.query(COMMENT_UID).findMany({
      where: { post: post.id },
      orderBy: { createdAt: "asc" },
      offset,
      limit: pageSize,
      populate: {
        author: {
          select: ["id", "username"],
        },
      },
    });

    const total = await strapi.db.query(COMMENT_UID).count({
      where: { post: post.id },
    });

    ctx.body = {
      data: comments,
      meta: {
        pagination: getPaginationMeta(total, page, pageSize),
      },
    };
  },

  async createComment(ctx) {
    const actor = requireActor(ctx);
    if (!actor) {
      return;
    }

    const slug = asString(ctx.params.slug);
    const postId = parsePositiveId(ctx.params.postId);

    if (!slug || !postId) {
      return ctx.badRequest("Community slug and post id are required.");
    }

    const community = await findCommunityBySlug(strapi, slug);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    const membership = await findMembership(strapi, community.id, actor);
    if (!membership) {
      return ctx.forbidden("Join this community before creating a comment.");
    }

    const post = await strapi.db.query(POST_UID).findOne({
      where: {
        id: postId,
        subreddit: community.id,
      },
      select: ["id"],
    });

    if (!post) {
      return ctx.notFound("Post not found in this community.");
    }

    const payload = getRequestData(ctx);
    const content = asString(payload.content);

    if (!content) {
      return ctx.badRequest("Comment content is required.");
    }

    let parentCommentId: number | null = null;
    if (hasOwn(payload, "parentId") && payload.parentId !== null) {
      const parentId = parsePositiveId(payload.parentId);
      if (!parentId) {
        return ctx.badRequest("Invalid parent comment id.");
      }

      const parentComment = await strapi.db.query(COMMENT_UID).findOne({
        where: { id: parentId, post: post.id },
        select: ["id"],
      });

      if (!parentComment) {
        return ctx.badRequest("Parent comment not found in this post.");
      }

      parentCommentId = parentComment.id;
    }

    const createdComment = await strapi.db.query(COMMENT_UID).create({
      data: {
        content,
        authorName: actor.name,
        authorKey: actor.key,
        ...(actor.userId ? { author: actor.userId } : {}),
        post: post.id,
        ...(parentCommentId ? { parent: parentCommentId } : {}),
      },
    });

    ctx.status = 201;
    ctx.body = {
      data: createdComment,
    };
  },

  async updateComment(ctx) {
    const actor = requireActor(ctx);
    if (!actor) {
      return;
    }

    const slug = asString(ctx.params.slug);
    const postId = parsePositiveId(ctx.params.postId);
    const commentId = parsePositiveId(ctx.params.commentId);

    if (!slug || !postId || !commentId) {
      return ctx.badRequest(
        "Community slug, post id, and comment id are required.",
      );
    }

    const community = await findCommunityBySlug(strapi, slug);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    const post = await strapi.db.query(POST_UID).findOne({
      where: {
        id: postId,
        subreddit: community.id,
      },
      select: ["id"],
    });

    if (!post) {
      return ctx.notFound("Post not found in this community.");
    }

    const currentComment = await strapi.db.query(COMMENT_UID).findOne({
      where: {
        id: commentId,
        post: post.id,
      },
      select: ["id", "authorName", "authorKey"],
      populate: {
        author: {
          select: ["id"],
        },
      },
    });

    if (!currentComment) {
      return ctx.notFound("Comment not found in this post.");
    }

    if (!canManageAuthoredEntity(actor, currentComment)) {
      return ctx.forbidden("Only the comment author can update this comment.");
    }

    const payload = getRequestData(ctx);
    const content = asString(payload.content);

    if (!content) {
      return ctx.badRequest("Comment content is required.");
    }

    const updatedComment = await strapi.db.query(COMMENT_UID).update({
      where: { id: currentComment.id },
      data: {
        content,
      },
    });

    ctx.body = { data: updatedComment };
  },

  async deleteComment(ctx) {
    const actor = requireActor(ctx);
    if (!actor) {
      return;
    }

    const slug = asString(ctx.params.slug);
    const postId = parsePositiveId(ctx.params.postId);
    const commentId = parsePositiveId(ctx.params.commentId);

    if (!slug || !postId || !commentId) {
      return ctx.badRequest(
        "Community slug, post id, and comment id are required.",
      );
    }

    const community = await findCommunityBySlug(strapi, slug);
    if (!community) {
      return ctx.notFound("Community not found.");
    }

    const post = await strapi.db.query(POST_UID).findOne({
      where: {
        id: postId,
        subreddit: community.id,
      },
      select: ["id"],
    });

    if (!post) {
      return ctx.notFound("Post not found in this community.");
    }

    const currentComment = await strapi.db.query(COMMENT_UID).findOne({
      where: {
        id: commentId,
        post: post.id,
      },
      select: ["id", "authorName", "authorKey"],
      populate: {
        author: {
          select: ["id"],
        },
      },
    });

    if (!currentComment) {
      return ctx.notFound("Comment not found in this post.");
    }

    if (!canManageAuthoredEntity(actor, currentComment)) {
      return ctx.forbidden("Only the comment author can delete this comment.");
    }

    await strapi.db.query(COMMENT_UID).delete({
      where: { id: currentComment.id },
    });

    ctx.body = {
      data: {
        id: currentComment.id,
        deleted: true,
      },
    };
  },
}));
