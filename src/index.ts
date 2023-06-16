import fastify from 'fastify';
import mercurius from 'mercurius';
import db from './config/index';
import schema from './graphql/schema';
import resolvers from './graphql/resolver';

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODBI_URI || 'mongodb://localhost:27017';

const app = fastify({ logger: true });

app.register(db, {uri: 'mongodb://localhost:27017'})
app.register(mercurius, { schema, resolvers, graphiql: true })

app.get('/', async (request, reply) => {
  return { hello: 'world' };
});

// figure out how to use PORT (error from process.env.PORT)
app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
