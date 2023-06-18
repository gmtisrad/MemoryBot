import {
  ICreateChatArgs,
  ICreateChatResponse,
  IGetChatsArgs,
  IGetChatsResponse,
  IInsertMessageArgs,
  IInsertMessageResponse,
} from './types';
import { getDb } from '../db/mongoInit';

export const createChat: (
  args: ICreateChatArgs,
) => Promise<ICreateChatResponse> = async ({ userId, caseId, name }) => {
  const db = await getDb();

  const { insertedId } = await db.collection('chats').insertOne({
    userId,
    caseId,
    name,
    messages: [],
  });

  await db.collection('cases').updateOne(
    {
      _id: caseId,
    },
    {
      $push: {
        chats: insertedId,
      },
    },
  );

  return { chatId: insertedId };
};

export const insertMessages: (
  args: IInsertMessageArgs,
) => IInsertMessageResponse = async ({ chatId, messages }) => {
  const db = await getDb();

  await db.collection('chats').updateOne(
    {
      _id: chatId,
    },
    {
      $push: {
        messages: { $each: messages },
      },
    },
  );
};

export const getChats: (
  args: IGetChatsArgs,
) => Promise<IGetChatsResponse> = async ({ userId }) => {
  const db = await getDb();

  const chats = await db.collection('chats').find({ userId }).toArray();

  return { chats };
};
