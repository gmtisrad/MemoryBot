import { FC, useMemo, useState } from 'react';
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
import { useParams } from 'react-router-dom';

function renderFolderMenuItems(folders: any[], paddingLeft = 0) {
  return folders.flatMap((folder: any) => {
    // Generate MenuItem for the current folder
    const folderItem = (
      <MenuItem
        sx={{ paddingLeft: `${paddingLeft}px` }}
        key={folder._id}
        value={folder._id}
      >
        {folder.name}
      </MenuItem>
    );

    // If there are subfolders, generate their MenuItems using recursion
    const subfolderItems: any[] = folder.folders.length
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
  const { caseId: caseIdParam, folderId: folderIdParam } = useParams<{
    caseId: string;
    folderId: string;
  }>();

  const [inputFile, setInputFile] = useState<File | null>(null);
  const [documentCaseId, setDocumentCaseId] = useState<string>(
    caseIdParam || '',
  );
  const [documentFolderId, setDocumentFolderId] = useState<string>(
    folderIdParam || '',
  );

  console.log({ folderIdParam, caseIdParam });

  const {
    isLoading: isCasesLoading,
    data: casesData,
    refetch,
  } = useGetCases({
    userId: '649648ac4cea1cc6acc1e35e',
  });

  const { uploadDocument, isLoading: isDocumentUploading } = useUploadDocument({
    caseId: caseIdParam || documentCaseId,
    folderId: documentFolderId,
    userId: '649648ac4cea1cc6acc1e35e',
    file: inputFile,
    refetch,
  });

  const uploadEnabled = useMemo(
    () => (caseIdParam || documentCaseId) && inputFile,
    [caseIdParam, documentCaseId, inputFile],
  );

  const handleInputFileChange = (file: File | null) => {
    setInputFile(file);
  };

  const handleDocumentCaseIdChange = (e: SelectChangeEvent) => {
    console.log({ e });
    setDocumentCaseId(e.target.value);
  };

  const handleDocumentFolderIdChange = (e: SelectChangeEvent) => {
    console.log({ e });
    setDocumentFolderId(e.target.value);
  };

  const relevantCase = useMemo(() => {
    return casesData?.cases.find((c: any) => c._id === documentCaseId);
  }, [casesData?.cases, documentCaseId]);

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
        {!caseIdParam && (
          <Tooltip
            enterNextDelay={500}
            enterDelay={500}
            title="Which case are you adding this document to?"
          >
            <FormControl variant="outlined" fullWidth required>
              <InputLabel
                sx={{ backgroundColor: '#f7f7f8' }}
                id="document-case-id-label"
              >
                Which case does this document belong to?
              </InputLabel>
              <Select
                labelId="document-case-id-label"
                id="document-case-id"
                required
                multiline
                placeholder="Case Name..."
                value={documentCaseId}
                onChange={handleDocumentCaseIdChange}
              >
                {!isCasesLoading &&
                  casesData?.cases.map((caseData: any, idx: number) => (
                    <MenuItem key={caseData._id} value={caseData._id}>
                      {caseData.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Tooltip>
        )}
        {!folderIdParam && (
          <Tooltip
            enterNextDelay={500}
            enterDelay={500}
            title="Which folder would you like to add your document to?"
          >
            <FormControl variant="outlined" fullWidth>
              <InputLabel
                sx={{ backgroundColor: '#f7f7f8' }}
                id="document-folder-id-label"
              >
                Which folder?
              </InputLabel>
              <Select
                labelId="document-folder-id-label"
                id="document-folder-id"
                multiline
                placeholder="Folder Name..."
                value={documentFolderId}
                onChange={handleDocumentFolderIdChange}
              >
                <MenuItem sx={{ paddingLeft: '24px' }} value={''}>
                  None
                </MenuItem>
                {!isCasesLoading &&
                  relevantCase &&
                  renderFolderMenuItems(relevantCase.folders, 24)}
              </Select>
            </FormControl>
          </Tooltip>
        )}
        <Button
          sx={{ pt: '12px', pb: '12px' }}
          variant="contained"
          color="primary"
          disabled={!uploadEnabled}
          onClick={async () => {
            await uploadDocument();
            setDocumentCaseId('');
            setDocumentFolderId('');
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
