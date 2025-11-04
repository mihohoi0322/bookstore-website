import Fastify from 'fastify';
import { config as loadEnv } from 'dotenv';
import { ensureCatalogSeed } from '@bookstore/shared';
import { registerCatalogRoutes } from './routes/catalog.js';

loadEnv();

export async function buildServer() {
  await ensureCatalogSeed();

  const server = Fastify({
    logger: true
  });

  server.get('/healthz', async () => ({ status: 'ok' }));

  await server.register(registerCatalogRoutes, { prefix: '/catalog' });
  return server;
}

async function bootstrap() {
  const server = await buildServer();
  const port = Number(process.env.PORT ?? '4101');

  await server.listen({ port, host: '0.0.0.0' });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  bootstrap().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
