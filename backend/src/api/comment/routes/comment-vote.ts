export default {
  routes: [
    {
      method: 'POST',
      path: '/comments/:id/vote',
      handler: 'comment.vote',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
