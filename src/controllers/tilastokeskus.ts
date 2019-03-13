import { NextFunction, Request, Response } from "express";

import RedisWrapper from "../utils/redis-wrapper";
import tieteenalat from "../data/tieteenalat.json";

const client = new RedisWrapper();

export async function setTieteenalat() {
  try {
    await client.set("tieteenalat", JSON.stringify(tieteenalat));
  } catch (error) {
    console.error(error);
  }
}

export const getTieteenalat = async (req: Request, res: Response, next: NextFunction) => {
  if (await client.exists("tieteenalat") !== true) {
    res.sendStatus(404);

    return next();
  }

  res.status(200).json(JSON.parse(await client.get("tieteenalat")));
};
