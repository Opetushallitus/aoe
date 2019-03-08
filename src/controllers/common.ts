import { Request, Response } from "express";

import RedisWrapper from "../utils/redis-wrapper";

const client = new RedisWrapper();

export const getData = async (req: Request, res: Response) => {
  let data = JSON.parse(await client.get(req.params.key));

  if (req.params.lang) {
    data = data.map((row: any) => {
      return {
        "key": row.key,
        "value": row.value[req.params.lang],
      };
    });
  }

  if (data !== null) {
    res.status(200).json(data);
  } else {
    res.sendStatus(404);
  }
};

export const deleteKey = async (req: Request, res: Response) => {
  const deleteStatus = await client.del(req.params.key);

  if (deleteStatus > 0) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
};
