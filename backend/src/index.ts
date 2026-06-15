import type { Core } from "@strapi/strapi";
import { seedDatabase } from "./seed";

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
    await seedDatabase(strapi);
  },
};
