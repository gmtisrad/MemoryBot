import axios from 'axios';
import { useCallback, useState } from 'react';

interface IUseUploadDocumentArgs {
  userId: string;
  folderId: string;
  caseId: string;
  file: File | null;
  refetch?: () => void;
}

interface IUseUploadDocumentReturn {
  isLoading: boolean;
  error: any;
  uploadDocument: () => Promise<void>;
}

export const useUploadDocument = ({
  userId,
  folderId,
  caseId,
  file,
  refetch,
}: IUseUploadDocumentArgs): IUseUploadDocumentReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const uploadDocument = useCallback(async () => {
    const formData = new FormData();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    formData.append('file', file!);
    formData.append('userId', userId);
    formData.append('folderId', folderId);
    formData.append('caseId', caseId);

    setIsLoading(true);
    setError(null);

    try {
      await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      if (refetch) refetch();
    }
  }, [file, userId, folderId, caseId, refetch]);

  return { isLoading, error, uploadDocument };
};
