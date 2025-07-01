import { Request, Response, NextFunction } from 'express';

// basically https://github.com/Abazhenov/express-async-handler,
// but since it's ~one-liner, don't add a dependency

export function asyncHandler(handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction): Promise<unknown> => {
    return handler(req, res, next).catch(next);
  };
}
