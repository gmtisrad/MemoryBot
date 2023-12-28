import { ReactNode } from 'react';

export interface IFolder {
  _id: string;
  type: string;
  name: string;
  parent: string;
  folders: IFolder[];
  documents: IDocument[];
  caseId: string; // TODO: Rename to projectId
}

export interface IPage {
  title: string;
  icon: ReactNode;
}

export interface IDocument {
  _id: string;
  name: string;
}

export interface INotes {
  _id: string;
  name: string;
}

export interface IChat {
  _id: string;
  name: string;
}

export interface IGeneratedDocument {
  _id: string;
  documentType: string;
}

export interface IProject {
  _id: string;
  name: string;
  folders: IFolder[];
  documents: IDocument[];
  generatedDocuments: IGeneratedDocument[];
  notes: INotes[];
  chats: IChat[];
}
