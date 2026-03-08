import { createClient, RedisClientType } from "redis";

let client: RedisClientType | null = null;

function getClient(): RedisClientType {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    }) as RedisClientType;
    client.on("error", (err) => console.error("Redis Client Error", err));
  }
  return client;
}

const redisClient = {
  async connect() {
    const c = getClient();
    if (!c.isOpen) await c.connect();
  },
  async setEx(key: string, seconds: number, value: string) {
    const c = getClient();
    if (!c.isOpen) await c.connect();
    return c.setEx(key, seconds, value);
  },
  async get(key: string) {
    const c = getClient();
    if (!c.isOpen) await c.connect();
    return c.get(key);
  },
  async del(key: string) {
    const c = getClient();
    if (!c.isOpen) await c.connect();
    return c.del(key);
  },
  async flushDb() {
    const c = getClient();
    if (!c.isOpen) await c.connect();
    return c.flushDb();
  },
  async ping() {
    const c = getClient();
    if (!c.isOpen) await c.connect();
    return c.ping();
  },
  async quit() {
    if (client?.isOpen) await client.quit();
    client = null;
  },
};

export default redisClient;
