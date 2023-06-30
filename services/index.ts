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
import { usersRouter } from './src/users';
import { partnerRouter } from './src/partner';
import { casesRouter } from './src/cases';
import { llmRouter } from './src/llm';
import { chatsRouter } from './src/chats';

const PORT = 3001;

(async () => {
  const app = express();

  app.use(bodyParser.json());

  app.post('/api/wipe/milvus', async (req, res) => {
    // Removes all collections and rebuilds schema on startup
    await milvusCleanStart();

    res.send('Wiped');
  });

  app.post('/api/wipe/mongo', async (req, res) => {
    // Removes all collections and rebuilds schema on startup
    await mongoCleanStart();

    res.send('Wiped');
  });

  app.post('/api/wipe', async (req, res) => {
    // Removes all collections and rebuilds schema on startup
    await milvusCleanStart();
    await mongoCleanStart();

    res.send('Wiped');
  });

  app.use('/api/app', appRouter);

  app.use('/api/cases', casesRouter);

  app.use('/api/chats', chatsRouter);

  app.use('/api/llm', llmRouter);

  app.use('/api/db', dbRouter);

  app.use('/api/embedding', embeddingRouter);

  app.use('/api/files', filesRouter);

  app.use('/api/partner', partnerRouter);

  app.use('/api/vector', vectorDBRouter);

  app.use('/api/users', usersRouter);

  app.use((req, res) => {
    res.send('Hello World!');
  });

  app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
})();
