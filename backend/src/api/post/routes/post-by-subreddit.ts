export default {
  routes: [
    {
      method: "GET",
      path: "/posts/by-subreddit/:slug",
      handler: "post.bySubreddit",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
