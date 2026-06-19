import { factories } from "@strapi/strapi";

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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

type ActorIdentity = {
  key: string;
  name: string;
  userId?: number;
};

function getActorFromContext(ctx: {
  state?: { user?: unknown };
  query?: Record<string, unknown>;
  request?: { headers?: Record<string, unknown>; body?: unknown };
}): ActorIdentity | null {
  const user = ctx.state?.user as
    | { id?: number; username?: string; email?: string }
    | undefined;
  if (user && Number.isInteger(user.id)) {
    return {
      key: `user:${user.id}`,
      name: asString(user.username) || asString(user.email) || "anonymous",
      userId: user.id,
    };
  }

  const headers =
    ctx.request?.headers && typeof ctx.request.headers === "object"
      ? (ctx.request.headers as Record<string, unknown>)
      : undefined;

  const body =
    ctx.request?.body && typeof ctx.request.body === "object"
      ? (ctx.request.body as Record<string, unknown>)
      : {};

  const actorKeyInput =
    asString(body.actorKey) ||
    asHeaderValue(headers, "x-reddit-actor-key") ||
    asString(ctx.query?.actorKey);

  const normalizedActorKey = normalizeActorKey(actorKeyInput);
  if (!normalizedActorKey) {
    return null;
  }

  const actorName =
    asString(body.actorName) ||
    asHeaderValue(headers, "x-reddit-actor-name") ||
    asString(ctx.query?.actorName) ||
    "anonymous";

  return { key: `actor:${normalizedActorKey}`, name: actorName };
}

const VOTE_UID = "api::vote.vote";

export default factories.createCoreController(
  "api::post.post",
  ({ strapi }) => ({
    async find(ctx) {
      const rawQuery = ctx.query as {
        sort?: string;
        pagination?: { pageSize?: string | number; page?: string | number };
        filters?: {
          title?: { $containsi?: string };
          slug?: { $eq?: string };
          subreddit?: {
            exploreCategory?: { $eq?: string } | string;
            slug?: { $eq?: string } | string;
          };
        };
      };

      const pageSize = Math.min(
        Math.max(Number(rawQuery.pagination?.pageSize ?? 25), 1),
        100,
      );
      const page = Math.max(Number(rawQuery.pagination?.page ?? 1), 1);
      const sortStr = String(rawQuery.sort ?? "createdAt:desc");

      const where: Record<string, unknown> = {};
      const titleSearch = rawQuery.filters?.title?.["$containsi"];
      if (titleSearch) {
        where.title = { $containsi: titleSearch };
      }
      const slugFilter = rawQuery.filters?.slug?.["$eq"];
      if (slugFilter) {
        where.slug = slugFilter;
      }
      const subredditFilters = rawQuery.filters?.subreddit;
      if (subredditFilters) {
        const subredditWhere: Record<string, unknown> = {};
        const categoryRaw = subredditFilters.exploreCategory;
        const categoryFilter =
          typeof categoryRaw === "string"
            ? categoryRaw
            : (categoryRaw as { $eq?: string } | undefined)?.["$eq"];
        if (categoryFilter) {
          subredditWhere.exploreCategory = categoryFilter;
        }
        const subredditSlugRaw = subredditFilters.slug;
        const subredditSlugFilter =
          typeof subredditSlugRaw === "string"
            ? subredditSlugRaw
            : (subredditSlugRaw as { $eq?: string } | undefined)?.["$eq"];
        if (subredditSlugFilter) {
          subredditWhere.slug = subredditSlugFilter;
        }
        if (Object.keys(subredditWhere).length > 0) {
          where.subreddit = subredditWhere;
        }
      }

      const [posts, total] = await Promise.all([
        strapi.db.query("api::post.post").findMany({
          where,
          orderBy: sortStr.startsWith("score")
            ? { score: "desc" }
            : { createdAt: "desc" },
          populate: {
            subreddit: true,
            image: true,
            comments: { populate: ["parent"] },
          },
          limit: pageSize,
          offset: (page - 1) * pageSize,
        }),
        strapi.db.query("api::post.post").count({ where }),
      ]);

      ctx.body = {
        data: posts,
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
            total,
          },
        },
      };
    },

    async bySubreddit(ctx) {
      const slug = String(ctx.params.slug || "").trim();
      const requestedPageSize = Number(
        (ctx.query as { pagination?: { pageSize?: number | string } })
          ?.pagination?.pageSize ?? 10,
      );
      const pageSize =
        Number.isFinite(requestedPageSize) && requestedPageSize > 0
          ? Math.min(requestedPageSize, 50)
          : 10;

      if (!slug) {
        return ctx.badRequest("Subreddit slug is required.");
      }

      const subreddit = await strapi.db
        .query("api::subreddit.subreddit")
        .findOne({
          where: { slug },
          select: ["id"],
        });

      if (!subreddit?.id) {
        return (ctx.body = { data: [] });
      }

      const posts = await strapi.db.query("api::post.post").findMany({
        where: {
          subreddit: subreddit.id,
        },
        orderBy: { createdAt: "desc" },
        populate: ["image", "comments"],
        limit: pageSize,
      });

      ctx.body = { data: posts };
    },

    async vote(ctx) {
      const actor = getActorFromContext(ctx);
      if (!actor) {
        return ctx.unauthorized("Please sign in to vote.");
      }

      const id = Number(ctx.params.id);
      const value = Number(ctx.request.body?.value);

      if (!Number.isInteger(id)) {
        return ctx.badRequest("Invalid post id.");
      }

      if (value !== 1 && value !== -1) {
        return ctx.badRequest("Vote value must be either 1 or -1.");
      }

      const currentPost = await strapi.db.query("api::post.post").findOne({
        where: { id },
        select: ["id", "score"],
      });

      if (!currentPost) {
        return ctx.notFound("Post not found.");
      }

      const voteKey = `post:${id}:${actor.key}`;
      const existingVote = await strapi.db.query(VOTE_UID as any).findOne({
        where: { voteKey },
        select: ["id", "value"],
      });

      let scoreDelta = value;
      let userVote = value;

      if (existingVote && existingVote.value === value) {
        await strapi.db
          .query(VOTE_UID as any)
          .delete({ where: { id: existingVote.id } });
        scoreDelta = -value;
        userVote = 0;
      } else if (existingVote) {
        await strapi.db.query(VOTE_UID as any).update({
          where: { id: existingVote.id },
          data: { value, actorName: actor.name },
        });
        scoreDelta = value - existingVote.value;
      } else {
        await strapi.db.query(VOTE_UID as any).create({
          data: {
            voteKey,
            actorKey: actor.key,
            actorName: actor.name,
            entityType: "post",
            entityId: id,
            value,
            ...(actor.userId ? { user: actor.userId } : {}),
          },
        });
      }

      const updatedPost = await strapi.db.query("api::post.post").update({
        where: { id },
        data: {
          score: (currentPost.score ?? 0) + scoreDelta,
        },
      });

      ctx.body = { data: { ...updatedPost, userVote } };
    },
  }),
);
