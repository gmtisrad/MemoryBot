import { Request, Response, NextFunction } from 'express';

export function dbMiddleware(req: Request, res: Response, next: NextFunction) {
  next();
}
