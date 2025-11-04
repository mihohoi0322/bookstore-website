import Fastify from 'fastify';
import cors from '@fastify/cors';
import httpProxy from '@fastify/http-proxy';
import { loadConfig } from './config.js';

async function bootstrap() {
  const config = loadConfig();
  const server = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty'
      }
    }
  });

  await server.register(cors, {
    origin: true,
    credentials: true
  });

  await server.get('/healthz', async () => ({ status: 'ok' }));

  for (const service of config.services) {
    await server.register(httpProxy, {
      upstream: service.target,
      prefix: service.prefix,
      rewritePrefix: service.prefix,
      http2: false
    });

    server.log.info(
      {
        service: service.name,
        prefix: service.prefix,
        target: service.target
      },
      'registered proxy route'
    );
  }

  try {
    await server.listen({ port: config.port, host: '0.0.0.0' });
    server.log.info(`BFF server is running on port ${config.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

bootstrap();
