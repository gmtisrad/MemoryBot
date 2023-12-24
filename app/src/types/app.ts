import { ReactNode } from 'react';

export interface IFolder {
  _id: string;
  type: string;
  parent: string;
}

export interface IPage {
  title: string;
  icon: ReactNode;
}

export interface IProject {}
