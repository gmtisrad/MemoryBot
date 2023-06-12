import axios from 'axios';
import { useQuery } from 'react-query';

interface IUseGetCasesArgs {
  userId: string;
}

interface IUseGetCasesResponse {
  isLoading: boolean;
  error: any;
  data: any;
  refetch: () => void;
}

export const useGetCases: (args: IUseGetCasesArgs) => IUseGetCasesResponse = ({
  userId,
}) => {
  const { isLoading, error, data, refetch } = useQuery('cases', async () => {
    const casesRes = await axios.get(`/api/app/cases/user/${userId}`);

    return casesRes.data;
  });

  return { isLoading, error, data: data || { cases: [] }, refetch };
};
