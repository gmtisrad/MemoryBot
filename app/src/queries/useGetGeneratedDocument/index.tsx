import axios from 'axios';
import { useQuery } from 'react-query';

interface IUseGetGeneratedDocumentArgs {
  caseId?: string;
  generatedDocumentId?: string;
}

interface IUseGetGeneratedDocumentResponse {
  isLoading: boolean;
  error: any;
  data: any;
  refetch: () => void;
}

export const useGetGeneratedDocument = ({
  caseId,
  generatedDocumentId,
}: IUseGetGeneratedDocumentArgs): IUseGetGeneratedDocumentResponse => {
  const { isLoading, error, data, refetch } = useQuery(
    `getGeneratedDocument-${generatedDocumentId}`,
    async () => {
      const generatedDocsRes = await axios.get(
        `/api/app/partner/${caseId}/generated/${generatedDocumentId}`,
      );

      return generatedDocsRes.data;
    },
  );

  return { isLoading, error, data, refetch };
};
