require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('./routes');
// const authenticate = require('./authenticate');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 8080,
    // host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    host: process.env.NODE_ENV = '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Menggunakan middleware autentikasi
  // server.ext('onRequest', authenticate);

  server.route(routes);
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
