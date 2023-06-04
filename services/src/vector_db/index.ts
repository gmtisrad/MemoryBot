import { Request, Response, NextFunction } from 'express';

export function vectorDBMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  next();
}
