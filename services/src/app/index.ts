import { Request, Response, NextFunction } from 'express';

export function appMiddleware(req: Request, res: Response, next: NextFunction) {
  next();
}
