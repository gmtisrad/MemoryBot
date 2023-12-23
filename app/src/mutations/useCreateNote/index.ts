import axios, { AxiosResponse } from 'axios';
import { UseMutationResult, useMutation } from 'react-query';

interface CreateNoteMutationArgs {
  caseId: string;
  folderId: string;
  userId: string;
}

export const useCreateNote = (): UseMutationResult<
  AxiosResponse<any, any>,
  unknown,
  CreateNoteMutationArgs,
  unknown
> => {
  const mutation = useMutation({
    mutationFn: ({ caseId, folderId, userId }: CreateNoteMutationArgs) => {
      return axios.post('/api/notes/create', {
        caseId,
        folderId,
        userId,
      });
    },
  });

  return mutation;
};
