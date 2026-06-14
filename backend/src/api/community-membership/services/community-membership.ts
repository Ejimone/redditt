import { factories } from "@strapi/strapi";

const MEMBERSHIP_UID = "api::community-membership.community-membership";

export default factories.createCoreService(MEMBERSHIP_UID as any);
