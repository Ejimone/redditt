import { factories } from "@strapi/strapi";

const MEMBERSHIP_UID = "api::community-membership.community-membership";

export default factories.createCoreRouter(MEMBERSHIP_UID as any);
