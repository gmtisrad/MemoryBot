import { IFolder } from '../../../types/app';

export function getAllFolders({
  folders,
  folderId,
}: {
  folders: IFolder[];
  folderId?: string;
}) {
  const allFolders: IFolder[] = [];

  if (!folderId) {
    return allFolders;
  }

  let currentFolder = folders?.find((folder) => folder._id === folderId);

  if (currentFolder) {
    allFolders.push(currentFolder);

    while (currentFolder && currentFolder.parent !== null) {
      const parentFolder = folders.find(
        (folder) => folder._id === currentFolder?.parent,
      );
      if (parentFolder) {
        allFolders.push(parentFolder);
        currentFolder = parentFolder;
      } else {
        break;
      }
    }

    return allFolders.filter((f) => !!f);
  }
  return [];
}

export const flattenFolders = ({ folders }: { folders?: any[] }) => {
  const flat: any[] = [];

  const traverse = (folder: any) => {
    flat.push(folder);
    if (folder.folders && folder.folders.length > 0) {
      for (const subFolder of folder.folders) {
        traverse(subFolder);
      }
    }
  };

  folders?.forEach(traverse);
  return flat;
};
