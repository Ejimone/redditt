import { factories } from '@strapi/strapi';

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asHeaderValue(
  headers: Record<string, unknown> | undefined,
  key: string,
): string {
  if (!headers) {
    return '';
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
    .replace(/[^a-z0-9._:@-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
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
    ctx.request?.headers && typeof ctx.request.headers === 'object'
      ? (ctx.request.headers as Record<string, unknown>)
      : undefined;

  const body =
    ctx.request?.body && typeof ctx.request.body === 'object'
      ? (ctx.request.body as Record<string, unknown>)
      : {};

  const actorKeyInput =
    asString(body.actorKey) ||
    asHeaderValue(headers, 'x-reddit-actor-key') ||
    asString(ctx.query?.actorKey);

  return Boolean(normalizeActorKey(actorKeyInput));
}

export default factories.createCoreController(
  'api::comment.comment',
  ({ strapi }) => ({
    async vote(ctx) {
      if (!hasActorIdentity(ctx)) {
        return ctx.unauthorized('Please sign in to vote.');
      }

      const id = Number(ctx.params.id);
      const value = Number(ctx.request.body?.value);

      if (!Number.isInteger(id)) {
        return ctx.badRequest('Invalid comment id.');
      }

      if (value !== 1 && value !== -1) {
        return ctx.badRequest('Vote value must be either 1 or -1.');
      }

      const currentComment = await strapi.db
        .query('api::comment.comment')
        .findOne({
          where: { id },
          select: ['id', 'score'],
        });

      if (!currentComment) {
        return ctx.notFound('Comment not found.');
      }

      const updatedComment = await strapi.db.query('api::comment.comment').update({
        where: { id },
        data: {
          score: (currentComment.score ?? 0) + value,
        },
      });

      ctx.body = { data: updatedComment };
    },
  }),
);
