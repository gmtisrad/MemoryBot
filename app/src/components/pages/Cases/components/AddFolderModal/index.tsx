import {
  Button,
  CircularProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import { TakeoverModal } from '../../../../shared/TakeoverModal';
import { useGetCases } from '../../../../../queries/useGetCases';
import { useCreateFolder } from '../../../../../mutations/useCreateFolder';
import { useAppStore } from '../../../../../zustand/app';

interface IAddFolderModalProps {
  toggleModalOpen: (isOpen?: boolean) => void;
  open: boolean;
  type: string;
}

export const AddFolderModal: FC<IAddFolderModalProps> = ({
  toggleModalOpen,
  open,
}) => {
  const { relevantFolderId, relevantCaseId, folderType } = useAppStore();

  const [folderName, setFolderName] = useState<string>('');

  const {
    data: casesData,
    isLoading: isCasesLoading,
    error: caseError,
    refetch,
  } = useGetCases({ userId: '649648ac4cea1cc6acc1e35e' });

  const { isLoading, error, createFolder } = useCreateFolder({
    caseId: relevantCaseId as string,
    parentId: relevantFolderId,
    name: folderName,
    userId: '649648ac4cea1cc6acc1e35e',
    refetch,
    type: folderType as string,
  });

  const handleFolderNameChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFolderName(e.target.value);
  };

  const isCreateEnabled = useMemo(
    () => relevantCaseId && folderName,
    [folderName, relevantCaseId],
  );

  const flattenFolders = (folders: any) => {
    let flatArray: any[] = [];

    folders.forEach((folder: any) => {
      flatArray.push(folder);

      if (folder.folders) {
        flatArray = [...flatArray, ...flattenFolders(folder.folders)];
      }
    });

    return flatArray;
  };

  return (
    <TakeoverModal open={open} toggleModalOpen={toggleModalOpen}>
      <Stack spacing={2}>
        <Typography alignContent={'center'} variant="h5">
          Add Folder
        </Typography>
        <Tooltip
          enterNextDelay={500}
          enterDelay={500}
          title="Title your new folder."
        >
          <TextField
            label={
              <Typography component="span" variant="body1">
                Folder Name
              </Typography>
            }
            required
            multiline
            variant="outlined"
            placeholder="Folder Name..."
            value={folderName}
            onChange={handleFolderNameChange}
          />
        </Tooltip>
        <Button
          sx={{ pt: '12px', pb: '12px' }}
          variant="contained"
          color="primary"
          disabled={!isCreateEnabled}
          onClick={async () => {
            await createFolder();
            toggleModalOpen(false);
          }}
        >
          {isLoading ? <CircularProgress /> : 'Create Folder'}
        </Button>
      </Stack>
    </TakeoverModal>
  );
};
