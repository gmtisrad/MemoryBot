import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { ChangeEvent, FC, useMemo, useState } from 'react';
import { TakeoverModal } from '../../../../shared/TakeoverModal';
import { useGetCases } from '../../../../../queries/useGetCases';
import { useCreateFolder } from '../../../../../mutations/useCreateFolder';

interface IAddFolderModalProps {
  toggleModalOpen: (isOpen?: boolean) => void;
  open: boolean;
}

export const AddFolderModal: FC<IAddFolderModalProps> = ({
  toggleModalOpen,
  open,
}) => {
  const [caseId, setCaseId] = useState<string>('');
  const [parentFolderId, setParentFolderId] = useState<string>('');
  const [folderName, setFolderName] = useState<string>('');

  const {
    data: casesData,
    isLoading: isCasesLoading,
    error: caseError,
    refetch,
  } = useGetCases({ userId: '6483e65fd24b426cd772ce1c' });

  const { isLoading, error, createFolder } = useCreateFolder({
    caseId,
    parentId: parentFolderId,
    name: folderName,
    userId: '6483e65fd24b426cd772ce1c',
    refetch,
  });

  const handleParentFolderIdChange = (e: SelectChangeEvent) => {
    setParentFolderId(e.target.value);
  };

  const handleCaseIdChange = (e: SelectChangeEvent) => {
    setCaseId(e.target.value);
  };

  const handleFolderNameChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFolderName(e.target.value);
  };

  const isCreateEnabled = useMemo(
    () => caseId && folderName,
    [caseId, folderName],
  );

  const relevantCase = useMemo(() => {
    return casesData?.cases.find((c: any) => c._id === caseId);
  }, [caseId, casesData?.cases]);

  return (
    <TakeoverModal open={open} toggleModalOpen={toggleModalOpen}>
      <Stack spacing={2}>
        <Typography alignContent={'center'} variant="h5">
          Folders
        </Typography>
        <Tooltip
          enterNextDelay={500}
          enterDelay={500}
          title="What case to add the folder?"
        >
          <FormControl variant="outlined" fullWidth required>
            <InputLabel sx={{ backgroundColor: '#f7f7f8' }} id="case-id-label">
              Which case?
            </InputLabel>
            <Select
              labelId="case-id-label"
              id="case-id"
              required
              multiline
              placeholder="Case Name..."
              value={caseId}
              onChange={handleCaseIdChange}
            >
              {!isCasesLoading &&
                casesData?.cases.flatMap((caseData: any) => (
                  <MenuItem key={caseData._id} value={caseData._id}>
                    {caseData.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Tooltip>
        <Tooltip
          enterNextDelay={500}
          enterDelay={500}
          title="Where to add the folder?"
        >
          <FormControl variant="outlined" fullWidth>
            <InputLabel
              sx={{ backgroundColor: '#f7f7f8' }}
              id="parent-folder-id-label"
            >
              Which folder?
            </InputLabel>
            <Select
              labelId="parent-folder-id-label"
              id="parent-folder-id"
              multiline
              disabled={!relevantCase}
              placeholder="Folder Name..."
              value={parentFolderId}
              onChange={handleParentFolderIdChange}
            >
              {!isCasesLoading &&
                relevantCase?.folders.map(
                  (folder: any) =>
                    !folder.parent && (
                      <MenuItem key={folder._id} value={folder._id}>
                        {folder.name}
                      </MenuItem>
                    ),
                )}
            </Select>
          </FormControl>
        </Tooltip>
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
