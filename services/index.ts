import './env-config';
import express from 'express';
import bodyParser from 'body-parser';
import { filesRouter } from './src/files';
import { appRouter } from './src/app';
import { dbRouter } from './src/db';
import { vectorDBRouter } from './src/vector_db';
import { embeddingRouter } from './src/embedding';
import { cleanStart as milvusCleanStart } from './src/vector_db/milvusInit';
import { cleanStart as mongoCleanStart } from './src/db/mongoInit';

const PORT = 3000;

(async () => {
  const app = express();

  app.use(bodyParser.json());

  app.post('/wipe', async (req, res) => {
    // Removes all collections and rebuilds schema on startup
    await milvusCleanStart();
    await mongoCleanStart();

    res.send('Wiped');
  });

  app.use('/files', filesRouter);

  app.use('/app', appRouter);

  app.use('/db', dbRouter);

  app.use('/vector', vectorDBRouter);

  app.use('/embeddings', embeddingRouter);

  app.use((req, res) => {
    res.send('Hello World!');
  });

  app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
})();
