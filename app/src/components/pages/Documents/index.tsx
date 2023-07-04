import { Box } from '@mui/material';
import { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useGetBase64PDF } from '../../../queries/useGetBase64PDF';
import { DocumentViewer } from '../../shared/DocumentViewer';
import { useGetDocument } from '../../../queries/useGetDocument';

// caseDetails,
// numResults,
// previousMessages,
// cityName,
// stateName,
// documentType,
// partyA,
// partyB,
// sections,

export const Documents: FC = () => {
  const { documentId } = useParams<{ documentId: string }>();

  const { data: documentEntry, isLoading } = useGetDocument({ documentId });

  const { data, isLoading: isUriLoading } = useGetBase64PDF({ documentId });

  const docs = useMemo(
    () => [{ uri: data?.url || '', fileName: documentEntry?.document?.name }],
    [data?.url, documentEntry?.document?.name],
  );

  return (
    <Box
      sx={{
        paddingLeft: 0,
        paddingRight: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* <PDFRenderer pdfUrl={data?.url} /> */}
      <DocumentViewer docs={docs} />
    </Box>
  );
};
