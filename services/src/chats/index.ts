import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongoInit';
import express from 'express';
import { createChat } from './helpers';

export const chatsRouter = express.Router();

chatsRouter.post('/create', async (req, res) => {
  const { userId, caseId, name } = req.body;

  await createChat({
    userId: new ObjectId(userId),
    caseId: new ObjectId(caseId),
    name,
  });

  res.json({ status: 'success' });
});

chatsRouter.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  const mongoDB = await getDb();

  const chats = await mongoDB
    .collection('chats')
    .find({ userId: new ObjectId(userId) })
    .toArray();

  const chatsByCase = chats.reduce((acc: any, chat: any) => {
    if (!acc[chat.caseId]) {
      acc[chat.caseId] = [];
    }

    acc[chat.caseId].push(chat);

    return acc;
  }, {});

  res.json({ chats: chatsByCase });
});
