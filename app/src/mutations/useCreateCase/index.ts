import axios from 'axios';
import { useCallback, useState } from 'react';

interface IUseCreateCaseArgs {
  caseName: string;
  userId: string;
  refetch?: () => void;
}

interface IUseCreateCaseResponse {
  data: any;
  error: any;
  isLoading: boolean;
  createCase: () => Promise<void>;
}

export const useCreateCase: (
  args: IUseCreateCaseArgs,
) => IUseCreateCaseResponse = ({ caseName, userId, refetch }) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createCase = useCallback(async () => {
    try {
      setIsLoading(true);

      const data = await axios.post('/api/cases/create', {
        caseName,
        userId,
      });

      setData(data);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setIsLoading(false);
      if (refetch) refetch();
    }
  }, [caseName, refetch, userId]);

  return { data, error, isLoading, createCase };
};
