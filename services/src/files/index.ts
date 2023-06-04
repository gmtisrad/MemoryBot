import { Request, Response, NextFunction } from 'express';

export function filesMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  next();
}
