require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('./routes');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 8080,
    host: '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
        additionalHeaders: ['Authorization', 'Content-Type']
      },
    },
  });

  server.route(routes);

  server.ext('onRequest', (request, h) => {
    console.log(`Request received: ${request.method.toUpperCase()} ${request.path}`);
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
