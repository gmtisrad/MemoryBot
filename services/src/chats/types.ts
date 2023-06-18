import { ObjectId } from 'mongodb';

export interface ICreateChatArgs {
  userId: ObjectId;
  caseId: ObjectId;
  name: string;
}

export interface ICreateChatResponse {
  chatId: ObjectId;
}

export interface IInsertMessageArgs {
  chatId: ObjectId;
  messages: IMessage[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IInsertMessageResponse {}

export interface IGetChatsArgs {
  userId: ObjectId;
}

export interface IGetChatsResponse {
  chats: any[];
}

export interface IMessage {
  id: ObjectId;
  isUser: boolean;
  content: string;
}
