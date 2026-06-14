export default {
  routes: [
    {
      method: "POST",
      path: "/posts/:id/vote",
      handler: "post.vote",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
