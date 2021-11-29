export default ({ router }) => {
  router.addRoutes([
    {
      path: '/guide/module-format-example.html',
      redirect: '/reference/module-api/example.html'
    },
    {
      path: '/guide/upgrading.html',
      redirect: '/guide/migration/overview.html'
    },
    {
      path: '/guide/migration/',
      redirect: '/guide/migration/overview.html'
    }
  ]);
};
