import fp from 'fastify-plugin';
import mongoose from 'mongoose';
import courseCatalog from '../models/courseCatalog';

const models = { courseCatalog };

const ConnectDB = async (fastify, options) => {
  try {
    mongoose.connection.on('connected', () => {
      fastify.log.info({ actor: 'MongoDB' }, 'MongoDB connected');
    });
    mongoose.connection.on('error', (err) => {
      fastify.log.error({ actor: 'MongoDB' }, `MongoDB connection error: ${err}`);
    });
    mongoose.connection.on('disconnected', () => {
      fastify.log.info({ actor: 'MongoDB' }, 'MongoDB disconnected');
    });

    const db = await mongoose.connect(options.uri);

    fastify.decorate('db', {models});

  } catch (err) {
    console.error(err);
  }
};

export default fp(ConnectDB);