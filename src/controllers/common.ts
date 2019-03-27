import { NextFunction, Request, Response } from "express";
import rp from "request-promise";

import RedisWrapper from "../utils/redis-wrapper";
import { HttpHeaders } from "../models/httpheaders";

const client = new RedisWrapper();

export async function getDataFromApi(api: string, route: string, headers: HttpHeaders): Promise<any> {
  const options = {
    url: `${api}${route}`,
    headers: headers
  };

  const body = await rp.get(options);

  if (headers.Accept === "application/json") {
    return JSON.parse(body);
  } else {
    return body;
  }
}

export const getData = async (req: Request, res: Response, next: NextFunction) => {
  if (await client.exists(req.params.key) !== true) {
    res.sendStatus(404);

    return next();
  }

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
  const deleteStatus = client.del(req.params.key);

  if (deleteStatus > 0) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
};
