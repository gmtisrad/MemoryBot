import { Request, Response, NextFunction } from 'express';

export function embeddingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  next();
}
