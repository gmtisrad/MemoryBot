import express from 'express';
import { getDb } from './mongoInit';

export const dbRouter = express.Router();

export const createEntry = async () => {
  const mongoDB = await getDb();
};
