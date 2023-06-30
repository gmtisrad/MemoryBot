import { Container } from '@mui/material';
import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { PDFRenderer } from '../../shared/PDFRenderer';
import { useGetBase64PDF } from '../../../queries/useGetBase64PDF';

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

  const { data } = useGetBase64PDF({ documentId });

  console.log({ data });

  return (
    <Container
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <PDFRenderer pdfUrl={data?.url} />
    </Container>
  );
};
