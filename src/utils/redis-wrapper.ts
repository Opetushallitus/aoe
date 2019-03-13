const redis = require("async-redis"); // no TypeScript typings

export default class RedisWrapper {
  private client: any;

  constructor() {
    this.client = redis.createClient();
  }

  public async set(key: string, data: string): Promise<string> {
    return await this.client.set(key, data);
  }

  public async get(key: string) {
    return await this.client.get(key);
  }

  public async exists(key: string): Promise<boolean> {
    return await this.client.exists(key) === 1;
  }

  public keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  public del(key: string): number {
    return this.client.del(key);
  }
}
