import fastify from 'fastify';
import mercurius from 'mercurius';
import db from './config/index';
import schema from './graphql/schema';
import resolvers from './graphql/resolver';
import { MeiliSearch } from 'meilisearch';
import courseCatalog from './models/courseCatalog';
import getCourses from './db';
import fastifyEnv from '@fastify/env';

const envSchema = {
  type: 'object',
  required: ['MONGODB_URI', 'MEILISEARCH_HOST', 'VANDERBILT_API_CATALOG', 'VANDERBILT_API_COURSE'],
  properties: {
    PORT: {
      type: 'number',
      default: 3000,
    },
    MONGODB_URI: {
      type: 'string',
    },
    VANDERBILT_API_CATALOG:{
      type: 'string',
    },
    VANDERBILT_API_COURSE:{
      type: 'string',
    },
    MEILISEARCH_HOST: {
      type: 'string',
    },
  },
};
const options = {
  confKey: 'config',
  dotenv: true,
  schema: envSchema,
  data: process.env,
};

const PORT: any = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const vanderbiltINFO = {
  VANDERBILT_API_CATALOG: process.env.VANDERBILT_API_CATALOG,
  VANDERBILT_API_COURSE: process.env.VANDERBILT_API_COURSE,
}


const app = fastify({ logger: true });

// setting MeiliSearch client

app.register(db, { uri: MONGODB_URI });
// make graphiql true to enable graphiql interface
app.register(mercurius, { schema, resolvers, graphiql: false });
app.register(fastifyEnv, options);

const start = async () => {
  try {
    // for fastifyEnv to work
    await app.ready();
    console.log(process.env);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();

// setting up MeiliSearch client
const client = new MeiliSearch({ host: MEILISEARCH_HOST });
// adding courses to meilisearch index
const addCoursesToIndex = async () => {
  const courses = await courseCatalog.find({});
  if (!courses) {
    // if db is empty, add courses from db
    await getCourses(vanderbiltINFO);
  }
  const res = await client.index('courses').addDocuments(courses);
  console.log(res);
};
addCoursesToIndex();
client.getTask(0);

app.get('/', async (request, reply) => {
  return { hello: 'world' };
});

app.get('/search/:q', async (request, reply) => {
  console.log(request.params);
  const { q }: any = request.params;
  if (q) {
    const courses = await client.index('courses').search(q);
    return { courses };
  } else {
    return { courses: {} };
  }
});

// figure out how to use PORT (error from process.env.PORT)
app.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
