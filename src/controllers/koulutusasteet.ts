import { NextFunction, Request, Response } from "express";

import { getDataFromApi } from "../util/api.utils";
import { getAsync, setAsync } from "../util/redis.utils";

const endpoint = "edtech/codeschemes/Koulutusaste";
const rediskey = "koulutusasteet";
const params = "codes/?format=json";

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 *
 * @todo Implement error handling
 */
export async function setKoulutusasteet(): Promise<any> {
  const results = await getDataFromApi(
    process.env.KOODISTOT_SUOMI_URL,
    `/${endpoint}/`,
    { "Accept": "application/json" },
    params
  );
  const data: any[] = [];

  results.results.map((result: any) => {
    data.push({
      key: result.id,
      parent: ("broaderCode" in result) ? result.broaderCode.id : undefined,
      value: {
        fi: result.prefLabel.fi,
        en: result.prefLabel.en,
        sv: result.prefLabel.sv,
      }
    });
  });

  await setAsync(rediskey, JSON.stringify(data));
}

/**
 * Get data from redis database
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<any>}
 */
export const getKoulutusasteet = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const redisData = await getAsync(rediskey);

  if (redisData) {
    const input = JSON.parse(redisData);
    const output: any[] = [];

    input.map((row: any) => {
      let children = input.filter((e: any) => e.parent === row.key);

      children = children.map((child: any) => {
        return {
          key: child.key,
          value: child.value[req.params.lang] != undefined ? child.value[req.params.lang] : child.value.fi
        };
      });

      if (row.parent === undefined) {
        output.push({
          key: row.key,
          value: row.value[req.params.lang] != undefined ? row.value[req.params.lang] : row.value.fi,
          children: children,
        });
      }
    });

    if (output.length > 0) {
      res.status(200).json(output);
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(404);

    return next();
  }
};

export const getKoulutusasteetNew = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const redisData = await getAsync(rediskey);

  if (redisData) {
    const input = JSON.parse(redisData);

    const output = input.map((row: any) => {
      return {
        key: row.key,
        parent: row.parent,
        value: row.value[req.params.lang] != undefined ? row.value[req.params.lang] : row.value.fi,
      };
    });

    if (output.length > 0) {
      res.status(200).json(output);
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(404);

    return next();
  }
};

/**
 * Get single row from redis database key-value
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<any>}
 */
export const getKoulutusaste = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const redisData = await getAsync(rediskey);

  if (redisData) {
    const input = JSON.parse(redisData);
    const row = input.find((e: any) => e.key === req.params.key);
    let output: object;

    if (row != undefined) {
      output = {
        key: row.key,
        parent: row.parent,
        value: row.value[req.params.lang] != undefined ? row.value[req.params.lang] : row.value.fi,
      };
    }

    if (output != undefined) {
      res.status(200).json(output);
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(404);

    return next();
  }
};

/**
 * Get children of parent from redis database
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<any>}
 */
export const getKoulutusasteetChildren = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const redisData = await getAsync(rediskey);

  if (redisData) {
    const input = JSON.parse(redisData);
    const output: any[] = [];

    input.map((row: any) => {
      if (row.parent != undefined && row.parent === req.params.key) {
        output.push({
          key: row.key,
          parent: row.parent,
          value: row.value[req.params.lang] != undefined ? row.value[req.params.lang] : row.value.fi,
        });
      }
    });

    if (output.length > 0) {
      res.status(200).json(output);
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(404);

    return next();
  }
};

/**
 * Get children of parent from redis database
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<any>}
 */
export const getKoulutusasteetParents = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const redisData = await getAsync(rediskey);

  if (redisData) {
    const input = JSON.parse(redisData);
    const output: any[] = [];

    input.map((row: any) => {
      if (row.parent === undefined) {
        output.push({
          key: row.key,
          value: row.value[req.params.lang] != undefined ? row.value[req.params.lang] : row.value.fi,
        });
      }
    });

    if (output.length > 0) {
      res.status(200).json(output);
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(404);

    return next();
  }
};
