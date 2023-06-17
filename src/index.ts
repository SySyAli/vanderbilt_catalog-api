import fastify from 'fastify';
import mercurius from 'mercurius';
import db from './config/index';
import schema from './graphql/schema';
import resolvers from './graphql/resolver';
import { MeiliSearch } from 'meilisearch';
import courseCatalog from './models/courseCatalog';
import getCourses from './db';

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODBI_URI || 'mongodb://localhost:27017';

const app = fastify({ logger: true });

// setting MeiliSearch client
const client = new MeiliSearch({ host: 'http://localhost:7700' });

app.register(db, { uri: 'mongodb://localhost:27017' });
app.register(mercurius, { schema, resolvers, graphiql: true });

// adding courses to meilisearch index
const addCoursesToIndex = async () => {
  const courses = await courseCatalog.find({});
  if (!courses) {
    // if db is empty, add courses from db
    await getCourses();
  }
  const res = await client.index('courses').addDocuments(courses);
  console.log(res);
};
addCoursesToIndex();
client.getTask(0);

app.get('/', async (request, reply) => {
  return { hello: 'world' };
});
/*
app.get('/search', async (request, reply) => {
  const client = new MeiliSearch({ host: 'http://localhost:7700' });
  const res = await client.index('courses').search(request.query.q);
  return res;
}
*/
// figure out how to use PORT (error from process.env.PORT)
app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
