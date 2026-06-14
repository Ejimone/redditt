import "server-only";

export type SessionUserLike = {
  name?: string | null;
  email?: string | null;
};

export type ActorIdentity = {
  actorKey: string;
  actorName: string;
};

function normalizeActorKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._:@-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function getActorIdentity(user: SessionUserLike): ActorIdentity {
  const rawKey =
    (user.email && user.email.trim()) ||
    (user.name && user.name.trim()) ||
    "";

  const actorKey = normalizeActorKey(rawKey);
  if (!actorKey) {
    throw new Error(
      "Unable to derive actor identity from session user. Missing email/name.",
    );
  }

  return {
    actorKey,
    actorName: user.name?.trim() || user.email?.trim() || "anonymous",
  };
}

export function getActorHeaders(user: SessionUserLike): HeadersInit {
  const actor = getActorIdentity(user);

  return {
    "x-reddit-actor-key": actor.actorKey,
    "x-reddit-actor-name": actor.actorName,
  };
}

export function appendActorQuery(path: string, user: SessionUserLike): string {
  const actor = getActorIdentity(user);
  const separator = path.includes("?") ? "&" : "?";
  const params = new URLSearchParams({
    actorKey: actor.actorKey,
    actorName: actor.actorName,
  });

  return `${path}${separator}${params.toString()}`;
}
