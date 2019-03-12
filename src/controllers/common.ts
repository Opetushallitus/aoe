import { Request, Response } from "express";

import RedisWrapper from "../utils/redis-wrapper";

const client = new RedisWrapper();

export const getData = async (req: Request, res: Response) => {
  const input = JSON.parse(await client.get(req.params.key));
  const output: object[] = [];

  input.map((row: any) => {
    if (row.value[req.params.lang] !== undefined) {
      output.push({
        "key": row.key,
        "value": row.value[req.params.lang],
      });
    }
  });

  if (output.length > 0) {
    res.status(200).json(output);
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
