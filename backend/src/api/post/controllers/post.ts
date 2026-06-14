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

function hasActorIdentity(ctx: {
  state?: { user?: unknown };
  query?: Record<string, unknown>;
  request?: { headers?: Record<string, unknown>; body?: unknown };
}): boolean {
  const user = ctx.state?.user as { id?: number } | undefined;
  if (user && Number.isInteger(user.id)) {
    return true;
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

  return Boolean(normalizeActorKey(actorKeyInput));
}

export default factories.createCoreController(
  "api::post.post",
  ({ strapi }) => ({
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
      if (!hasActorIdentity(ctx)) {
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

      const updatedPost = await strapi.db.query("api::post.post").update({
        where: { id },
        data: {
          score: (currentPost.score ?? 0) + value,
        },
      });

      ctx.body = { data: updatedPost };
    },
  }),
);
