import { factories } from "@strapi/strapi";

const VOTE_UID = "api::vote.vote";

export default factories.createCoreRouter(VOTE_UID as any);
