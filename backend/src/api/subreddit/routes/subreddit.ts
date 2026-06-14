import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::subreddit.subreddit", {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
