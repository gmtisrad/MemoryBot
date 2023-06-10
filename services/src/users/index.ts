import { Router } from 'express';
import { createUser } from '../db';

export const usersRouter = Router();

usersRouter.post('/create', async (req, res) => {
  const { email } = req.body;

  const { acknowledged, insertedId } = await createUser({ email });

  res.json({ acknowledged, insertedId });
});