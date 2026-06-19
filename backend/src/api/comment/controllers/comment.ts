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
      name: asString(user.username) || asString(user.email) || 'anonymous',
      userId: user.id,
    };
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

  const normalizedActorKey = normalizeActorKey(actorKeyInput);
  if (!normalizedActorKey) {
    return null;
  }

  const actorName =
    asString(body.actorName) ||
    asHeaderValue(headers, 'x-reddit-actor-name') ||
    asString(ctx.query?.actorName) ||
    'anonymous';

  return { key: `actor:${normalizedActorKey}`, name: actorName };
}

const VOTE_UID = 'api::vote.vote';

export default factories.createCoreController(
  'api::comment.comment',
  ({ strapi }) => ({
    async vote(ctx) {
      const actor = getActorFromContext(ctx);
      if (!actor) {
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

      const voteKey = `comment:${id}:${actor.key}`;
      const existingVote = await strapi.db.query(VOTE_UID as any).findOne({
        where: { voteKey },
        select: ['id', 'value'],
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
            entityType: 'comment',
            entityId: id,
            value,
            ...(actor.userId ? { user: actor.userId } : {}),
          },
        });
      }

      const updatedComment = await strapi.db.query('api::comment.comment').update({
        where: { id },
        data: {
          score: (currentComment.score ?? 0) + scoreDelta,
        },
      });

      ctx.body = { data: { ...updatedComment, userVote } };
    },
  }),
);
