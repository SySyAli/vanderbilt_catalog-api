require('dotenv').config();

import fastify from 'fastify';
import mercurius from 'mercurius';
import db from './config/index';
import schema from './graphql/schema';
import resolvers from './graphql/resolver';
import { MeiliSearch } from 'meilisearch';
import courseCatalog from './models/courseCatalog';
import getCourses from './db';
import cors from '@fastify/cors';
import cron from 'node-cron';

console.log(process.env)
// Creates the fastify instance
const app = fastify({ logger: true });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const PORT: any = process.env.PORT || 8080;
// setting up MeiliSearch client
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_KEY;
//const client = new MeiliSearch({ host: 'http://localhost:7700' });

const client = new MeiliSearch({ host: MEILISEARCH_HOST, apiKey: MEILISEARCH_API_KEY });
console.log(MONGODB_URI);

// update 12AM Friday
cron.schedule('0 0 * * FRI', async () => {
  console.log('running cron job');
  await getCourses({
    VANDERBILT_API_CATALOG: process.env.VANDERBILT_API_CATALOG,
    VANDERBILT_API_COURSE: process.env.VANDERBILT_API_COURSE,
  });
});

// Handles the registration of cors, fastify-env, fastify-cron, and mercurius
const register = async () => {
  try {
    await app.register(cors, {
      origin: '*',
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await app.register(db, { uri: MONGODB_URI });
    // make graphiql true to enable graphiql interface
    await app.register(mercurius, { schema, resolvers, graphiql: false });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
register();

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

const start = async () => {
  try {
    await app.listen({port: PORT, host:'0.0.0.0'});
    app.log.info(`server listening on ${app.server.address()}`);
    app.log.info(`server listening on ${PORT}`);
    const courses = await courseCatalog.find({});


  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
