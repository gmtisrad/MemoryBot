import { FC, ReactNode, useMemo, useState } from 'react';
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
// TODO: Fix this import type
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { MuiFileInput } from 'mui-file-input';
import { useGetCases } from '../../../../../queries/useGetCases';
import { useUploadDocument } from '../../../../../mutations/useUploadDocument';
import { TakeoverModal } from '../../../../shared/TakeoverModal';
import { useAppStore } from '../../../../../zustand/app';
import { IFolder } from '../../../../../types/app';

function renderFolderMenuItems(folders: IFolder[], paddingLeft = 0) {
  return folders.flatMap((folder: IFolder) => {
    // Generate MenuItem for the current folder
    const folderItem = (
      <MenuItem
        sx={{ paddingLeft: `${paddingLeft}px` }}
        key={`folder-option-${folder._id}`}
        value={folder._id}
      >
        {folder.name}
      </MenuItem>
    );

    // If there are subfolders, generate their MenuItems using recursion
    const subfolderItems: ReactNode[] = folder.folders.length
      ? renderFolderMenuItems(folder.folders, paddingLeft + 24)
      : [];

    return [folderItem, ...subfolderItems];
  });
}

interface IAddDocumentModalProps {
  open: boolean;
  toggleModalOpen: (isOpen?: boolean) => void;
}

export const AddDocumentModal: FC<IAddDocumentModalProps> = ({
  open,
  toggleModalOpen,
}) => {
  const { relevantCaseId, relevantFolderId } = useAppStore();

  const [inputFile, setInputFile] = useState<File | null>(null);

  const {
    isLoading: isCasesLoading,
    data: casesData,
    refetch,
  } = useGetCases({
    userId: '649648ac4cea1cc6acc1e35e',
  });

  const { uploadDocument, isLoading: isDocumentUploading } = useUploadDocument({
    caseId: relevantCaseId as string,
    folderId: relevantFolderId || '',
    userId: '649648ac4cea1cc6acc1e35e',
    file: inputFile,
    refetch,
  });

  const uploadEnabled = useMemo(
    () => relevantCaseId && inputFile,
    [inputFile, relevantCaseId],
  );

  const handleInputFileChange = (file: File | null) => {
    setInputFile(file);
  };

  return (
    <TakeoverModal toggleModalOpen={toggleModalOpen} open={open}>
      <Stack spacing={2}>
        <Typography alignContent={'center'} variant="h5">
          Documents
        </Typography>
        <Tooltip
          enterNextDelay={500}
          enterDelay={500}
          title="Upload a document you think your AI partner should know about. Scanned PDFs are currently not supported. Supported filetypes: .pdf, .docx, .txt."
        >
          <div>
            <MuiFileInput
              label="Upload Document"
              value={inputFile}
              onChange={handleInputFileChange}
              placeholder=".pdf, .docx, .txt..."
            />
          </div>
        </Tooltip>
        <Button
          sx={{ pt: '12px', pb: '12px' }}
          variant="contained"
          color="primary"
          disabled={!uploadEnabled}
          onClick={async () => {
            await uploadDocument();
            setInputFile(null);
            toggleModalOpen(false);
          }}
        >
          {isDocumentUploading ? <CircularProgress /> : 'Upload Document'}
        </Button>
      </Stack>
    </TakeoverModal>
  );
};
