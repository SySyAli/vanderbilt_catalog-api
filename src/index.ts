import fastify from 'fastify';

const PORT = process.env.PORT || 3000;

const app = fastify({ logger: true });

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
