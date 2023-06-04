import express from 'express';
import dotenv from 'dotenv';
import { filesMiddleware } from './files';
import { appMiddleware } from './app';
import { dbMiddleware } from './db';
import { vectorDBMiddleware } from './vector_db';
import { embeddingMiddleware } from './embedding';
import { cleanStart } from './vector_db/melvusInit';

dotenv.config();

(async () => {
  // Removes all collections and rebuilds schema on startup
  await cleanStart();

  const app = express();

  app.use(filesMiddleware);

  app.use(appMiddleware);

  app.use(dbMiddleware);

  app.use(vectorDBMiddleware);

  app.use(embeddingMiddleware);

  app.use((req, res) => {
    res.send('Hello World!');
  });

  app.listen('8081');
})();
