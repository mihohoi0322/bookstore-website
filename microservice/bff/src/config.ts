import { config as loadEnv } from 'dotenv';

loadEnv();

export interface ServiceConfig {
  name: string;
  prefix: string;
  target: string;
}

export interface AppConfig {
  port: number;
  services: ServiceConfig[];
}

const useDaprProxy = process.env.USE_DAPR_PROXY === 'true';
const daprHost = process.env.DAPR_HTTP_HOST ?? 'http://127.0.0.1';
const daprPort = process.env.DAPR_HTTP_PORT ?? '3500';

const defaultServices: ServiceConfig[] = [
  {
    name: 'catalog',
    prefix: '/catalog',
    target: useDaprProxy
      ? `${daprHost}:${daprPort}/v1.0/invoke/catalog-service/method`
      : process.env.CATALOG_SERVICE_URL ?? 'http://localhost:4101'
  },
  {
    name: 'cart',
    prefix: '/cart',
    target: useDaprProxy
      ? `${daprHost}:${daprPort}/v1.0/invoke/cart-service/method`
      : process.env.CART_SERVICE_URL ?? 'http://localhost:4102'
  },
  {
    name: 'order',
    prefix: '/order',
    target: useDaprProxy
      ? `${daprHost}:${daprPort}/v1.0/invoke/order-service/method`
      : process.env.ORDER_SERVICE_URL ?? 'http://localhost:4103'
  },
  {
    name: 'admin',
    prefix: '/admin',
    target: useDaprProxy
      ? `${daprHost}:${daprPort}/v1.0/invoke/admin-service/method`
      : process.env.ADMIN_SERVICE_URL ?? 'http://localhost:4104'
  }
];

export function loadConfig(): AppConfig {
  const port = Number(process.env.PORT ?? '4000');

  return {
    port,
    services: defaultServices
  };
}
