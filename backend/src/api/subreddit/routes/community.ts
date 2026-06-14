export default {
  routes: [
    {
      method: "GET",
      path: "/communities",
      handler: "subreddit.listCommunities",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/communities",
      handler: "subreddit.createCommunity",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/communities/me/joined",
      handler: "subreddit.myCommunities",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/communities/:slug",
      handler: "subreddit.bySlug",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/communities/:slug",
      handler: "subreddit.updateBySlug",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/communities/:slug",
      handler: "subreddit.deleteBySlug",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/communities/:slug/join",
      handler: "subreddit.join",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/communities/:slug/leave",
      handler: "subreddit.leave",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/communities/:slug/membership",
      handler: "subreddit.membership",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/communities/:slug/members",
      handler: "subreddit.members",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/communities/:slug/posts",
      handler: "subreddit.listPosts",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/communities/:slug/posts",
      handler: "subreddit.createPost",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/communities/:slug/posts/:postId",
      handler: "subreddit.getPost",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/communities/:slug/posts/:postId",
      handler: "subreddit.updatePost",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/communities/:slug/posts/:postId",
      handler: "subreddit.deletePost",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/communities/:slug/posts/:postId/comments",
      handler: "subreddit.listComments",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/communities/:slug/posts/:postId/comments",
      handler: "subreddit.createComment",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/communities/:slug/posts/:postId/comments/:commentId",
      handler: "subreddit.updateComment",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/communities/:slug/posts/:postId/comments/:commentId",
      handler: "subreddit.deleteComment",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
