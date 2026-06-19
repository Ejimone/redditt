import { factories } from "@strapi/strapi";

const VOTE_UID = "api::vote.vote";

export default factories.createCoreService(VOTE_UID as any);
