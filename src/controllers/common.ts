import { Request, Response } from "express";

import RedisWrapper from "../utils/redis-wrapper";

const client = new RedisWrapper();

export const getData = async (req: Request, res: Response) => {
  const data = await client.get(req.params.key);

  if (data !== null) {
    res.status(200).json(JSON.parse(data));
  } else {
    res.sendStatus(404);
  }
};
