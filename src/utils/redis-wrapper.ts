const redis = require("async-redis"); // no TypeScript typings

export default class RedisWrapper {
  private client: any;

  constructor() {
    this.client = redis.createClient();
  }

  public async setToRedis(key: string, obj: object) {
    await this.client.set(key, JSON.stringify(obj));
  }

  public async getFromRedis(key: string) {
    const data = await this.client.get(key);

    return JSON.parse(data);
  }

  public async getAllFromRedis() {
    const data = await this.client.keys("*");

    return JSON.parse(data);
  }

  public exists(key: string) {
    return this.client.exists(key);
  }

  public select(database: number): void {
    this.client.select(database);
  }
}
