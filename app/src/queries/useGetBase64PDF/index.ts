import axios from 'axios';
import { useQuery } from 'react-query';

export const useGetBase64PDF = ({ documentId }: { documentId?: string }) => {
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: 'pdf',
    queryFn: async () => {
      const casesRes = await axios.get(`/api/files/download/${documentId}/uri`);

      return casesRes.data;
    },
    refetchInterval: Infinity,
    refetchOnWindowFocus: false,
  });

  return { isLoading, error, data, refetch };
};
