import { create } from 'zustand';

interface IAppStore {
  isAddCaseModalOpen: boolean;
  toggleIsAddCaseModalOpen: () => void;

  isAddFolderModalOpen: boolean;
  toggleIsAddFolderModalOpen: (args: {
    folderId?: string;
    caseId?: string;
  }) => void;

  isAddDocumentModalOpen: boolean;
  toggleIsAddDocumentModalOpen: (args: {
    folderId?: string;
    caseId?: string;
  }) => void;

  relevantFolderId?: string;
  relevantCaseId?: string;
}

export const useAppStore = create<IAppStore>((set) => ({
  isAddCaseModalOpen: false,
  toggleIsAddCaseModalOpen: () =>
    set((state) => ({ isAddCaseModalOpen: !state.isAddCaseModalOpen })),

  isAddFolderModalOpen: false,
  toggleIsAddFolderModalOpen: ({ folderId, caseId }) =>
    set((state) => ({
      ...state,
      isAddFolderModalOpen: !state.isAddFolderModalOpen,
      relevantFolderId: state.isAddFolderModalOpen ? undefined : folderId,
      relevantCaseId: state.isAddFolderModalOpen ? undefined : caseId,
    })),

  isAddDocumentModalOpen: false,
  toggleIsAddDocumentModalOpen: ({ folderId, caseId }) =>
    set((state) => ({
      ...state,
      isAddDocumentModalOpen: !state.isAddDocumentModalOpen,
      relevantFolderId: state.isAddFolderModalOpen ? undefined : folderId,
      relevantCaseId: state.isAddFolderModalOpen ? undefined : caseId,
    })),
}));
