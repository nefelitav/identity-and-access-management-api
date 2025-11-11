export interface CacheStrategy {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
}

export class RedisCacheStrategy implements CacheStrategy {
  // Export for serviceFactory
  constructor(
    private redis: any,
    private logger: any,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      this.logger.error("Cache clear error:", error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }
}

export class InMemoryCacheStrategy implements CacheStrategy {
  private cache = new Map<string, { value: any; expires?: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expires = ttl ? Date.now() + ttl * 1000 : undefined;
    this.cache.set(key, { value, expires });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;

    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

export class CacheService {
  private strategy: CacheStrategy;
  private logger: any;

  constructor(strategy: CacheStrategy, logger: any) {
    this.strategy = strategy;
    this.logger = logger;
  }

  async get<T>(key: string): Promise<T | null> {
    return this.strategy.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    return this.strategy.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    return this.strategy.delete(key);
  }

  async clear(): Promise<void> {
    return this.strategy.clear();
  }

  async exists(key: string): Promise<boolean> {
    return this.strategy.exists(key);
  }

  // Cache patterns
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    // This would need to be implemented based on the cache strategy
    this.logger.warn(
      `Pattern invalidation not implemented for pattern: ${pattern}`,
    );
  }

  // Cache decorators
  static cache<T>(keyGenerator: (...args: any[]) => string, ttl?: number) {
    return function (
      target: any,
      _propertyName: string,
      descriptor: PropertyDescriptor,
    ) {
      const method = descriptor.value;
      const cacheService = target.cacheService as CacheService;

      descriptor.value = async function (...args: any[]) {
        const key = keyGenerator(...args);
        const cached = await cacheService.get<T>(key);

        if (cached !== null) {
          return cached;
        }

        const result = await method.apply(this, args);
        await cacheService.set(key, result, ttl);
        return result;
      };
    };
  }
}
