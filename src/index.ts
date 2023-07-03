import fastify from 'fastify';
import mercurius from 'mercurius';
import db from './config/index';
import schema from './graphql/schema';
import resolvers from './graphql/resolver';
import { MeiliSearch } from 'meilisearch';
import courseCatalog from './models/courseCatalog';
import getCourses from './db';
import fastifyEnv from '@fastify/env';
import cors from '@fastify/cors';
import fastifyCron from 'fastify-cron';

// TODO: figure out how to get the cron job to run every 30 seconds
// TODO: add mongodb atlas

// Creates the fastify instance
const app = fastify({ logger: true });

// Schema for .env var
const envSchema = {
  type: 'object',
  required: [
    'MONGODB_URI',
    'PORT',
    'MEILISEARCH_HOST',
    'VANDERBILT_API_CATALOG',
    'VANDERBILT_API_COURSE',
  ],
  properties: {
    PORT: {
      type: 'number',
      default: 3000,
    },
    MONGODB_URI: {
      type: 'string',
    },
    VANDERBILT_API_CATALOG: {
      type: 'string',
    },
    VANDERBILT_API_COURSE: {
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

// Handles the registration of cors, fastify-env, fastify-cron, and mercurius
const register = async () => {
  try {
    await app.register(cors, {
      origin: '*',
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    await app.register(fastifyEnv, options);
    await app.after();

    // This env works
    console.log(process.env);

    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

    await app.register(db, { uri: MONGODB_URI });

    // make graphiql true to enable graphiql interface
    await app.register(mercurius, { schema, resolvers, graphiql: false });

    console.log('task 0');
    // register fastify-cron and create a cron job that will run every 30 seconds
    app.register(fastifyCron, {
      jobs: [
        {
          name: 'every-30-seconds',
          cronTime: '* * * * * *',
          onTick: () => {
            console.log('running a task every 30 seconds');
          },
        },
      ],
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
register();

// setting up MeiliSearch client
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
console.log({ MEILISEARCH_HOST });
const client = new MeiliSearch({ host: MEILISEARCH_HOST });

// adding courses to meilisearch index
const addCoursesToIndex = async () => {
  console.log('adding courses to index');
  /*
  await getCourses({
    VANDERBILT_API_CATALOG: process.env.VANDERBILT_API_CATALOG,
    VANDERBILT_API_COURSE: process.env.VANDERBILT_API_COURSE,
  });
  */
  const courses = await courseCatalog.find({});
  const res = await client.index('courses').addDocuments(courses);
  console.log('courses added to index');
  console.log(res);
};

addCoursesToIndex();


// API ENDPOINTS
app.get('/', async (request, reply) => {
  return { hello: 'world' };
});

app.get('/search/:q', async (request, reply) => {
  console.log(request.params);
  const { q }: any = request.params;
  if (q) {
    const courses = await client.index('courses').search(q);
    console.log(courses);
    return { courses };
  } else {
    return { courses: {} };
  }
});


const PORT: any = process.env.PORT || 3000;
(async () => {
  try {
    // figure out how to use PORT (error from process.env.PORT)

    console.log(process.env);
    app.listen({ port: PORT }, (err, address) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      app.cron.startAllJobs();
      console.log(`Server listening at ${address}`);
    });
  } catch (err) {
    console.error(err);
  }
})();

const start = async () => {
  try {
    await app.listen(PORT);
    app.log.info(`server listening on ${app.server.address()}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
