import { ObjectId } from 'mongodb';
import { IMessage } from '../chats/types';

export interface IPromptOpenAiArgs {
  prompt: string;
  numResults: string;
  previousMessages: any[];
  userId: string;
  caseId: string;
  chatId?: string;
}

export interface IPromptOpenAiGenerateDocumentArgs {
  caseDetails: string;
  numResults: string;
  previousMessages: IMessage[];
  cityName: string;
  stateName: string;
  documentType: string;
  partyA: string;
  partyB: string;
  sections: string[];
}

export interface ICreateGeneratedDocumentArgs {
  userId: ObjectId;
  caseId: ObjectId;
  generatedContent: string;
  caseDetails: string;
  cityName: string;
  stateName: string;
  documentType: string;
  partyA: string;
  partyB: string;
  sections?: string[];
}

export interface ICreateGeneratedDocumentRes {
  acknowledged: boolean;
  insertedId: ObjectId;
}
