import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongoInit';

interface ICreateChatArgs {
  userId: ObjectId;
  caseId: ObjectId;
  name: string;
}

interface ICreateChatResponse {
  chatId: ObjectId;
}

export interface IMessage {
  id: ObjectId;
  isUser: boolean;
  content: string;
}

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

interface IInsertMessageArgs {
  chatId: ObjectId;
  messages: IMessage[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IInsertMessageResponse {}

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

interface IGetChatsArgs {
  userId: ObjectId;
}

interface IGetChatsResponse {
  chats: any[];
}

export const getChats: (
  args: IGetChatsArgs,
) => Promise<IGetChatsResponse> = async ({ userId }) => {
  const db = await getDb();

  const chats = await db.collection('chats').find({ userId }).toArray();

  return { chats };
};
