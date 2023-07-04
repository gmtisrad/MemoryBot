export interface ICreateCaseArgs {
  caseName: string;
  userId: string;
}

export interface ICreateCaseFolderArgs {
  caseId: string;
  folderName: string;
  parent: string | null;
  type: string;
}

export interface IGetUserCasesArgs {
  userId: string;
}

export interface IStructureFoldersArgs {
  folders: any[];
  documents: any[];
}

export interface IGetCaseArgs {
  caseId: string;
}
