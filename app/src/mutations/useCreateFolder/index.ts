import axios from 'axios';
import { useCallback, useState } from 'react';

interface IUseCreateFolderArgs {
  caseId: string;
  parentId?: string;
  name: string;
  userId: string;
  refetch?: () => void;
}

interface IUseCreateFolderRes {
  data: any;
  isLoading: boolean;
  error: any;
  createFolder: () => Promise<void>;
}

export const useCreateFolder: (
  args: IUseCreateFolderArgs,
) => IUseCreateFolderRes = ({ caseId, name, parentId, refetch }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const createFolder = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.post('/api/cases/folder/create', {
        caseId,
        folderName: name,
        parent: parentId,
      });

      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setIsLoading(false);
      if (refetch) refetch();
    }
  }, [caseId, name, parentId, refetch]);

  return { data, isLoading, error, createFolder };
};
