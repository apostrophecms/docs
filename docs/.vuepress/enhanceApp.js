const { entries } = require('./gitbook-redirects.json');

export default ({ router }) => {
  router.addRoutes([
    {
      path: '/guide/module-format-example.html',
      redirect: '/reference/module-api/example.html'
    }
  ].concat(entries));
};
