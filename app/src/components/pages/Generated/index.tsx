import { Box, CircularProgress, Container, Typography } from '@mui/material';
import { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useGetGeneratedDocument } from '../../../queries/useGetGeneratedDocument';
import { useGetCases } from '../../../queries/useGetCases';

// caseDetails,
// numResults,
// previousMessages,
// cityName,
// stateName,
// documentType,
// partyA,
// partyB,
// sections,

export const Generated: FC = () => {
  const { caseId, generatedDocumentId } = useParams();

  const { data, isLoading, error } = useGetCases({
    userId: '6483e65fd24b426cd772ce1c',
  });

  const generatedDocumentContent = useMemo(() => {
    return data?.cases
      ?.find((_case: any) => _case._id === caseId)
      ?.generatedDocuments.find(
        (generatedDocument: any) =>
          generatedDocument._id === generatedDocumentId,
      )?.generatedContent;
  }, [caseId, data?.cases, generatedDocumentId]);

  console.log({
    response: data,
    generatedDocumentContent,
    generatedDocumentId,
  });

  return (
    <Container
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          border: '1px solid black',
          mb: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: `${isLoading ? 'center' : 'flex-start'}`,
          // height: '714px',
          // width: '552px',
          width: '8.5in',
          height: '11in',
          overflowY: 'auto',
        }}
      >
        {!data && !isLoading && (
          <Typography variant="h4">
            Fill in your document information
          </Typography>
        )}
        {!data && isLoading && <CircularProgress />}
        {data && !isLoading && (
          <iframe
            style={{ height: '100%', width: '100%' }}
            srcDoc={generatedDocumentContent}
          />
        )}
        {/* <Box sx={{ transform: 'scale(0.6)', position: 'absolute', top: '0px' }}>
          <div dangerouslySetInnerHTML={{ __html: data?.response }} />
        </Box> */}
      </Box>
    </Container>
  );
};
